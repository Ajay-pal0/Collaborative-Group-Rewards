from rest_framework import serializers


class CreditReportRequestSerializer(serializers.Serializer):
    """
    Validates user consent and optional parameters for bureau credit inquiry.
    """
    consent = serializers.BooleanField(
        required=True,
        help_text='Affirmative user consent acknowledgment for bureau credit inquiry'
    )
    purpose = serializers.CharField(
        max_length=255,
        required=False,
        default='Credit assessment for rewards program eligibility'
    )
    report_type = serializers.ChoiceField(
        choices=['score', 'full_report', 'detailed'],
        required=False,
        default='score'
    )
    pan = serializers.CharField(max_length=10, required=False, allow_blank=True)
    mobile = serializers.CharField(max_length=15, required=False, allow_blank=True)
    name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    gender = serializers.ChoiceField(choices=['male', 'female', 'other'], required=False, default='male')

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError('Informed consent is required to request credit profile information.')
        return value
