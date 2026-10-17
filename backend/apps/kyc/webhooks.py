import hmac
import hashlib
import json
import logging
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.kyc.models import (
    IdentityVerification,
    IdentityVerificationAudit,
    VerificationStatus,
    VerificationType,
)
from apps.kyc.services.surepass_service import SurepassIntegrationService

logger = logging.getLogger('kyc.webhooks')


class DigilockerWebhookView(APIView):
    """
    POST /api/webhooks/surepass/digilocker
    Handles asynchronous webhook notifications from Surepass DigiLocker.
    Validates payload authenticity, ensures idempotent execution, and updates verification state.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        secret = getattr(settings, 'SUREPASS_WEBHOOK_SECRET', '')
        if secret:
            sig = request.headers.get('X-Surepass-Signature') or request.headers.get('X-Webhook-Signature')
            if not sig:
                logger.warning("DigiLocker webhook rejected: Missing signature header.")
                return Response(
                    {'success': False, 'error': 'Signature header missing.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            expected_sig = hmac.new(
                secret.encode('utf-8'),
                request.body,
                hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(sig, expected_sig):
                logger.warning("DigiLocker webhook rejected: Signature mismatch.")
                return Response(
                    {'success': False, 'error': 'Invalid signature.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        payload = request.data
        if not isinstance(payload, dict):
            return Response(
                {'success': False, 'error': 'Invalid JSON body.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        client_id = (
            payload.get('client_id')
            or payload.get('data', {}).get('client_id')
            or payload.get('provider_reference')
        )
        event_status = (
            payload.get('status')
            or payload.get('data', {}).get('status')
            or payload.get('event')
            or ''
        ).lower()

        logger.info(
            "Received DigiLocker webhook for client_id: %s | event_status: %s",
            client_id,
            event_status
        )

        if not client_id:
            return Response(
                {'success': False, 'error': 'client_id not present in payload.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record = IdentityVerification.objects.filter(
            provider_reference=client_id,
            verification_type=VerificationType.AADHAAR
        ).first()

        if not record:
            # If not found by provider_reference, check if client_id is in metadata
            record = IdentityVerification.objects.filter(
                metadata__client_id=client_id,
                verification_type=VerificationType.AADHAAR
            ).first()

        if not record:
            logger.info("DigiLocker webhook: No matching verification record for %s", client_id)
            return Response(
                {'success': True, 'message': 'Acknowledged, record not found.'},
                status=status.HTTP_200_OK
            )

        # Idempotency check: if already verified, do not alter
        if record.status == VerificationStatus.VERIFIED:
            logger.info("DigiLocker webhook: Record %s is already verified. Idempotent return.", record.id)
            return Response(
                {'success': True, 'message': 'Already verified.'},
                status=status.HTTP_200_OK
            )

        # Determine outcome from server confirmation
        surepass_service = SurepassIntegrationService()
        verification_result = surepass_service.fetch_digilocker_status(client_id)

        status_before = record.status
        now = timezone.now()

        if verification_result.get('success'):
            record.status = VerificationStatus.VERIFIED
            record.masked_id = verification_result.get('masked_id', record.masked_id or 'XXXXXXXX1234')
            record.registered_name = verification_result.get('full_name', record.registered_name)
            record.metadata.update(verification_result.get('metadata', {}))
            record.verified_at = now
            record.error_message = ''
            record.save()

            IdentityVerificationAudit.objects.create(
                verification=record,
                user=record.user,
                verification_type=VerificationType.AADHAAR,
                action='WEBHOOK_CONFIRMED_SUCCESS',
                status_before=status_before,
                status_after=VerificationStatus.VERIFIED,
                provider_reference=client_id,
                details={'webhook_event': event_status},
            )
            logger.info("DigiLocker webhook successfully verified record %s for user %s", record.id, record.user.email)
        elif event_status in ('failed', 'failure', 'cancelled', 'expired'):
            record.status = VerificationStatus.FAILED
            record.error_message = f'DigiLocker verification failed ({event_status}).'
            record.save()

            IdentityVerificationAudit.objects.create(
                verification=record,
                user=record.user,
                verification_type=VerificationType.AADHAAR,
                action='WEBHOOK_CONFIRMED_FAILED',
                status_before=status_before,
                status_after=VerificationStatus.FAILED,
                provider_reference=client_id,
                details={'webhook_event': event_status},
            )

        return Response({'success': True, 'message': 'Webhook processed.'}, status=status.HTTP_200_OK)
