from unittest.mock import patch, MagicMock
import requests
from django.test import TestCase
from rest_framework.test import APIClient

from apps.users.models import User, PanVerification
from apps.common.models import ExternalApiLog
from apps.common.security import mask_pan, sanitize_headers, sanitize_payload, validate_pan_format
from apps.common.integrations.client import ExternalApiClient, ExternalApiResponse
from apps.users.services.pan_service import SetuPanVerificationService, verify_user_pan


def make_user(email='pan_user@example.com', name='Pan User', password='password123'):
    return User.objects.create_user(email=email, name=name, password=password)


class SecurityUtilsTest(TestCase):
    def test_mask_pan_standard(self):
        self.assertEqual(mask_pan('ABCDE1234A'), 'ABCDE****A')
        self.assertEqual(mask_pan('abcde1234a'), 'ABCDE****A')

    def test_mask_pan_invalid_lengths(self):
        self.assertEqual(mask_pan(''), '')
        self.assertEqual(mask_pan(None), '')
        self.assertEqual(mask_pan('123'), '****')
        self.assertEqual(mask_pan('123456'), '12****56')

    def test_validate_pan_format(self):
        self.assertTrue(validate_pan_format('ABCDE1234A'))
        self.assertTrue(validate_pan_format('abcde1234a'))
        self.assertFalse(validate_pan_format('ABCDE12345'))
        self.assertFalse(validate_pan_format('ABCD1234A'))
        self.assertFalse(validate_pan_format('ABCDE12345A'))
        self.assertFalse(validate_pan_format('12345ABCDE'))
        self.assertFalse(validate_pan_format(''))
        self.assertFalse(validate_pan_format(None))

    def test_sanitize_headers(self):
        raw_headers = {
            'Content-Type': 'application/json',
            'x-client-id': 'client-123',
            'x-client-secret': 'super-secret-xyz',
            'Authorization': 'Bearer token-abc',
        }
        sanitized = sanitize_headers(raw_headers)
        self.assertEqual(sanitized['Content-Type'], 'application/json')
        self.assertEqual(sanitized['x-client-secret'], '[REDACTED]')
        self.assertEqual(sanitized['Authorization'], '[REDACTED]')
        self.assertEqual(sanitized['x-client-id'], '[REDACTED]')

    def test_sanitize_payload_masks_pan_and_secrets(self):
        raw_payload = {
            'pan': 'ABCDE1234A',
            'consent': 'Y',
            'secret_token': 'shhh',
            'nested': {
                'pan': 'XYZWP5678B',
                'password': 'mypassword',
            },
        }
        sanitized = sanitize_payload(raw_payload)
        self.assertEqual(sanitized['pan'], 'ABCDE****A')
        self.assertEqual(sanitized['consent'], 'Y')
        self.assertEqual(sanitized['secret_token'], '[REDACTED]')
        self.assertEqual(sanitized['nested']['pan'], 'XYZWP****B')
        self.assertEqual(sanitized['nested']['password'], '[REDACTED]')


