from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.groups.models import Group, GroupMember
from apps.groups.serializers import GroupSerializer
from apps.users.serializers import UserSerializer
from .models import Task, Benefit
from .serializers import (
    TaskSerializer, BenefitStateSerializer, BenefitClaimSerializer,
    PointTransactionSerializer
)
from .services import complete_task, get_benefit_states, claim_benefit, complete_profile
from .selectors import get_group_points_summary, get_user_points_summary


class TaskListView(APIView):
    def get(self, request):
        tasks = Task.objects.filter(is_active=True)
        return Response(TaskSerializer(tasks, many=True).data)


class TaskCompleteView(APIView):
    def post(self, request, group_id, task_id):
        group = get_object_or_404(Group, id=group_id)
        task = get_object_or_404(Task, id=task_id, is_active=True)

        membership = GroupMember.objects.filter(
            group=group, user=request.user, status='active'
        ).first()
        if not membership:
            return Response({'detail': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            tx = complete_task(group, membership, task)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_409_CONFLICT)

        group.refresh_from_db()
        user_points_summary = get_user_points_summary(
            group, membership, request.user
        )

        return Response({
            'transaction': PointTransactionSerializer(tx).data,
            'group': GroupSerializer(group, context={'request': request}).data,
            'user_points': user_points_summary,
        })


class BenefitListView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        if not GroupMember.objects.filter(group=group, user=request.user, status='active').exists():
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        states = get_benefit_states(group, user=request.user)
        serializer = BenefitStateSerializer(states, many=True)
        return Response(serializer.data)


class BenefitClaimView(APIView):
    def post(self, request, group_id, benefit_id):
        group = get_object_or_404(Group, id=group_id)
        benefit = get_object_or_404(Benefit, id=benefit_id, status='active')

        if not GroupMember.objects.filter(group=group, user=request.user, status='active').exists():
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            claim = claim_benefit(group, benefit, request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_409_CONFLICT)

        membership = GroupMember.objects.filter(
            group=group, user=request.user, status='active'
        ).first()
        data = BenefitClaimSerializer(claim).data
        if membership:
            data['user_points'] = get_user_points_summary(
                group, membership, request.user
            )
        return Response(data, status=status.HTTP_201_CREATED)


class GroupPointsView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        membership = GroupMember.objects.filter(group=group, user=request.user, status='active').first()
        if not membership:
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        summary = get_group_points_summary(group, membership, request.user)
        return Response({
            'total': summary['total'],
            'user_points': summary['user_points'],
            'user_total_points': summary.get(
                'user_total_points', summary['user_points']
            ),
            'benefit_points': summary.get('benefit_points', 0),
            'task_points': summary.get('task_points', 0),
            'user_contribution_pct': summary['user_contribution_pct'],
            'member_points': summary['member_points'],
            'transactions': PointTransactionSerializer(
                summary['transactions'], many=True
            ).data,
        })


class UserPointsView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        membership = GroupMember.objects.filter(group=group, user=request.user, status='active').first()
        if not membership:
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        summary = get_user_points_summary(group, membership, request.user)
        return Response(summary)


class ProfileCompleteView(APIView):
    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        membership = GroupMember.objects.filter(
            group=group, user=request.user, status='active'
        ).first()
        if not membership:
            return Response({'detail': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

        if not getattr(request.user, 'pan_verified', False):
            return Response(
                {'detail': 'Profile Completion Bonus can only be added once user is Verified. Please verify your PAN first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name = request.data.get('name')
        phone = request.data.get('phone')

        try:
            tx = complete_profile(group, membership, name=name, phone=phone)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_409_CONFLICT)

        group.refresh_from_db()
        user_points_summary = get_user_points_summary(
            group, membership, request.user
        )

        user_name = request.user.name or request.user.email or 'User'
        return Response({
            'message': f'{user_name} completed profile details and earned +{tx.points} points!',
            'transaction': PointTransactionSerializer(tx).data,
            'group': GroupSerializer(group, context={'request': request}).data,
            'user_points': user_points_summary,
            'user': UserSerializer(request.user).data,
        }, status=status.HTTP_201_CREATED)

