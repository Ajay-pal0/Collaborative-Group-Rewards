from rest_framework import serializers
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ('id', 'event_type', 'member_name', 'metadata', 'created_at')

    def get_member_name(self, obj):
        if obj.member and obj.member.user:
            name = obj.member.user.name
            if name and name.strip():
                return name.strip()
            return obj.member.user.email
        if obj.metadata:
            return obj.metadata.get('user_name') or obj.metadata.get('member_name')
        return None
