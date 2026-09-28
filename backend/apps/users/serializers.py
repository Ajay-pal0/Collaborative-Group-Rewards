from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'phone', 'password')

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    pan_masked = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'name',
            'phone',
            'pan_verified',
            'pan_masked',
            'pan_registered_name',
            'pan_verified_at',
            'created_at',
        )


class PanVerifySerializer(serializers.Serializer):
    pan = serializers.CharField(max_length=10, min_length=10)

    def validate_pan(self, value):
        from apps.common.security import validate_pan_format
        clean = value.strip().upper()
        if not validate_pan_format(clean):
            raise serializers.ValidationError(
                'Invalid PAN format. Expected format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234A).'
            )
        return clean


class CheckEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        clean = value.strip().lower()
        if not User.objects.filter(email__iexact=clean).exists():
            raise serializers.ValidationError('No account found with this email address.')
        return clean


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data



def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
