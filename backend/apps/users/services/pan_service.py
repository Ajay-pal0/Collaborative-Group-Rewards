import logging
from typing import Any
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.common.integrations.client import ExternalApiClient
from apps.common.security import validate_pan_format, mask_pan
from apps.users.models import User, PanVerification

logger = logging.getLogger('users.pan_service')



class SetuPanVerificationService:
    """
    Dedicated integration service for Setu PAN verification API.
    Interacts with Setu exclusively via the centralized ExternalApiClient.
    """

    PROVIDER = 'setu'
    API_NAME = 'pan_verification'

    def __init__(self, client: ExternalApiClient | None = None):
        self.client = client or ExternalApiClient(default_timeout=15)
        self.verify_url = getattr(
            settings,
            'SETU_PAN_VERIFY_URL',
            'https://dg-sandbox.setu.co/api/verify/pan'
        )
        self.client_id = getattr(settings, 'SETU_CLIENT_ID', '810bb42a-e09f-490a-838e-d9212a7966de')
        self.client_secret = getattr(settings, 'SETU_CLIENT_SECRET', 'wARjJ7E6kMPD8YmrNTx7w7afMQCijB3t')
        self.product_instance_id = getattr(settings, 'SETU_PRODUCT_INSTANCE_ID', '9578859d-c667-43f3-8712-c92df29998d9')

    def verify_pan(self, pan: str, reason: str = 'Verification of user PAN for reward distribution') -> dict[str, Any]:
        """
        Executes external verification with Setu.
        Returns a dictionary with status, parsed details, and error message.
        """
        clean_pan = str(pan).strip().upper()

        logger.info(
            "Initiating Setu PAN verification for PAN %s | URL: %s | Client ID configured: %s | Secret configured: %s | Instance ID configured: %s",
            mask_pan(clean_pan),
            self.verify_url,
            bool(self.client_id),
            bool(self.client_secret),
            bool(self.product_instance_id),
        )

        headers = {
            'Content-Type': 'application/json',
            'x-client-id': self.client_id,
            'x-client-secret': self.client_secret,
            'x-product-instance-id': self.product_instance_id,
        }

        payload = {
            'pan': clean_pan,
            'consent': 'Y',
            'reason': reason,
        }

        response = self.client.execute(
            provider=self.PROVIDER,
            api_name=self.API_NAME,
            method='POST',
            url=self.verify_url,
            headers=headers,
            json_data=payload,
            timeout=15,
        )

        if response.is_timeout:
            logger.warning(
                "Setu PAN verification timed out for PAN %s after %sms",
                mask_pan(clean_pan),
                getattr(response, 'duration_ms', 0),
            )
            return {
                'success': False,
                'is_timeout': True,
                'error': 'PAN verification service is temporarily unavailable. Please try again later.',
                'status_code': 503,
                'response': response,
            }

        if not response.is_success or not isinstance(response.data, dict):
            # Parse provider failure message safely
            err_msg = 'Unable to verify PAN at this time. Please try again later.'
            provider_msg = None
            if isinstance(response.data, dict):
                provider_msg = response.data.get('message') or response.data.get('error')
                if provider_msg:
                    err_msg = str(provider_msg)

            # Map external provider status codes: NEVER return 401/403 to frontend client
            if response.status_code in (401, 403):
                client_status = 502
                if provider_msg:
                    err_msg = f'External PAN verification configuration error: {provider_msg}. Please verify SETU_CLIENT_ID, SETU_CLIENT_SECRET, and SETU_PRODUCT_INSTANCE_ID in your server environment.'
                else:
                    err_msg = 'External PAN verification configuration error. Please verify SETU_CLIENT_ID, SETU_CLIENT_SECRET, and SETU_PRODUCT_INSTANCE_ID in your server environment.'
            elif response.status_code and response.status_code >= 500:
                client_status = 502
                err_msg = 'External PAN verification service error. Please try again later.'
            else:
                client_status = 400

            logger.error(
                "Setu PAN verification API rejected request for PAN %s: HTTP %s | provider_error='%s'",
                mask_pan(clean_pan),
                response.status_code,
                provider_msg or response.data,
            )

            return {
                'success': False,
                'is_timeout': False,
                'error': err_msg,
                'status_code': client_status,
                'response': response,
            }

        res_data = response.data
        verification_status = str(res_data.get('verification', '')).upper()

        if verification_status != 'SUCCESS':
            failure_reason = res_data.get('message') or 'PAN verification was unsuccessful.'
            logger.warning(
                "Setu PAN verification non-SUCCESS for PAN %s: status='%s' reason='%s'",
                mask_pan(clean_pan),
                verification_status,
                failure_reason,
            )
            return {
                'success': False,
                'is_timeout': False,
                'error': failure_reason,
                'status_code': 400,
                'response': response,
            }

        pan_info = res_data.get('data', {}) or {}
        full_name = (
            pan_info.get('full_name')
            or ' '.join(filter(None, [
                pan_info.get('first_name'),
                pan_info.get('middle_name'),
                pan_info.get('last_name')
            ]))
            or ''
        ).strip()

        logger.info(
            "Setu PAN verification successful for PAN %s: Name='%s' ID='%s' Trace='%s'",
            mask_pan(clean_pan),
            full_name,
            str(res_data.get('id', '')),
            str(res_data.get('traceId', '')),
        )

        return {
            'success': True,
            'is_timeout': False,
            'verification_id': str(res_data.get('id', '')),
            'full_name': full_name,
            'category': pan_info.get('category', ''),
            'aadhaar_seeding_status': pan_info.get('aadhaar_seeding_status', ''),
            'trace_id': str(res_data.get('traceId', '')),
            'response': response,
        }


