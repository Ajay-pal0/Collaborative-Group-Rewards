from django.db.models import Sum, Count
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.groups.models import Group, GroupMember
from apps.groups.serializers import GroupSerializer
from apps.users.serializers import UserSerializer
from .models import Task, Benefit, PointTransaction
from .serializers import (
    TaskSerializer, BenefitStateSerializer, BenefitClaimSerializer,
    PointTransactionSerializer
)
from .services import complete_task, get_benefit_states, claim_benefit, complete_profile


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

        return Response({
            'transaction': PointTransactionSerializer(tx).data,
            'group': GroupSerializer(group, context={'request': request}).data,
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

        return Response(BenefitClaimSerializer(claim).data, status=status.HTTP_201_CREATED)


class GroupPointsView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        membership = GroupMember.objects.filter(group=group, user=request.user, status='active').first()
        if not membership:
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)
        
        transactions = PointTransaction.objects.filter(group=group).order_by('-created_at')
        user_txs = PointTransaction.objects.filter(group=group, member=membership)
        user_points = user_txs.aggregate(total=Sum('points'))['total'] or 0

        member_stats = (
            PointTransaction.objects.filter(group=group)
            .values('member_id', 'member__user__id', 'member__user__name', 'member__user__email')
            .annotate(total_points=Sum('points'), task_count=Count('id'))
            .order_by('-total_points')
        )

        member_points_list = [
            {
                'member_id': str(stat['member_id']),
                'user_id': str(stat['member__user__id']),
                'user_name': stat['member__user__name'] or stat['member__user__email'] or 'Member',
                'user_email': stat['member__user__email'],
                'points_earned': stat['total_points'],
                'tasks_count': stat['task_count'],
                'is_current_user': str(stat['member__user__id']) == str(request.user.id),
            }
            for stat in member_stats
        ]

        group_total = group.total_points
        user_contribution_pct = round((user_points / group_total * 100), 1) if group_total > 0 else 0.0

        return Response({
            'total': group_total,
            'user_points': user_points,
            'user_contribution_pct': user_contribution_pct,
            'member_points': member_points_list,
            'transactions': PointTransactionSerializer(transactions, many=True).data,
        })


class UserPointsView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        membership = GroupMember.objects.filter(group=group, user=request.user, status='active').first()
        if not membership:
            return Response({'detail': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        user_txs = PointTransaction.objects.filter(group=group, member=membership)
        user_points = user_txs.aggregate(total=Sum('points'))['total'] or 0

        member_stats = (
            PointTransaction.objects.filter(group=group)
            .values('member_id', 'member__user__id', 'member__user__name', 'member__user__email')
            .annotate(total_points=Sum('points'), task_count=Count('id'))
            .order_by('-total_points')
        )

        member_points_list = [
            {
                'member_id': str(stat['member_id']),
                'user_id': str(stat['member__user__id']),
                'user_name': stat['member__user__name'] or stat['member__user__email'] or 'Member',
                'user_email': stat['member__user__email'],
                'points_earned': stat['total_points'],
                'tasks_count': stat['task_count'],
                'is_current_user': str(stat['member__user__id']) == str(request.user.id),
            }
            for stat in member_stats
        ]

        group_total = group.total_points
        user_contribution_pct = round((user_points / group_total * 100), 1) if group_total > 0 else 0.0

        return Response({
            'group_id': str(group.id),
            'group_total_points': group_total,
            'user_points': user_points,
            'user_contribution_pct': user_contribution_pct,
            'user_tasks_completed': user_txs.filter(action_type='TASK_COMPLETED').count(),
            'member_points': member_points_list,
        })


class ProfileCompleteView(APIView):
    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        membership = GroupMember.objects.filter(
            group=group, user=request.user, status='active'
        ).first()
        if not membership:
            return Response({'detail': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

        name = request.data.get('name')
        phone = request.data.get('phone')
        updated = False
        if name and name.strip() and name != request.user.name:
            request.user.name = name.strip()
            updated = True
        if phone is not None and phone != request.user.phone:
            request.user.phone = phone.strip()
            updated = True
        if updated:
            request.user.save()

        try:
            tx = complete_profile(group, membership)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_409_CONFLICT)

        user_name = request.user.name or request.user.email or 'User'
        return Response({
            'message': f'{user_name} completed profile details and earned +{tx.points} points!',
            'transaction': PointTransactionSerializer(tx).data,
            'group': GroupSerializer(group, context={'request': request}).data,
            'user': UserSerializer(request.user).data,
        }, status=status.HTTP_201_CREATED)

