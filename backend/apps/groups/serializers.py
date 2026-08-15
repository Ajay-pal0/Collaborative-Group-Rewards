from rest_framework import serializers
from django.conf import settings
from .models import Group, GroupMember, Invitation
from apps.users.serializers import UserSerializer


class GroupMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = GroupMember
        fields = ('id', 'user', 'role', 'status', 'joined_at')


class GroupCreateSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)

    class Meta:
        model = Group
        fields = ('id', 'name', 'group_type')


class GroupSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)
    total_points = serializers.IntegerField(read_only=True)
    members = serializers.SerializerMethodField()
    current_user_role = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = (
            'id', 'name', 'group_type', 'status', 'created_at',
            'member_count', 'total_points', 'members', 'current_user_role'
        )

    def get_members(self, obj):
        members = obj.memberships.filter(status='active').select_related('user')
        return GroupMemberSerializer(members, many=True).data

    def get_current_user_role(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        membership = obj.memberships.filter(user=request.user, status='active').first()
        return membership.role if membership else None


class InvitationSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)
    group_type = serializers.CharField(source='group.group_type', read_only=True)
    member_count = serializers.IntegerField(source='group.member_count', read_only=True)
    invite_url = serializers.SerializerMethodField()

    class Meta:
        model = Invitation
        fields = (
            'id', 'token', 'group_name', 'group_type', 'member_count',
            'expires_at', 'status', 'invite_url', 'created_at'
        )

    def get_invite_url(self, obj):
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        # Use FRONTEND_URL from settings but strip any trailing comma-separated extras
        base_url = frontend_url.split(',')[0].rstrip('/')
        return f'{base_url}/invite/{obj.token}'