def verify_user_pan(
    user: User,
    pan: str,
    service: SetuPanVerificationService | None = None
) -> dict[str, Any]:
    """
    Main business transaction for PAN verification:
    1. Validates PAN structure.
    2. Enforces concurrency protection & idempotency via database row lock.
    3. Calls external verification service if not already verified.
    4. Updates user profile atomically upon success.
    5. Returns clean application-level response.
    """
    if not pan:
        return {
            'success': False,
            'error': 'PAN number is required.',
            'status_code': 400,
        }

    clean_pan = str(pan).strip().upper()
    if not validate_pan_format(clean_pan):
        return {
            'success': False,
            'error': 'Invalid PAN format. Expected format is 5 letters, 4 digits, 1 letter (e.g. ABCDE1234A).',
            'status_code': 400,
        }

    pan_service = service or SetuPanVerificationService()

    with transaction.atomic():
        # Lock user record to prevent concurrent duplicate verification requests
        locked_user = User.objects.select_for_update().get(id=user.id)

        # Check if record exists and is verified
        pan_record = PanVerification.objects.select_for_update().filter(user=locked_user).first()
        if pan_record and pan_record.is_verified:
            logger.info(
                "Idempotent check: User %s already has verified PAN (%s), skipping external API call",
                locked_user.email,
                pan_record.pan_masked,
            )
            return {
                'success': True,
                'message': 'PAN is already verified.',
                'data': {
                    'pan_verified': True,
                    'pan_masked': pan_record.pan_masked,
                    'name': pan_record.registered_name,
                    'verified_at': pan_record.verified_at.isoformat() if pan_record.verified_at else None,
                    'already_verified': True,
                },
                'status_code': 200,
            }

        logger.info(
            "Calling Setu PAN service for user %s with PAN %s",
            locked_user.email,
            mask_pan(clean_pan),
        )

        # Call Setu PAN API via the external integration layer
        result = pan_service.verify_pan(clean_pan)

        if not result['success']:
            logger.warning(
                "PAN verification rejected for user %s (%s): %s",
                locked_user.email,
                mask_pan(clean_pan),
                result.get('error'),
            )
            return {
                'success': False,
                'error': result.get('error', 'PAN verification failed.'),
                'status_code': result.get('status_code', 400),
            }

        # Successful verification: update or create PanVerification record
        now = timezone.now()
        if not pan_record:
            pan_record = PanVerification(user=locked_user)

        pan_record.pan_number = clean_pan
        pan_record.is_verified = True
        pan_record.verified_at = now
        pan_record.verification_id = result.get('verification_id', '')
        pan_record.registered_name = result.get('full_name', '')
        pan_record.category = result.get('category', '')
        pan_record.aadhaar_seeding_status = result.get('aadhaar_seeding_status', '')
        pan_record.save()

        logger.info(
            "PAN verification successfully persisted for user %s: %s (name: %s)",
            locked_user.email,
            pan_record.pan_masked,
            pan_record.registered_name,
        )

        return {
            'success': True,
            'message': 'PAN verified successfully.',
            'data': {
                'pan_verified': True,
                'pan_masked': pan_record.pan_masked,
                'name': pan_record.registered_name,
                'verified_at': pan_record.verified_at.isoformat(),
                'already_verified': False,
            },
            'status_code': 200,
        }

