from unittest.mock import patch, MagicMock
import requests
from django.test import TestCase
from rest_framework.test import APIClient

from apps.users.models import User, PanVerification
from apps.common.models import ExternalApiLog
from apps.common.security import mask_pan, mask_aadhaar, sanitize_headers, sanitize_payload, validate_pan_format, validate_aadhaar_format
from apps.common.integrations.client import ExternalApiClient, ExternalApiResponse
from apps.users.services.pan_service import SurepassPanVerificationService, verify_user_pan
from apps.kyc.models import IdentityVerification, VerificationStatus, VerificationType


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

    def test_mask_aadhaar_standard(self):
        self.assertEqual(mask_aadhaar('123456789012'), 'XXXXXXXX9012')
        self.assertEqual(mask_aadhaar('1234 5678 9012'), 'XXXXXXXX9012')

    def test_validate_aadhaar_format(self):
        self.assertTrue(validate_aadhaar_format('123456789012'))
        self.assertTrue(validate_aadhaar_format('1234 5678 9012'))
        self.assertFalse(validate_aadhaar_format('12345678901'))
        self.assertFalse(validate_aadhaar_format('abc123456789'))

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
            'Authorization': 'Bearer secret-bearer-token',
            'x-api-key': 'super-secret-xyz',
        }
        sanitized = sanitize_headers(raw_headers)
        self.assertEqual(sanitized['Content-Type'], 'application/json')
        self.assertEqual(sanitized['Authorization'], '[REDACTED]')
        self.assertEqual(sanitized['x-api-key'], '[REDACTED]')

    def test_sanitize_payload_masks_pan_and_secrets(self):
        raw_payload = {
            'pan': 'ABCDE1234A',
            'aadhaar': '123456789012',
            'consent': 'Y',
            'token': 'shhh',
        }
        sanitized = sanitize_payload(raw_payload)
        self.assertEqual(sanitized['pan'], 'ABCDE****A')
        self.assertEqual(sanitized['aadhaar'], 'XXXXXXXX9012')
        self.assertEqual(sanitized['consent'], 'Y')
        self.assertEqual(sanitized['token'], '[REDACTED]')


class ExternalApiClientTest(TestCase):
    def setUp(self):
        self.client = ExternalApiClient(default_timeout=5)

    @patch('requests.request')
    def test_execute_success_and_logs(self, mock_request):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            'success': True,
            'data': {'full_name': 'Kumar Gaurav Rathod', 'client_id': 'sp-pan-123'},
        }
        mock_resp.headers = {'Content-Type': 'application/json'}
        mock_request.return_value = mock_resp

        response = self.client.execute(
            provider='surepass',
            api_name='pan_comprehensive',
            method='POST',
            url='https://sandbox.surepass.io/api/v1/pan/pan-comprehensive',
            headers={'Authorization': 'Bearer raw-secret', 'Content-Type': 'application/json'},
            json_data={'id_number': 'ABCDE1234A', 'consent': 'Y'},
        )

        self.assertTrue(response.is_success)
        self.assertEqual(response.status_code, 200)

        # Verify audit log saved
        log_entry = ExternalApiLog.objects.get(id=response.log_id)
        self.assertEqual(log_entry.provider, 'surepass')
        self.assertEqual(log_entry.api_name, 'pan_comprehensive')
        self.assertTrue(log_entry.is_success)
        self.assertEqual(log_entry.request_payload['id_number'], 'ABCDE****A')
        self.assertEqual(log_entry.request_headers['Authorization'], '[REDACTED]')

    @patch('requests.request')
    def test_execute_timeout_handling(self, mock_request):
        mock_request.side_effect = requests.exceptions.Timeout('Connection timed out')

        response = self.client.execute(
            provider='surepass',
            api_name='pan_comprehensive',
            method='POST',
            url='https://sandbox.surepass.io/api/v1/pan/pan-comprehensive',
            json_data={'id_number': 'ABCDE1234A'},
        )

        self.assertFalse(response.is_success)
        self.assertTrue(response.is_timeout)
        self.assertEqual(response.status_code, 504)
        self.assertIn('timed out', response.error_message)


class SurepassPanServiceTest(TestCase):
    def setUp(self):
        self.mock_client = MagicMock(spec=ExternalApiClient)
        self.service = SurepassPanVerificationService(client=self.mock_client)

    def test_verify_pan_success(self):
        self.mock_client.execute.return_value = ExternalApiResponse(
            status_code=200,
            is_success=True,
            data={
                'success': True,
                'data': {
                    'client_id': 'surepass-ref-12345',
                    'full_name': 'Kumar Gaurav Rathod',
                    'category': 'Individual',
                    'aadhaar_seeding_status': 'OPERATIVE',
                },
            },
        )

        result = self.service.verify_pan('ABCDE1234A')
        self.assertTrue(result['success'])
        self.assertEqual(result['full_name'], 'Kumar Gaurav Rathod')
        self.assertEqual(result['provider_reference'], 'surepass-ref-12345')

    def test_verify_pan_failure_response(self):
        self.mock_client.execute.return_value = ExternalApiResponse(
            status_code=400,
            is_success=False,
            data={'success': False, 'message': 'Invalid PAN provided.'},
        )

        result = self.service.verify_pan('ABCDE1234A')
        self.assertFalse(result['success'])
        self.assertEqual(result['error'], 'Invalid PAN provided.')


