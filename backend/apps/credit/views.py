import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.credit.serializers import CreditReportRequestSerializer
from apps.credit.services.credit_service import (
    get_user_credit_profile,
    get_user_detailed_credit_report,
    request_user_cibil_score,
    request_user_detailed_cibil_report,
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


class CreditScoreView(APIView):
    """
    POST /api/v1/credit/score/
    Requests latest CIBIL credit score (Endpoint A: /api/v1/credit-report-cibil/score).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreditReportRequestSerializer(data=request.data)
        if not serializer.is_valid():
            err_msg = 'Informed affirmative consent is required.'
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

        data = serializer.validated_data
        ip_addr = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        result = request_user_cibil_score(
            user=request.user,
            consent=data['consent'],
            purpose=data.get('purpose', 'CIBIL Credit Score Assessment'),
            ip_address=ip_addr,
            user_agent=user_agent,
            pan=data.get('pan'),
            mobile=data.get('mobile'),
            name=data.get('name'),
            gender=data.get('gender', 'male'),
        )

        http_status = result.get('status_code', status.HTTP_200_OK)
        return Response(result, status=http_status)


class CreditFullReportView(APIView):
    """
    GET & POST /api/v1/credit/full-report/
    POST: Requests detailed CIBIL report (Endpoint B: /api/v1/credit-report-cibil/fetch-report)
    GET: Retrieves authenticated user's stored detailed credit report.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        report = get_user_detailed_credit_report(request.user)
        http_status = report.get('status_code', status.HTTP_200_OK)
        return Response(report, status=http_status)

    def post(self, request):
        serializer = CreditReportRequestSerializer(data=request.data)
        if not serializer.is_valid():
            err_msg = 'Informed affirmative consent is required.'
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

        data = serializer.validated_data
        ip_addr = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        result = request_user_detailed_cibil_report(
            user=request.user,
            consent=data['consent'],
            purpose=data.get('purpose', 'Detailed CIBIL Report Inquiry'),
            ip_address=ip_addr,
            user_agent=user_agent,
            pan=data.get('pan'),
            mobile=data.get('mobile'),
            name=data.get('name'),
            gender=data.get('gender', 'male'),
        )

        http_status = result.get('status_code', status.HTTP_200_OK)
        return Response(result, status=http_status)


class CreditReportView(APIView):
    """
    POST /api/v1/credit/report/
    Backward-compatible unified endpoint supporting score or full report.
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

        data = serializer.validated_data
        ip_addr = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        result = request_user_credit_report(
            user=request.user,
            consent=data['consent'],
            purpose=data.get('purpose', 'Credit Assessment'),
            report_type=data.get('report_type', 'score'),
            ip_address=ip_addr,
            user_agent=user_agent,
            pan=data.get('pan'),
            mobile=data.get('mobile'),
            name=data.get('name'),
            gender=data.get('gender', 'male'),
        )

        http_status = result.get('status_code', status.HTTP_200_OK)
        return Response(result, status=http_status)
