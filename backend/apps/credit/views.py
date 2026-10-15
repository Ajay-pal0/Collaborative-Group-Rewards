import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.credit.serializers import CreditReportRequestSerializer
from apps.credit.services.credit_service import (
    get_user_credit_profile,
    request_user_credit_report,
)

logger = logging.getLogger('credit.views')


def get_client_ip(request) -> str | None:
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class CreditProfileView(APIView):
    """
    GET /api/v1/credit/profile/
    Fetches the authenticated user's credit profile (score, bands, accounts, balances).
    Only populates fields verified from an authorized report.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_user_credit_profile(request.user)
        return Response(profile, status=status.HTTP_200_OK)


class CreditReportView(APIView):
    """
    POST /api/v1/credit/report/
    Submits user consent and initiates a credit report inquiry.
    Expects { "consent": true, "purpose": "..." (optional) }.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreditReportRequestSerializer(data=request.data)
        if not serializer.is_valid():
            err_msg = 'Informed consent is required.'
            if 'consent' in serializer.errors:
                err_msg = serializer.errors['consent'][0]
            return Response(
                {
                    'success': False,
                    'error': err_msg,
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        consent = serializer.validated_data['consent']
        ip_addr = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        result = request_user_credit_report(
            user=request.user,
            consent=consent,
            ip_address=ip_addr,
            user_agent=user_agent,
        )

        http_status = result.get('status_code', status.HTTP_200_OK)
        return Response(result, status=http_status)
