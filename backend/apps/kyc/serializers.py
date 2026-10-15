from rest_framework import serializers
from apps.common.security import validate_pan_format


class PanVerifySerializer(serializers.Serializer):
    """
    Validates PAN verification input with consent.
    Accepts both `pan_number` and legacy `pan` field name.
    """
    pan_number = serializers.CharField(
        max_length=10,
        min_length=10,
        required=False,
        help_text='10-character PAN number'
    )
    pan = serializers.CharField(
        max_length=10,
        min_length=10,
        required=False,
        help_text='Legacy alias for pan_number'
    )
    consent = serializers.BooleanField(
        required=True,
        help_text='User consent acknowledgment'
    )

    def validate(self, attrs):
        raw_pan = attrs.get('pan_number') or attrs.get('pan')
        if not raw_pan:
            raise serializers.ValidationError({'pan_number': 'PAN number is required.'})

        clean_pan = str(raw_pan).strip().upper()
        if not validate_pan_format(clean_pan):
            raise serializers.ValidationError(
                {'pan_number': 'Invalid PAN format. Expected format is ABCDE1234A.'}
            )

        if not attrs.get('consent'):
            raise serializers.ValidationError(
                {'consent': 'Informed consent is required to verify PAN.'}
            )

        attrs['pan_number'] = clean_pan
        return attrs


class AadhaarInitiateSerializer(serializers.Serializer):
    """
    Input serializer for initiating DigiLocker Aadhaar verification flow.
    """
    consent = serializers.BooleanField(
        required=True,
        help_text='User consent acknowledgment for DigiLocker Aadhaar retrieval'
    )
    redirect_url = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Optional custom callback URL for frontend redirect'
    )

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError('Informed consent is required to initiate Aadhaar verification.')
        return value


class AadhaarVerifySerializer(serializers.Serializer):
    """
    Input serializer for confirming/polling Aadhaar verification result.
    """
    client_id = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        help_text='Provider session/client ID from DigiLocker initiation'
    )