class ExternalApiClientTest(TestCase):
    def setUp(self):
        self.client = ExternalApiClient(default_timeout=5)

    @patch('requests.request')
    def test_execute_success_and_logs(self, mock_request):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            'verification': 'SUCCESS',
            'id': 'ext-ref-123',
            'traceId': 'trace-abc-123',
            'data': {'full_name': 'Kumar Gaurav Rathod'},
        }
        mock_resp.headers = {'Content-Type': 'application/json', 'x-trace-id': 'trace-abc-123'}
        mock_request.return_value = mock_resp

        response = self.client.execute(
            provider='setu',
            api_name='pan_verification',
            method='POST',
            url='https://dg-sandbox.setu.co/api/verify/pan',
            headers={'x-client-secret': 'raw-secret', 'Content-Type': 'application/json'},
            json_data={'pan': 'ABCDE1234A', 'consent': 'Y'},
        )

        self.assertTrue(response.is_success)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.trace_id, 'trace-abc-123')
        self.assertEqual(response.external_reference_id, 'ext-ref-123')

        # Verify audit log saved
        log_entry = ExternalApiLog.objects.get(id=response.log_id)
        self.assertEqual(log_entry.provider, 'setu')
        self.assertEqual(log_entry.api_name, 'pan_verification')
        self.assertTrue(log_entry.is_success)
        self.assertEqual(log_entry.request_payload['pan'], 'ABCDE****A')
        self.assertEqual(log_entry.request_headers['x-client-secret'], '[REDACTED]')
        self.assertGreaterEqual(log_entry.duration_ms, 0)

    @patch('requests.request')
    def test_execute_timeout_handling(self, mock_request):
        mock_request.side_effect = requests.exceptions.Timeout('Connection timed out')

        response = self.client.execute(
            provider='setu',
            api_name='pan_verification',
            method='POST',
            url='https://dg-sandbox.setu.co/api/verify/pan',
            json_data={'pan': 'ABCDE1234A'},
        )

        self.assertFalse(response.is_success)
        self.assertTrue(response.is_timeout)
        self.assertEqual(response.status_code, 504)
        self.assertIn('timed out', response.error_message)

        # Audit log is created even upon timeout
        log_entry = ExternalApiLog.objects.get(id=response.log_id)
        self.assertFalse(log_entry.is_success)
        self.assertIn('timed out', log_entry.error_message)


class SetuPanServiceTest(TestCase):
    def setUp(self):
        self.mock_client = MagicMock(spec=ExternalApiClient)
        self.service = SetuPanVerificationService(client=self.mock_client)

    def test_verify_pan_success(self):
        self.mock_client.execute.return_value = ExternalApiResponse(
            status_code=200,
            is_success=True,
            data={
                'verification': 'SUCCESS',
                'id': 'e5692531-7c7d-41c3-9bb1-eaf2fc4bff48',
                'message': 'PAN is valid.',
                'data': {
                    'full_name': 'Kumar Gaurav Rathod',
                    'category': 'Individual or Person',
                    'aadhaar_seeding_status': 'LINKED',
                },
                'traceId': '1-6ab8a414-0cf456df652a3f973a4915f5',
            },
        )

        result = self.service.verify_pan('ABCDE1234A')
        self.assertTrue(result['success'])
        self.assertEqual(result['full_name'], 'Kumar Gaurav Rathod')
        self.assertEqual(result['verification_id'], 'e5692531-7c7d-41c3-9bb1-eaf2fc4bff48')
        self.assertEqual(result['aadhaar_seeding_status'], 'LINKED')

    def test_verify_pan_failure_response(self):
        self.mock_client.execute.return_value = ExternalApiResponse(
            status_code=400,
            is_success=False,
            data={'verification': 'FAILED', 'message': 'Invalid PAN provided.'},
        )

        result = self.service.verify_pan('ABCDE1234A')
        self.assertFalse(result['success'])
        self.assertEqual(result['error'], 'Invalid PAN provided.')

    def test_verify_pan_timeout(self):
        self.mock_client.execute.return_value = ExternalApiResponse(
            status_code=504,
            is_success=False,
            is_timeout=True,
            data=None,
        )

        result = self.service.verify_pan('ABCDE1234A')
        self.assertFalse(result['success'])
        self.assertTrue(result['is_timeout'])
        self.assertEqual(result['status_code'], 503)
        self.assertIn('temporarily unavailable', result['error'])


