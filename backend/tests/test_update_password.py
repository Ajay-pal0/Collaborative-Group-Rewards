from django.test import TestCase
from django.contrib.auth import authenticate
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User


class UpdatePasswordTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='member@example.com',
            name='Test Member',
            password='OldSecurePassword123!',
        )

    def test_update_password_unauthenticated_fails(self):
        """Permission case: unauthenticated requests must be rejected (401)."""
        response = self.client.post('/api/auth/update-password/', {
            'current_password': 'OldSecurePassword123!',
            'new_password': 'NewSecurePassword456!',
            'confirm_password': 'NewSecurePassword456!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_password_success(self):
        """Success case: valid password updates successfully."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/update-password/', {
            'current_password': 'OldSecurePassword123!',
            'new_password': 'NewSecurePassword456!',
            'confirm_password': 'NewSecurePassword456!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('success'))
        self.assertIsNone(response.data.get('error'))
        self.assertIn('message', response.data.get('data', {}))

        # Verify old password no longer works
        self.assertIsNone(
            authenticate(
                email='member@example.com',
                password='OldSecurePassword123!',
            )
        )
        # Verify new password authenticates
        authenticated_user = authenticate(
            email='member@example.com',
            password='NewSecurePassword456!',
        )
        self.assertIsNotNone(authenticated_user)
        self.assertEqual(authenticated_user.id, self.user.id)

    def test_update_password_incorrect_current_password_fails(self):
        """Validation error case: wrong current password."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/update-password/', {
            'current_password': 'WrongPassword999!',
            'new_password': 'NewSecurePassword456!',
            'confirm_password': 'NewSecurePassword456!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get('success'))
        self.assertIn(
            'Current password is incorrect',
            response.data.get('error', ''),
        )

    def test_update_password_mismatched_confirm_password_fails(self):
        """Validation error case: new and confirm password mismatch."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/update-password/', {
            'current_password': 'OldSecurePassword123!',
            'new_password': 'NewSecurePassword456!',
            'confirm_password': 'DifferentPassword789!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get('success'))
        self.assertIn(
            'Passwords do not match',
            str(response.data.get('error', '')),
        )

    def test_update_password_same_as_current_fails(self):
        """Validation error case: new password same as current password."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/update-password/', {
            'current_password': 'OldSecurePassword123!',
            'new_password': 'OldSecurePassword123!',
            'confirm_password': 'OldSecurePassword123!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get('success'))
        self.assertIn('must be different', response.data.get('error', ''))

    def test_update_password_short_password_fails(self):
        """Validation error case: new password shorter than 6 characters."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/update-password/', {
            'current_password': 'OldSecurePassword123!',
            'new_password': '123',
            'confirm_password': '123',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data.get('success'))
