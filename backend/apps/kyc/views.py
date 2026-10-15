import logging
from django.conf import settings
from django.http import HttpResponseRedirect
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.kyc.serializers import (
    PanVerifySerializer,
    AadhaarInitiateSerializer,
    AadhaarVerifySerializer,
)
from apps.kyc.services.kyc_service import (
    get_user_kyc_status,
    verify_user_pan,
    initiate_user_aadhaar,
    confirm_user_aadhaar,
    cancel_user_aadhaar,
)

logger = logging.getLogger('kyc.views')


def get_client_ip(request) -> str | None:
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class KycStatusView(APIView):
    """
    GET /api/v1/kyc/status/
    Retrieves the authenticated user's unified Aadhaar and PAN verification statuses and badges.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_status = get_user_kyc_status(request.user)
        return Response({
            'success': True,
            'verifications': user_status,
        }, status=status.HTTP_200_OK)


class PanVerifyView(APIView):
    """
    POST /api/v1/kyc/pan/verify/
    Verifies the authenticated user's PAN via Surepass PAN Comprehensive endpoint.
    Expects { "pan_number": "...", "consent": true }.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PanVerifySerializer(data=request.data)
        if not serializer.is_valid():
            err_msg = 'Invalid input.'
            if 'pan_number' in serializer.errors:
                err_msg = serializer.errors['pan_number'][0]
            elif 'consent' in serializer.errors:
                err_msg = serializer.errors['consent'][0]

            return Response(
                {
                    'success': False,
                    'verification_type': 'pan',
                    'status': 'failed',
                    'error': err_msg,
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        pan_number = serializer.validated_data['pan_number']
        consent = serializer.validated_data['consent']
        ip_addr = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        result = verify_user_pan(
            user=request.user,
            pan=pan_number,
            consent=consent,
            ip_address=ip_addr,
            user_agent=user_agent,
        )

        http_status = result.get('status_code', status.HTTP_200_OK)
        return Response(result, status=http_status)


class AadhaarInitiateView(APIView):
    """
    POST /api/v1/kyc/aadhaar/initiate/
    Initiates Surepass DigiLocker Link flow for Aadhaar identity verification.
    Expects { "consent": true, "redirect_url": "..." (optional) }.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AadhaarInitiateSerializer(data=request.data)
        if not serializer.is_valid():
            err_msg = 'Consent is required to initiate Aadhaar verification.'
            if 'consent' in serializer.errors:
                err_msg = serializer.errors['consent'][0]

            return Response(
                {
                    'success': False,
                    'verification_type': 'aadhaar',
                    'status': 'failed',
                    'error': err_msg,
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        consent = serializer.validated_data['consent']
        redirect_url = serializer.validated_data.get('redirect_url')
        ip_addr = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        result = initiate_user_aadhaar(
            user=request.user,
            redirect_url=redirect_url,
            consent=consent,
            ip_address=ip_addr,
            user_agent=user_agent,
        )

        http_status = result.get('status_code', status.HTTP_200_OK)
        return Response(result, status=http_status)


class AadhaarVerifyView(APIView):
    """
    POST /api/v1/kyc/aadhaar/verify/
    Confirms or polls the Aadhaar verification result after the user completes the DigiLocker step.
    Expects { "client_id": "..." (optional if tracked on user session) }.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AadhaarVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'verification_type': 'aadhaar',
                    'status': 'failed',
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_id = serializer.validated_data.get('client_id')
        ip_addr = get_client_ip(request)

        result = confirm_user_aadhaar(
            user=request.user,
            client_id=client_id,
            ip_address=ip_addr,
        )

        http_status = result.get('status_code', status.HTTP_200_OK)
        return Response(result, status=http_status)


class AadhaarCallbackView(APIView):
    """
    GET /api/v1/kyc/aadhaar/callback/
    Handles provider callback/redirect from DigiLocker.
    Receives query parameters (e.g. client_id, status) and redirects to frontend callback screen.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        client_id = request.query_params.get('client_id', '')
        provider_status = request.query_params.get('status', 'success')
        frontend_base = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')

        # If user is authenticated via cookie/session, confirm immediately
        if request.user and request.user.is_authenticated and client_id:
            try:
                confirm_user_aadhaar(
                    user=request.user,
                    client_id=client_id,
                    ip_address=get_client_ip(request),
                )
            except Exception as e:
                logger.warning("Error confirming Aadhaar in callback view: %s", e)

        redirect_target = f"{frontend_base}/kyc/callback?client_id={client_id}&status={provider_status}"
        return HttpResponseRedirect(redirect_target)


class AadhaarCancelView(APIView):
    """
    POST /api/kyc/aadhaar/cancel/
    Cancels an active or pending Aadhaar verification attempt.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        client_id = request.data.get('client_id')
        ip_addr = get_client_ip(request)
        result = cancel_user_aadhaar(
            user=request.user,
            client_id=client_id,
            ip_address=ip_addr,
        )
        return Response(result, status=result.get('status_code', status.HTTP_200_OK))


class KycCreditReportView(APIView):
    """
    GET /api/kyc/credit-report/
    POST /api/kyc/credit-report/
    Retrieves or requests credit information for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.credit.services.credit_service import get_user_credit_profile
        profile = get_user_credit_profile(request.user)
        return Response(profile, status=status.HTTP_200_OK)

    def post(self, request):
        from apps.credit.services.credit_service import request_user_credit_report
        consent = request.data.get('consent', False)
        purpose = request.data.get('purpose', 'Collaborative Group Rewards Financial Assessment')
        ip_addr = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        result = request_user_credit_report(
            user=request.user,
            consent=consent,
            purpose=purpose,
            ip_address=ip_addr,
            user_agent=user_agent,
        )
        http_status = result.get('status_code', status.HTTP_200_OK)
        return Response(result, status=http_status)
