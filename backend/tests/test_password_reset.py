import hashlib
from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import authenticate
from apps.users.models import User, PasswordResetToken
from apps.users.services.password_reset_service import generate_password_reset_token


class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='existing.user@example.com',
            name='Existing User',
            password='oldpassword123',
        )

    def test_forgot_password_existing_email_creates_token(self):
        response = self.client.post('/api/auth/forgot-password/', {
            'email': 'existing.user@example.com'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('If an account exists for this email', response.data.get('message', ''))

        token_record = PasswordResetToken.objects.filter(user=self.user).first()
        self.assertIsNotNone(token_record)
        self.assertIsNone(token_record.used_at)
        self.assertTrue(token_record.is_valid)

    def test_forgot_password_non_existing_email_returns_generic_message(self):
        initial_token_count = PasswordResetToken.objects.count()
        response = self.client.post('/api/auth/forgot-password/', {
            'email': 'doesnotexist@example.com'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('If an account exists for this email', response.data.get('message', ''))
        # Ensure no token is created for non-existing email
        self.assertEqual(PasswordResetToken.objects.count(), initial_token_count)

    def test_reset_password_with_valid_token_success(self):
        raw_token, token_obj = generate_password_reset_token(self.user)

        response = self.client.post('/api/auth/reset-password/', {
            'token': raw_token,
            'new_password': 'NewSecurePassword@123',
            'confirm_password': 'NewSecurePassword@123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('message'), 'Password has been reset successfully.')

        # Verify old password is dead
        self.assertIsNone(authenticate(email='existing.user@example.com', password='oldpassword123'))

        # Verify new password authenticates
        user_auth = authenticate(email='existing.user@example.com', password='NewSecurePassword@123')
        self.assertIsNotNone(user_auth)

        # Verify token is marked as used
        token_obj.refresh_from_db()
        self.assertIsNotNone(token_obj.used_at)
        self.assertFalse(token_obj.is_valid)

    def test_reset_password_token_cannot_be_reused(self):
        raw_token, token_obj = generate_password_reset_token(self.user)

        # Use once
        self.client.post('/api/auth/reset-password/', {
            'token': raw_token,
            'new_password': 'FirstResetPass@123',
            'confirm_password': 'FirstResetPass@123',
        }, format='json')

        # Try to use again
        response = self.client.post('/api/auth/reset-password/', {
            'token': raw_token,
            'new_password': 'SecondResetPass@123',
            'confirm_password': 'SecondResetPass@123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already been used', response.data.get('message', ''))

    def test_reset_password_expired_token(self):
        raw_token, token_obj = generate_password_reset_token(self.user)
        # Manually expire the token
        token_obj.expires_at = timezone.now() - timedelta(minutes=1)
        token_obj.save()

        response = self.client.post('/api/auth/reset-password/', {
            'token': raw_token,
            'new_password': 'NewPassword@123',
            'confirm_password': 'NewPassword@123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expired', response.data.get('message', ''))

    def test_reset_password_password_mismatch(self):
        raw_token, _ = generate_password_reset_token(self.user)

        response = self.client.post('/api/auth/reset-password/', {
            'token': raw_token,
            'new_password': 'PasswordOne123',
            'confirm_password': 'PasswordTwo123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', response.data.get('errors', {}))

    def test_reset_password_invalid_token(self):
        response = self.client.post('/api/auth/reset-password/', {
            'token': 'completely-invalid-token',
            'new_password': 'NewPassword@123',
            'confirm_password': 'NewPassword@123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid or expired', response.data.get('message', ''))

    def test_check_email_exists_endpoint(self):
        response = self.client.post('/api/auth/password-reset/check-email/', {
            'email': 'existing.user@example.com'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('exists'))

        response_not_found = self.client.post('/api/auth/password-reset/check-email/', {
            'email': 'notfound@example.com'
        }, format='json')
        self.assertEqual(response_not_found.status_code, status.HTTP_404_NOT_FOUND)
