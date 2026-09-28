from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    CheckEmailSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    get_tokens_for_user,
)
from .services.password_reset_service import (
    generate_password_reset_token,
    send_password_reset_email,
    verify_and_reset_password,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class PanVerifyView(APIView):
    """
    POST /api/auth/pan/verify/
    Verifies user's PAN via the centralized Setu integration layer.
    """
    def post(self, request):
        from .serializers import PanVerifySerializer
        from .services.pan_service import verify_user_pan

        serializer = PanVerifySerializer(data=request.data)
        if not serializer.is_valid():
            err_msg = 'Invalid input.'
            if 'pan' in serializer.errors:
                err_msg = serializer.errors['pan'][0]
            return Response(
                {
                    'success': False,
                    'error': err_msg,
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        pan = serializer.validated_data['pan']
        result = verify_user_pan(request.user, pan)

        http_status = result.get('status_code', status.HTTP_200_OK)
        return Response(result, status=http_status)


class PanStatusView(APIView):
    """
    GET /api/auth/pan/status/
    Retrieves user's PAN verification status.
    """
    def get(self, request):
        user = request.user
        return Response({
            'pan_verified': user.pan_verified,
            'pan_masked': user.pan_masked,
            'name': user.pan_registered_name,
            'verified_at': user.pan_verified_at,
        })


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Validates user email, ensures user exists and is active in the system,
    generates a secure, short-lived reset token, stores its hash in the database,
    and sends a password reset email to the user's registered email address.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email_raw = request.data.get('email', '')
        if not email_raw or not str(email_raw).strip():
            return Response(
                {
                    'detail': 'Email address is required.',
                    'message': 'Email address is required.',
                    'errors': {'email': ['Email address is required.']},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            err_msg = serializer.errors.get('email', ['Invalid email address.'])[0]
            is_not_found = 'No account found' in str(err_msg)
            return Response(
                {
                    'detail': err_msg,
                    'message': err_msg,
                    'errors': serializer.errors,
                },
                status=status.HTTP_404_NOT_FOUND if is_not_found else status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data['email']
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response(
                {
                    'detail': 'No account found with this email address.',
                    'message': 'No account found with this email address.',
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.is_active:
            return Response(
                {
                    'detail': 'This account is inactive. Please contact support.',
                    'message': 'This account is inactive. Please contact support.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_token, _ = generate_password_reset_token(user)
        try:
            reset_url = send_password_reset_email(user, raw_token)
        except Exception as e:
            logger.error(f"Failed to send password reset email to {user.email}: {e}")
            return Response(
                {
                    'detail': 'Failed to send password reset email. Please try again later.',
                    'message': 'Failed to send password reset email. Please try again later.',
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response_data = {
            "success": True,
            "message": f"Password reset link has been sent to your registered email address ({user.email}).",
        }
        # In DEBUG / local dev, attach reset_url to facilitate testing
        if getattr(settings, 'DEBUG', False) and reset_url:
            response_data["reset_url"] = reset_url

        return Response(response_data, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Validates the token, checks expiry and usage, verifies passwords,
    and updates the user's password.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            err_msg = 'Unable to reset password.'
            if 'token' in serializer.errors:
                err_msg = serializer.errors['token'][0]
            elif 'confirm_password' in serializer.errors:
                err_msg = serializer.errors['confirm_password'][0]
            elif 'new_password' in serializer.errors:
                err_msg = serializer.errors['new_password'][0]
            return Response(
                {
                    'detail': err_msg,
                    'message': err_msg,
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        success, msg = verify_and_reset_password(token, new_password)
        if not success:
            return Response(
                {'detail': msg, 'message': msg},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                'success': True,
                'message': 'Password has been reset successfully.',
            },
            status=status.HTTP_200_OK,
        )


class CheckEmailView(APIView):
    """
    POST /api/auth/password-reset/check-email/
    Checks if an email exists in the system for password reset.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email_raw = request.data.get('email', '')
        if not email_raw or not str(email_raw).strip():
            return Response(
                {'detail': 'Email address is required.', 'exists': False},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CheckEmailSerializer(data=request.data)
        if not serializer.is_valid():
            err_msg = serializer.errors.get('email', ['No account found with this email address.'])[0]
            is_not_found = 'No account found' in str(err_msg)
            return Response(
                {
                    'detail': err_msg,
                    'exists': False,
                    'errors': serializer.errors,
                },
                status=status.HTTP_404_NOT_FOUND if is_not_found else status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                'detail': 'Email address verified.',
                'exists': True,
                'email': serializer.validated_data['email'],
            },
            status=status.HTTP_200_OK,
        )

