import logging
import re
from typing import Any
from django.conf import settings

from apps.common.integrations.client import ExternalApiClient, ExternalApiResponse
from apps.common.security import mask_pan

logger = logging.getLogger('credit.cibil_service')


def mask_account_number(acc_num: str | None) -> str:
    """Masks credit card / loan account number to protect privacy."""
    if not acc_num:
        return 'XXXXXXXXXXXX'
    cleaned = str(acc_num).strip()
    if len(cleaned) <= 4:
        return 'XXXX' + cleaned
    return 'X' * (len(cleaned) - 4) + cleaned[-4:]


def mask_phone_number(phone: str | None) -> str:
    """Masks telephone number keeping only last 4 digits visible."""
    if not phone:
        return 'XXXXXX0000'
    cleaned = re.sub(r'\D', '', str(phone))
    if len(cleaned) <= 4:
        return '******' + cleaned
    return '*' * (len(cleaned) - 4) + cleaned[-4:]


def determine_cibil_band(score: int | None) -> str:
    """
    Standard bureau qualitative category definition based on CIBIL score ranges (300-900).
    """
    if score is None or score <= 0:
        return 'No Score'
    if score >= 800:
        return 'Excellent'
    if score >= 750:
        return 'Very Good'
    if score >= 650:
        return 'Good'
    if score >= 550:
        return 'Fair'
    return 'Poor'


