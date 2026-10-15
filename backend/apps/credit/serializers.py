from rest_framework import serializers


class CreditReportRequestSerializer(serializers.Serializer):
    """
    Validates user consent for requesting an authorized credit report.
    """
    consent = serializers.BooleanField(
        required=True,
        help_text='User consent acknowledgment for bureau credit inquiry'
    )
    purpose = serializers.CharField(
        max_length=255,
        required=False,
        default='Credit assessment for rewards program eligibility'
    )

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError('Informed consent is required to request credit profile information.')
        return value
