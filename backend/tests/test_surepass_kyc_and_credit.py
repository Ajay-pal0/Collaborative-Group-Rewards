from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework.test import APIClient

from apps.users.models import User
from apps.kyc.models import (
    IdentityVerification,
    IdentityVerificationAudit,
    VerificationConsent,
    VerificationStatus,
    VerificationType,
    VerificationAttempt,
)
from apps.credit.models import (
    CreditReport,
    CreditReportStatus,
    CreditReportRequest,
    CreditRequestType,
)


def make_user(email='kyc_user@example.com', name='KYC Test User', password='password123'):
    return User.objects.create_user(email=email, name=name, password=password)


class KycEndpointsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()
        self.client.force_authenticate(user=self.user)

    def test_get_kyc_status_initial(self):
        resp = self.client.get('/api/v1/kyc/status/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        verifs = resp.data['verifications']
        self.assertEqual(verifs['pan']['status'], 'NOT_STARTED')
        self.assertFalse(verifs['pan']['badge']['awarded'])
        self.assertEqual(verifs['aadhaar']['status'], 'NOT_STARTED')
        self.assertFalse(verifs['aadhaar']['badge']['awarded'])

    @patch('apps.kyc.services.surepass_service.SurepassIntegrationService.verify_pan_comprehensive')
    def test_pan_verify_endpoint_success(self, mock_verify):
        mock_verify.return_value = {
            'success': True,
            'provider_reference': 'sp-client-001',
            'full_name': 'Test Citizen',
            'masked_id': 'ABCDE****A',
            'category': 'Individual',
            'metadata': {'aadhaar_seeding_status': 'OPERATIVE'},
        }

        payload = {'pan_number': 'ABCDE1234A', 'consent': True}
        resp = self.client.post('/api/v1/kyc/pan/verify/', payload)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['status'], 'verified')
        self.assertTrue(resp.data['badge']['awarded'])
        self.assertEqual(resp.data['badge']['label'], 'PAN Verified')
        self.assertEqual(resp.data['data']['masked_id'], 'ABCDE****A')

        # Verify DB records
        rec = IdentityVerification.objects.get(user=self.user, verification_type=VerificationType.PAN)
        self.assertEqual(rec.status, VerificationStatus.VERIFIED)
        self.assertEqual(rec.masked_id, 'ABCDE****A')
        # Verify consent logged
        consent_rec = VerificationConsent.objects.get(user=self.user, verification_type='PAN')
        self.assertTrue(consent_rec.consent_given)

    def test_pan_verify_without_consent_fails(self):
        payload = {'pan_number': 'ABCDE1234A', 'consent': False}
        resp = self.client.post('/api/v1/kyc/pan/verify/', payload)
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.data['success'])

    @patch('apps.kyc.services.surepass_service.SurepassIntegrationService.initiate_digilocker')
    def test_aadhaar_initiate_endpoint_success(self, mock_init):
        mock_init.return_value = {
            'success': True,
            'client_id': 'dgl-session-123',
            'authorization_url': 'https://digilocker-sandbox.surepass.io/flow/123',
            'token': 'tok-123',
        }

        payload = {'consent': True}
        resp = self.client.post('/api/v1/kyc/aadhaar/initiate/', payload)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['status'], 'pending')
        self.assertEqual(resp.data['client_id'], 'dgl-session-123')
        self.assertIn('digilocker', resp.data['authorization_url'])

        # Check DB status is PENDING
        rec = IdentityVerification.objects.get(user=self.user, verification_type=VerificationType.AADHAAR)
        self.assertEqual(rec.status, VerificationStatus.PENDING)

    @patch('apps.kyc.services.surepass_service.SurepassIntegrationService.fetch_digilocker_status')
    def test_aadhaar_verify_endpoint_success(self, mock_fetch):
        # Create pending verification
        IdentityVerification.objects.create(
            user=self.user,
            verification_type=VerificationType.AADHAAR,
            status=VerificationStatus.PENDING,
            provider_reference='dgl-session-123',
        )

        mock_fetch.return_value = {
            'success': True,
            'provider_reference': 'dgl-session-123',
            'full_name': 'Test Citizen',
            'masked_id': 'XXXXXXXX5678',
            'metadata': {'gender': 'F'},
        }

        resp = self.client.post('/api/v1/kyc/aadhaar/verify/', {'client_id': 'dgl-session-123'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['status'], 'verified')
        self.assertTrue(resp.data['badge']['awarded'])
        self.assertEqual(resp.data['badge']['label'], 'Aadhaar Verified')
        self.assertEqual(resp.data['data']['masked_id'], 'XXXXXXXX5678')

        # Check DB updated
        rec = IdentityVerification.objects.get(user=self.user, verification_type=VerificationType.AADHAAR)
        self.assertEqual(rec.status, VerificationStatus.VERIFIED)
        self.assertEqual(rec.masked_id, 'XXXXXXXX5678')

        # Check User model property
        self.user.refresh_from_db()
        self.assertTrue(self.user.aadhaar_verified)
        self.assertEqual(self.user.aadhaar_masked, 'XXXXXXXX5678')

    @patch('apps.kyc.services.surepass_service.SurepassIntegrationService.fetch_digilocker_status')
    def test_aadhaar_verify_when_session_is_pending(self, mock_fetch):
        IdentityVerification.objects.create(
            user=self.user,
            verification_type=VerificationType.AADHAAR,
            status=VerificationStatus.PENDING,
            provider_reference='dgl-session-pending',
        )

        mock_fetch.return_value = {
            'success': False,
            'is_pending': True,
            'status': 'pending',
            'error': 'DigiLocker verification is still in progress.',
            'status_code': 200,
        }

        resp = self.client.post('/api/v1/kyc/aadhaar/verify/', {'client_id': 'dgl-session-pending'})
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data['success'])
        self.assertEqual(resp.data['status'], 'pending')
        self.assertFalse(resp.data['badge']['awarded'])

        # Check DB status remains PENDING and user is not verified
        rec = IdentityVerification.objects.get(user=self.user, verification_type=VerificationType.AADHAAR)
        self.assertEqual(rec.status, VerificationStatus.PENDING)
        self.user.refresh_from_db()
        self.assertFalse(self.user.aadhaar_verified)

    @patch('apps.kyc.services.surepass_service.SurepassIntegrationService.initiate_digilocker')
    def test_aadhaar_initialize_returns_digiboost_token(self, mock_init):
        mock_init.return_value = {
            'success': True,
            'client_id': 'dgl-session-456',
            'token': 'digiboost_mock_sdk_jwt_token',
            'expiry_seconds': 600.0,
            'authorization_url': 'https://sandbox.surepass.app/flow/456',
        }
        resp = self.client.post('/api/kyc/aadhaar/initialize/', {'consent': True})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['token'], 'digiboost_mock_sdk_jwt_token')
        self.assertEqual(resp.data['client_id'], 'dgl-session-456')

    def test_aadhaar_cancel_endpoint(self):
        # Create pending verification
        IdentityVerification.objects.create(
            user=self.user,
            verification_type=VerificationType.AADHAAR,
            status=VerificationStatus.PENDING,
            provider_reference='dgl-cancel-123',
        )
        resp = self.client.post('/api/kyc/aadhaar/cancel/', {'client_id': 'dgl-cancel-123'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        rec = IdentityVerification.objects.get(user=self.user, verification_type=VerificationType.AADHAAR)
        self.assertEqual(rec.status, VerificationStatus.FAILED)

    @patch('apps.kyc.services.surepass_service.SurepassIntegrationService.fetch_digilocker_status')
    def test_digilocker_webhook_processing(self, mock_fetch):
        rec = IdentityVerification.objects.create(
            user=self.user,
            verification_type=VerificationType.AADHAAR,
            status=VerificationStatus.PENDING,
            provider_reference='dgl-webhook-789',
        )
        mock_fetch.return_value = {
            'success': True,
            'provider_reference': 'dgl-webhook-789',
            'full_name': 'Webhook Citizen',
            'masked_id': 'XXXXXXXX9999',
            'metadata': {},
        }
        anon_client = APIClient()
        resp = anon_client.post(
            '/api/webhooks/surepass/digilocker/',
            {'client_id': 'dgl-webhook-789', 'status': 'success'},
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        rec.refresh_from_db()
        self.assertEqual(rec.status, VerificationStatus.VERIFIED)
        self.assertEqual(rec.masked_id, 'XXXXXXXX9999')

        # Test idempotency on second call
        resp2 = anon_client.post(
            '/api/webhooks/surepass/digilocker/',
            {'client_id': 'dgl-webhook-789', 'status': 'success'},
            format='json'
        )
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.data['message'], 'Already verified.')


class CreditEndpointsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user('credit_user@example.com')
        self.client.force_authenticate(user=self.user)

    def test_get_credit_profile_initial_not_requested(self):
        resp = self.client.get('/api/v1/credit/profile/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['status'], 'NOT_REQUESTED')
        self.assertFalse(resp.data['has_report'])
        self.assertIsNone(resp.data['credit_score'])

    def test_request_credit_report_without_consent_fails(self):
        resp = self.client.post('/api/v1/credit/report/', {'consent': False})
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.data['success'])

    def test_request_credit_report_records_consent_and_handles_provider_access(self):
        resp = self.client.post('/api/v1/credit/report/', {'consent': True})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertIn(resp.data['status'], ('PENDING_PROVIDER_ACCESS', 'COMPLETED'))
        self.assertTrue(resp.data['can_retry'] or resp.data['has_report'])

        # Verify consent logged
        consent_entry = VerificationConsent.objects.filter(user=self.user, verification_type='CREDIT').first()
        self.assertIsNotNone(consent_entry)
        self.assertTrue(consent_entry.consent_given)

    @patch('apps.credit.services.cibil_service.CibilIntegrationService.fetch_cibil_score')
    def test_cibil_score_endpoint_success(self, mock_fetch):
        mock_fetch.return_value = {
            'success': True,
            'client_id': 'cibil_score_mock_999',
            'credit_score': 765,
            'score_band': 'Very Good',
            'status_code': 200,
        }

        resp = self.client.post('/api/v1/credit/score/', {'consent': True, 'pan': 'ABCPD1234F'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['credit_score'], 765)
        self.assertEqual(resp.data['score_band'], 'Very Good')

        # Verify CreditReportRequest was logged
        req = CreditReportRequest.objects.filter(user=self.user, request_type=CreditRequestType.SCORE).first()
        self.assertIsNotNone(req)
        self.assertEqual(req.status, 'COMPLETED')
        self.assertEqual(req.provider_client_reference, 'cibil_score_mock_999')

        # Verify CreditReport record
        report = CreditReport.objects.get(user=self.user)
        self.assertEqual(report.credit_score, 765)
        self.assertEqual(report.request, req)

    @patch('apps.credit.services.cibil_service.CibilIntegrationService.fetch_detailed_report')
    def test_cibil_full_report_endpoint_success_and_get(self, mock_fetch):
        mock_fetch.return_value = {
            'success': True,
            'client_id': 'cibil_report_mock_888',
            'credit_score': 780,
            'score_band': 'Very Good',
            'account_summary': {
                'total_accounts': 2,
                'current_balance': 15000.0,
                'high_credit_amount': 50000.0,
                'overdue_account_count': 0,
                'overdue_balance': 0.0,
                'zero_balance_account_count': 1,
            },
            'inquiry_summary': {
                'total_enquiries': 1,
                'recent_inquiry_date': '2026-08-01',
            },
            'accounts': [
                {
                    'account_type': 'Credit Card',
                    'masked_account_number': 'XXXXXXXX1234',
                    'lender_name': 'HDFC Bank',
                    'current_balance': 15000.0,
                    'overdue_amount': 0.0,
                    'high_credit_amount': 50000.0,
                    'payment_history': [{'month': '2026-09', 'status': '000'}],
                }
            ],
            'enquiries': [
                {
                    'institution': 'HDFC Bank',
                    'purpose': 'Credit Card',
                    'amount': 50000.0,
                    'date': '2026-08-01',
                }
            ],
            'status_code': 200,
        }

        resp = self.client.post('/api/v1/credit/full-report/', {'consent': True, 'pan': 'EKRPR1234F'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertTrue(resp.data['has_full_report'])
        self.assertEqual(resp.data['credit_score'], 780)
        self.assertEqual(len(resp.data['accounts']), 1)
        self.assertEqual(resp.data['accounts'][0]['masked_account_number'], 'XXXXXXXX1234')

        # Verify GET /api/v1/credit/full-report/
        get_resp = self.client.get('/api/v1/credit/full-report/')
        self.assertEqual(get_resp.status_code, 200)
        self.assertTrue(get_resp.data['success'])
        self.assertEqual(get_resp.data['credit_score'], 780)
        self.assertEqual(len(get_resp.data['accounts']), 1)

    def test_other_user_cannot_access_credit_report(self):
        other_user = make_user('other_credit@example.com')
        other_client = APIClient()
        other_client.force_authenticate(user=other_user)

        # Other user has no report yet
        resp = other_client.get('/api/v1/credit/full-report/')
        self.assertEqual(resp.status_code, 404)