class UserPanVerificationBusinessLogicTest(TestCase):
    def setUp(self):
        self.user = make_user()

    def test_invalid_pan_format_rejected(self):
        result = verify_user_pan(self.user, 'INVALID_PAN')
        self.assertFalse(result['success'])
        self.assertEqual(result['status_code'], 400)
        self.assertIn('Invalid PAN format', result['error'])

    @patch('apps.kyc.services.surepass_service.SurepassIntegrationService.verify_pan_comprehensive')
    def test_verify_user_pan_success_creates_model(self, mock_verify):
        mock_verify.return_value = {
            'success': True,
            'provider_reference': 'surepass-id-12345',
            'full_name': 'Kumar Gaurav Rathod',
            'masked_id': 'ABCDE****A',
            'category': 'Individual',
            'metadata': {'category': 'Individual'},
        }

        result = verify_user_pan(self.user, 'ABCDE1234A')
        self.assertTrue(result['success'])
        self.assertEqual(result['data']['masked_id'], 'ABCDE****A')
        self.assertEqual(result['data']['registered_name'], 'Kumar Gaurav Rathod')
        self.assertEqual(result['badge']['label'], 'PAN Verified')
        self.assertTrue(result['badge']['awarded'])

        # Check DB IdentityVerification record
        id_record = IdentityVerification.objects.get(user=self.user, verification_type=VerificationType.PAN)
        self.assertEqual(id_record.status, VerificationStatus.VERIFIED)
        self.assertEqual(id_record.masked_id, 'ABCDE****A')
        self.assertEqual(id_record.registered_name, 'Kumar Gaurav Rathod')

        # Check convenience property on user
        self.user.refresh_from_db()
        self.assertTrue(self.user.pan_verified)
        self.assertEqual(self.user.pan_masked, 'ABCDE****A')
        self.assertEqual(self.user.pan_registered_name, 'Kumar Gaurav Rathod')

    @patch('apps.kyc.services.surepass_service.SurepassIntegrationService.verify_pan_comprehensive')
    def test_idempotent_verification_does_not_call_provider_twice(self, mock_verify):
        # Create already verified model
        IdentityVerification.objects.create(
            user=self.user,
            verification_type=VerificationType.PAN,
            status=VerificationStatus.VERIFIED,
            masked_id='ABCDE****A',
            registered_name='Kumar Gaurav Rathod',
        )

        result = verify_user_pan(self.user, 'ABCDE1234A')
        self.assertTrue(result['success'])
        self.assertTrue(result['already_verified'])
        self.assertTrue(result['badge']['awarded'])
        # Ensure Surepass was NEVER called
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

    @patch('apps.kyc.services.surepass_service.SurepassIntegrationService.verify_pan_comprehensive')
    def test_authenticated_verify_success(self, mock_verify):
        mock_verify.return_value = {
            'success': True,
            'provider_reference': 'sp-uuid-999',
            'full_name': 'Kumar Gaurav Rathod',
            'masked_id': 'ABCDE****A',
            'category': 'Individual',
            'metadata': {},
        }

        self.client.force_authenticate(user=self.user)
        resp = self.client.post('/api/auth/pan/verify/', {'pan': 'ABCDE1234A'})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['data']['masked_id'], 'ABCDE****A')
        self.assertEqual(resp.data['data']['registered_name'], 'Kumar Gaurav Rathod')

    def test_verify_invalid_pan_returns_400(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.post('/api/auth/pan/verify/', {'pan': 'XYZ123'})
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.data['success'])

    def test_get_pan_status(self):
        IdentityVerification.objects.create(
            user=self.user,
            verification_type=VerificationType.PAN,
            status=VerificationStatus.VERIFIED,
            masked_id='ABCDE****A',
            registered_name='Kumar Gaurav Rathod',
        )

        self.client.force_authenticate(user=self.user)
        resp = self.client.get('/api/auth/pan/status/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['pan_verified'])
        self.assertEqual(resp.data['pan_masked'], 'ABCDE****A')
        self.assertEqual(resp.data['name'], 'Kumar Gaurav Rathod')

    def test_me_endpoint_includes_pan_status(self):
        IdentityVerification.objects.create(
            user=self.user,
            verification_type=VerificationType.PAN,
            status=VerificationStatus.VERIFIED,
            masked_id='ABCDE****A',
            registered_name='Kumar Gaurav Rathod',
        )

        self.client.force_authenticate(user=self.user)
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['pan_verified'])
        self.assertEqual(resp.data['pan_masked'], 'ABCDE****A')
        self.assertEqual(resp.data['pan_registered_name'], 'Kumar Gaurav Rathod')

    def test_me_endpoint_patch_success(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.patch('/api/auth/me/', {'name': 'Updated Name', 'phone': '+91 9123456789'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['name'], 'Updated Name')
        self.assertEqual(resp.data['phone'], '+91 9123456789')
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, 'Updated Name')
        self.assertEqual(self.user.phone, '+91 9123456789')

    def test_me_endpoint_patch_read_only_protection(self):
        original_email = self.user.email
        self.client.force_authenticate(user=self.user)
        resp = self.client.patch('/api/auth/me/', {'email': 'hacked@example.com', 'pan_verified': True}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, original_email)

    def test_me_endpoint_unauthenticated(self):
        self.client.force_authenticate(user=None)
        resp = self.client.patch('/api/auth/me/', {'name': 'Anonymous'}, format='json')
        self.assertEqual(resp.status_code, 401)
