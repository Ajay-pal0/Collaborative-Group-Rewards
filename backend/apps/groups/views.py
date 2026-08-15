from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Group, GroupMember, Invitation
from .serializers import GroupSerializer, GroupCreateSerializer, InvitationSerializer, GroupMemberSerializer
from .services import create_group, get_or_create_invitation, join_group
from apps.activities.models import Activity
from apps.activities.serializers import ActivitySerializer


class GroupListCreateView(APIView):
    def get(self, request):
        # Return groups where the user is an active member
        group_ids = GroupMember.objects.filter(
            user=request.user, status='active'
        ).values_list('group_id', flat=True)
        groups = Group.objects.filter(id__in=group_ids)
        serializer = GroupSerializer(groups, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = GroupCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            group = create_group(
                user=request.user,
                name=serializer.validated_data['name'],
                group_type=serializer.validated_data.get('group_type', 'other'),
                group_id=serializer.validated_data.get('id'),
            )
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(
            GroupSerializer(group, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class GroupDetailView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        membership = GroupMember.objects.filter(
            group=group, user=request.user, status='active'
        ).first()
        if not membership:
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = GroupSerializer(group, context={'request': request})
        return Response(serializer.data)


class GroupMembersView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        if not GroupMember.objects.filter(group=group, user=request.user, status='active').exists():
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        members = group.memberships.filter(status='active').select_related('user')
        serializer = GroupMemberSerializer(members, many=True)
        return Response(serializer.data)


class InviteCreateView(APIView):
    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        membership = GroupMember.objects.filter(
            group=group, user=request.user, status='active'
        ).first()
        if not membership:
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        invitation, created = get_or_create_invitation(group, request.user)
        serializer = InvitationSerializer(invitation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class InvitePreviewView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            invitation = Invitation.objects.select_related('group').get(token=token)
        except Invitation.DoesNotExist:
            return Response({'detail': 'Invitation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if invitation.status != 'active':
            return Response({'detail': 'This invitation is no longer valid.', 'status': invitation.status},
                            status=status.HTTP_410_GONE)
        if invitation.expires_at <= timezone.now():
            return Response({'detail': 'This invitation has expired.', 'status': 'expired'},
                            status=status.HTTP_410_GONE)

        serializer = InvitationSerializer(invitation, context={'request': request})
        return Response(serializer.data)


class JoinGroupView(APIView):
    def post(self, request, token):
        try:
            group, membership, newly_joined = join_group(token, request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            GroupSerializer(group, context={'request': request}).data,
            status=status.HTTP_201_CREATED if newly_joined else status.HTTP_200_OK
        )


class GroupActivityView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        if not GroupMember.objects.filter(group=group, user=request.user, status='active').exists():
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        activities = Activity.objects.filter(group=group).order_by('-created_at')[:50]
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data)
