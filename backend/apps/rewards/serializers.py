from rest_framework import serializers
from .models import PointTransaction, Task, Benefit, BenefitClaim, RewardRule


class PointTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointTransaction
        fields = ('id', 'action_type', 'points', 'reference_id', 'created_at')


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'name', 'description', 'points')


class BenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Benefit
        fields = ('id', 'name', 'description', 'required_points', 'display_order')


class BenefitClaimSerializer(serializers.ModelSerializer):
    claimed_by_name = serializers.CharField(source='claimed_by.name', read_only=True)

    class Meta:
        model = BenefitClaim
        fields = ('id', 'claimed_by_name', 'claimed_at')


class BenefitStateSerializer(serializers.Serializer):
    benefit = BenefitSerializer()
    state = serializers.ChoiceField(choices=['locked', 'available', 'claimed'])
    claim = BenefitClaimSerializer(allow_null=True)


class RewardRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardRule
        fields = ('id', 'action_type', 'points', 'description', 'is_active')