class CibilIntegrationService:
    """
    Secure client for Surepass CIBIL endpoints:
    1. Score: POST /api/v1/credit-report-cibil/score
    2. Detailed Report: POST /api/v1/credit-report-cibil/fetch-report
    """

    PROVIDER = 'surepass_cibil'
    API_SCORE = 'cibil_score'
    API_REPORT = 'cibil_fetch_report'

    def __init__(self, client: ExternalApiClient | None = None):
        self.client = client or ExternalApiClient(
            default_timeout=getattr(settings, 'SUREPASS_TIMEOUT', 15)
        )
        self.base_url = getattr(settings, 'SUREPASS_BASE_URL').rstrip('/')
        self.token = getattr(settings, 'SUREPASS_BEARER_TOKEN')

    def _get_headers(self) -> dict[str, str]:
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.token}',
        }

    def fetch_cibil_score(
        self,
        pan: str,
        mobile: str,
        name: str,
        gender: str = 'male',
        consent: str = 'Y'
    ) -> dict[str, Any]:
        """
        Calls Surepass Endpoint A: POST /api/v1/credit-report-cibil/score
        """
        clean_pan = str(pan).strip().upper()
        clean_mobile = re.sub(r'\D', '', str(mobile))
        if len(clean_mobile) > 10:
            clean_mobile = clean_mobile[-10:]

        url = f'{self.base_url}/api/v1/credit-report-cibil/score'
        payload = {
            'pan': clean_pan,
            'mobile': clean_mobile,
            'name': name.strip().upper(),
            'consent': consent,
            'gender': gender.lower() if gender else 'male',
        }

        logger.info(
            "Calling Surepass CIBIL Score for PAN %s | URL: %s",
            mask_pan(clean_pan),
            url
        )

        response: ExternalApiResponse = self.client.execute(
            provider=self.PROVIDER,
            api_name=self.API_SCORE,
            method='POST',
            url=url,
            headers=self._get_headers(),
            json_data=payload,
            timeout=getattr(settings, 'SUREPASS_TIMEOUT', 15),
        )

        if response.is_timeout:
            return {
                'success': False,
                'is_timeout': True,
                'error': 'CIBIL gateway timed out. Please retry in a few moments.',
                'status_code': 504,
                'response': response,
            }

        # Handle unprovisioned bureau token or sandbox fallback
        provider_msg = ''
        if isinstance(response.data, dict):
            provider_msg = str(response.data.get('message') or '')
        is_unprovisioned = (
            'not valid for this API/Scope' in provider_msg
            or 'scope' in provider_msg.lower()
            or response.status_code in (401, 403)
        )

        if is_unprovisioned:
            if self.token.startswith('mock_') or 'demo' in self.token:
                logger.info("Using simulated sandbox response for CIBIL score inquiry.")
                simulated_score = 742
                return {
                    'success': True,
                    'client_id': f'cibil_score_sim_{clean_pan[:5]}',
                    'credit_score': simulated_score,
                    'score_band': determine_cibil_band(simulated_score),
                    'name': name.strip().upper(),
                    'pan': clean_pan,
                    'mobile': clean_mobile,
                    'gender': gender,
                    'status_code': 200,
                    'is_simulated': True,
                    'response': response,
                }
            logger.info("Credit bureau scope unprovisioned on current token: returning PENDING_PROVIDER_ACCESS")
            return {
                'success': True,
                'status': 'PENDING_PROVIDER_ACCESS',
                'is_pending_provider_access': True,
                'message': 'Informed consent recorded. Credit bureau API access is currently pending provisioning on this account.',
                'client_id': f'cibil_pending_{clean_pan[:5]}',
                'credit_score': None,
                'score_band': None,
                'status_code': 200,
                'can_retry': True,
                'response': response,
            }

        if not response.is_success or not isinstance(response.data, dict):
            provider_err = None
            if isinstance(response.data, dict):
                provider_err = response.data.get('message') or response.data.get('error')
            return {
                'success': False,
                'error': provider_err or 'Failed to fetch CIBIL credit score.',
                'status_code': response.status_code if (response.status_code and response.status_code < 500) else 400,
                'response': response,
            }

        data = response.data.get('data') or response.data
        score_val = data.get('credit_score')
        try:
            score_int = int(score_val) if score_val is not None else None
        except (ValueError, TypeError):
            score_int = None

        return {
            'success': True,
            'client_id': str(data.get('client_id') or ''),
            'credit_score': score_int,
            'score_band': determine_cibil_band(score_int),
            'name': data.get('name') or name,
            'pan': data.get('pan') or clean_pan,
            'mobile': data.get('mobile') or clean_mobile,
            'gender': data.get('gender') or gender,
            'status_code': 200,
            'response': response,
        }

    def fetch_detailed_report(
        self,
        pan: str,
        mobile: str,
        name: str,
        gender: str = 'male',
        consent: str = 'Y'
    ) -> dict[str, Any]:
        """
        Calls Surepass Endpoint B: POST /api/v1/credit-report-cibil/fetch-report
        Defensively parses and normalizes account summary, accounts, and enquiries.
        """
        clean_pan = str(pan).strip().upper()
        clean_mobile = re.sub(r'\D', '', str(mobile))
        if len(clean_mobile) > 10:
            clean_mobile = clean_mobile[-10:]

        url = f'{self.base_url}/api/v1/credit-report-cibil/fetch-report'
        payload = {
            'pan': clean_pan,
            'mobile': clean_mobile,
            'name': name.strip().upper(),
            'consent': consent,
            'gender': gender.lower() if gender else 'male',
        }

        logger.info(
            "Calling Surepass Detailed CIBIL Report for PAN %s | URL: %s",
            mask_pan(clean_pan),
            url
        )

        response: ExternalApiResponse = self.client.execute(
            provider=self.PROVIDER,
            api_name=self.API_REPORT,
            method='POST',
            url=url,
            headers=self._get_headers(),
            json_data=payload,
            timeout=getattr(settings, 'SUREPASS_TIMEOUT', 20),
        )

        if response.is_timeout:
            return {
                'success': False,
                'is_timeout': True,
                'error': 'Detailed CIBIL report inquiry timed out.',
                'status_code': 504,
                'response': response,
            }

        # Handle unprovisioned bureau token or sandbox fallback
        provider_msg = ''
        if isinstance(response.data, dict):
            provider_msg = str(response.data.get('message') or '')
        is_unprovisioned = (
            'not valid for this API/Scope' in provider_msg
            or 'scope' in provider_msg.lower()
            or response.status_code in (401, 403)
        )

        if is_unprovisioned:
            if self.token.startswith('mock_') or 'demo' in self.token:
                logger.info("Using simulated sandbox response for detailed CIBIL report.")
                return self._build_simulated_detailed_report(clean_pan, clean_mobile, name, response)
            logger.info("Credit bureau scope unprovisioned on current token: returning PENDING_PROVIDER_ACCESS")
            return {
                'success': True,
                'status': 'PENDING_PROVIDER_ACCESS',
                'is_pending_provider_access': True,
                'message': 'Informed consent recorded. Detailed credit bureau report access is currently pending provisioning on this account.',
                'client_id': f'cibil_pending_{clean_pan[:5]}',
                'credit_score': None,
                'score_band': None,
                'status_code': 200,
                'can_retry': True,
                'response': response,
            }

        if not response.is_success or not isinstance(response.data, dict):
            provider_err = None
            if isinstance(response.data, dict):
                provider_err = response.data.get('message') or response.data.get('error')
            return {
                'success': False,
                'error': provider_err or 'Failed to fetch detailed CIBIL report.',
                'status_code': response.status_code if (response.status_code and response.status_code < 500) else 400,
                'response': response,
            }

        raw_data = response.data.get('data') or response.data
        return self._normalize_detailed_response(raw_data, clean_pan, clean_mobile, name, response)

    def _normalize_detailed_response(
        self,
        raw_data: dict[str, Any],
        pan: str,
        mobile: str,
        name: str,
        response: ExternalApiResponse
    ) -> dict[str, Any]:
        """
        Defensively parses nested bureau fields according to the schema specification.
        """
        # Parse Score
        score_val = raw_data.get('credit_score')
        try:
            score_int = int(score_val) if score_val is not None else None
        except (ValueError, TypeError):
            score_int = None

        # Look for consumerSummaryresp or top-level summaries
        resp_obj = raw_data.get('response') or {}
        consumer_summary = resp_obj.get('consumerSummaryresp') or {}
        acc_summary_raw = consumer_summary.get('accountSummary') or raw_data.get('accountSummary') or {}
        inq_summary_raw = consumer_summary.get('inquirySummary') or raw_data.get('inquirySummary') or {}

        def parse_int(val, default=0) -> int:
            try:
                return int(val) if val is not None else default
            except (ValueError, TypeError):
                return default

        def parse_float(val, default=0.0) -> float:
            try:
                return float(val) if val is not None else default
            except (ValueError, TypeError):
                return default

        # Normalized Account Summary
        normalized_acc_summary = {
            'total_accounts': parse_int(acc_summary_raw.get('totalAccounts') or acc_summary_raw.get('total_accounts')),
            'current_balance': parse_float(acc_summary_raw.get('currentBalance') or acc_summary_raw.get('current_balance')),
            'high_credit_amount': parse_float(acc_summary_raw.get('highCredit') or acc_summary_raw.get('high_credit_amount')),
            'overdue_account_count': parse_int(acc_summary_raw.get('overdueAccounts') or acc_summary_raw.get('overdue_accounts')),
            'overdue_balance': parse_float(acc_summary_raw.get('overdueBalance') or acc_summary_raw.get('overdue_balance')),
            'zero_balance_account_count': parse_int(acc_summary_raw.get('zeroBalanceAccounts') or acc_summary_raw.get('zero_balance_accounts')),
            'oldest_account_date': str(acc_summary_raw.get('oldestAccountDate') or acc_summary_raw.get('oldest_account_date') or ''),
            'recent_account_date': str(acc_summary_raw.get('recentAccountDate') or acc_summary_raw.get('recent_account_date') or ''),
        }

        # Normalized Inquiry Summary
        normalized_inq_summary = {
            'total_enquiries': parse_int(inq_summary_raw.get('totalInquiries') or inq_summary_raw.get('total_enquiries')),
            'past_30_days': parse_int(inq_summary_raw.get('past30Days') or inq_summary_raw.get('past_30_days')),
            'past_12_months': parse_int(inq_summary_raw.get('past12Months') or inq_summary_raw.get('past_12_months')),
            'past_24_months': parse_int(inq_summary_raw.get('past24Months') or inq_summary_raw.get('past_24_months')),
            'recent_inquiry_date': str(inq_summary_raw.get('recentInquiryDate') or inq_summary_raw.get('recent_inquiry_date') or ''),
        }

        # Accounts List parsing & masking
        raw_accounts = raw_data.get('accounts') or []
        normalized_accounts = []
        if isinstance(raw_accounts, list):
            for acc in raw_accounts:
                if not isinstance(acc, dict):
                    continue
                acc_num = acc.get('accountNumber') or acc.get('account_number') or ''
                masked_num = mask_account_number(acc_num)
                monthly_status = acc.get('monthlyPayStatus') or acc.get('monthly_pay_status') or []

                normalized_accounts.append({
                    'account_type': str(acc.get('accountType') or acc.get('account_type') or 'Credit Account'),
                    'masked_account_number': masked_num,
                    'lender_name': str(acc.get('member') or acc.get('lender_name') or acc.get('institution') or 'Financial Institution'),
                    'current_balance': parse_float(acc.get('currentBalance') or acc.get('current_balance')),
                    'overdue_amount': parse_float(acc.get('overdueAmount') or acc.get('overdue_amount')),
                    'high_credit_amount': parse_float(acc.get('highCredit') or acc.get('high_credit_amount')),
                    'opened_date': str(acc.get('dateOpened') or acc.get('opened_date') or ''),
                    'reported_date': str(acc.get('dateReported') or acc.get('reported_date') or ''),
                    'emi_amount': parse_float(acc.get('emi') or acc.get('emi_amount')),
                    'repayment_tenure': parse_int(acc.get('tenure') or acc.get('repayment_tenure')),
                    'payment_history': monthly_status if isinstance(monthly_status, list) else [],
                })

        # Enquiries List parsing & masking
        raw_enquiries = raw_data.get('enquiries') or []
        normalized_enquiries = []
        if isinstance(raw_enquiries, list):
            for inq in raw_enquiries:
                if not isinstance(inq, dict):
                    continue
                normalized_enquiries.append({
                    'institution': str(inq.get('institution') or inq.get('member') or 'Commercial Lender'),
                    'purpose': str(inq.get('purpose') or inq.get('enquiry_purpose') or 'Credit Inquiry'),
                    'amount': parse_float(inq.get('amount') or inq.get('enquiry_amount')),
                    'date': str(inq.get('date') or inq.get('enquiry_date') or ''),
                })

        return {
            'success': True,
            'client_id': str(raw_data.get('client_id') or ''),
            'credit_score': score_int,
            'score_band': determine_cibil_band(score_int),
            'account_summary': normalized_acc_summary,
            'inquiry_summary': normalized_inq_summary,
            'accounts': normalized_accounts,
            'enquiries': normalized_enquiries,
            'status_code': 200,
            'response': response,
        }

    def _build_simulated_detailed_report(
        self,
        pan: str,
        mobile: str,
        name: str,
        response: ExternalApiResponse
    ) -> dict[str, Any]:
        """Provides realistic CIBIL report structures for demo/sandbox mode."""
        simulated_score = 742
        return {
            'success': True,
            'client_id': f'cibil_report_sim_{pan[:5]}',
            'credit_score': simulated_score,
            'score_band': determine_cibil_band(simulated_score),
            'account_summary': {
                'total_accounts': 3,
                'current_balance': 14250.00,
                'high_credit_amount': 75000.00,
                'overdue_account_count': 0,
                'overdue_balance': 0.00,
                'zero_balance_account_count': 1,
                'oldest_account_date': '2021-03-15',
                'recent_account_date': '2024-08-10',
            },
            'inquiry_summary': {
                'total_enquiries': 2,
                'past_30_days': 0,
                'past_12_months': 1,
                'past_24_months': 2,
                'recent_inquiry_date': '2024-05-12',
            },
            'accounts': [
                {
                    'account_type': 'Credit Card',
                    'masked_account_number': 'XXXXXXXX4912',
                    'lender_name': 'HDFC Bank Ltd',
                    'current_balance': 8250.00,
                    'overdue_amount': 0.00,
                    'high_credit_amount': 50000.00,
                    'opened_date': '2021-03-15',
                    'reported_date': '2026-09-30',
                    'emi_amount': 0.00,
                    'repayment_tenure': 0,
                    'payment_history': [
                        {'month': '2026-09', 'status': '000'},
                        {'month': '2026-08', 'status': '000'},
                        {'month': '2026-07', 'status': '000'},
                        {'month': '2026-06', 'status': '000'},
                        {'month': '2026-05', 'status': '000'},
                        {'month': '2026-04', 'status': '000'},
                    ],
                },
                {
                    'account_type': 'Consumer Loan',
                    'masked_account_number': 'XXXXXXXX8103',
                    'lender_name': 'Bajaj Finance Ltd',
                    'current_balance': 6000.00,
                    'overdue_amount': 0.00,
                    'high_credit_amount': 25000.00,
                    'opened_date': '2024-08-10',
                    'reported_date': '2026-09-30',
                    'emi_amount': 2000.00,
                    'repayment_tenure': 12,
                    'payment_history': [
                        {'month': '2026-09', 'status': '000'},
                        {'month': '2026-08', 'status': '000'},
                    ],
                },
            ],
            'enquiries': [
                {
                    'institution': 'HDFC Bank Ltd',
                    'purpose': 'Credit Card Application',
                    'amount': 50000.00,
                    'date': '2024-05-12',
                },
            ],
            'status_code': 200,
            'is_simulated': True,
            'response': response,
        }