class UserPanVerificationBusinessLogicTest(TestCase):
    def setUp(self):
        self.user = make_user()

    def test_invalid_pan_format_rejected(self):
        result = verify_user_pan(self.user, 'INVALID_PAN')
        self.assertFalse(result['success'])
        self.assertEqual(result['status_code'], 400)
        self.assertIn('Invalid PAN format', result['error'])

    @patch('apps.users.services.pan_service.SetuPanVerificationService.verify_pan')
    def test_verify_user_pan_success_creates_model(self, mock_verify):
        mock_verify.return_value = {
            'success': True,
            'verification_id': 'setu-id-12345',
            'full_name': 'Kumar Gaurav Rathod',
            'category': 'Individual',
            'aadhaar_seeding_status': 'LINKED',
        }

        result = verify_user_pan(self.user, 'ABCDE1234A')
        self.assertTrue(result['success'])
        self.assertEqual(result['data']['pan_masked'], 'ABCDE****A')
        self.assertEqual(result['data']['name'], 'Kumar Gaurav Rathod')

        # Check DB model
        pan_record = PanVerification.objects.get(user=self.user)
        self.assertTrue(pan_record.is_verified)
        self.assertEqual(pan_record.pan_number, 'ABCDE1234A')
        self.assertEqual(pan_record.pan_masked, 'ABCDE****A')
        self.assertEqual(pan_record.registered_name, 'Kumar Gaurav Rathod')

        # Check convenience property on user
        self.user.refresh_from_db()
        self.assertTrue(self.user.pan_verified)
        self.assertEqual(self.user.pan_masked, 'ABCDE****A')
        self.assertEqual(self.user.pan_registered_name, 'Kumar Gaurav Rathod')

    @patch('apps.users.services.pan_service.SetuPanVerificationService.verify_pan')
    def test_idempotent_verification_does_not_call_setu_twice(self, mock_verify):
        # Create already verified model
        PanVerification.objects.create(
            user=self.user,
            pan_number='ABCDE1234A',
            is_verified=True,
            registered_name='Kumar Gaurav Rathod',
        )

        result = verify_user_pan(self.user, 'ABCDE1234A')
        self.assertTrue(result['success'])
        self.assertTrue(result['data']['already_verified'])
        self.assertEqual(result['message'], 'PAN is already verified.')
        # Ensure Setu was NEVER called
        mock_verify.assert_not_called()


class PanVerificationApiEndpointsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_unauthenticated_verify_fails(self):
        resp = self.client.post('/api/auth/pan/verify/', {'pan': 'ABCDE1234A'})
        self.assertEqual(resp.status_code, 401)

    def test_unauthenticated_status_fails(self):
        resp = self.client.get('/api/auth/pan/status/')
        self.assertEqual(resp.status_code, 401)

    @patch('apps.users.services.pan_service.SetuPanVerificationService.verify_pan')
    def test_authenticated_verify_success(self, mock_verify):
        mock_verify.return_value = {
            'success': True,
            'verification_id': 'setu-uuid-999',
            'full_name': 'Kumar Gaurav Rathod',
            'category': 'Individual',
            'aadhaar_seeding_status': 'LINKED',
        }

        self.client.force_authenticate(user=self.user)
        resp = self.client.post('/api/auth/pan/verify/', {'pan': 'ABCDE1234A'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['data']['pan_masked'], 'ABCDE****A')
        self.assertEqual(resp.data['data']['name'], 'Kumar Gaurav Rathod')

    def test_verify_invalid_pan_returns_400(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.post('/api/auth/pan/verify/', {'pan': 'XYZ123'})
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.data['success'])

    def test_get_pan_status(self):
        PanVerification.objects.create(
            user=self.user,
            pan_number='ABCDE1234A',
            is_verified=True,
            registered_name='Kumar Gaurav Rathod',
        )

        self.client.force_authenticate(user=self.user)
        resp = self.client.get('/api/auth/pan/status/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['pan_verified'])
        self.assertEqual(resp.data['pan_masked'], 'ABCDE****A')
        self.assertEqual(resp.data['name'], 'Kumar Gaurav Rathod')

    def test_me_endpoint_includes_pan_status(self):
        PanVerification.objects.create(
            user=self.user,
            pan_number='ABCDE1234A',
            is_verified=True,
            registered_name='Kumar Gaurav Rathod',
        )

        self.client.force_authenticate(user=self.user)
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['pan_verified'])
        self.assertEqual(resp.data['pan_masked'], 'ABCDE****A')
        self.assertEqual(resp.data['pan_registered_name'], 'Kumar Gaurav Rathod')
