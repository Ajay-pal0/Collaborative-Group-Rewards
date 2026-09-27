from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, get_tokens_for_user


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

