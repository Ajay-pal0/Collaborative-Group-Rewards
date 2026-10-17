from typing import Any
from django.db.models import Count, Q, Sum
from apps.groups.models import Group, GroupMember
from apps.rewards.models import PointTransaction, BenefitClaim


def get_group_member_stats(
    group: Group, current_user: Any = None
) -> list[dict[str, Any]]:
    """
    Computes aggregated point totals and task counts for all group members.
    Excludes BENEFIT_CLAIMED redemptions so statistics only count earned pts.
    """
    member_stats = (
        PointTransaction.objects.filter(group=group)
        .exclude(action_type='BENEFIT_CLAIMED')
        .values(
            'member_id',
            'member__user__id',
            'member__user__name',
            'member__user__email',
        )
        .annotate(
            total_points=Sum('points'),
            task_count=Count('id', filter=Q(action_type='TASK_COMPLETED')),
        )
        .order_by('-total_points')
    )

    current_user_id_str = str(current_user.id) if current_user else ''

    return [
        {
            'member_id': str(stat['member_id']),
            'user_id': str(stat['member__user__id']),
            'user_name': (
                stat['member__user__name']
                or stat['member__user__email']
                or 'Member'
            ),
            'user_email': stat['member__user__email'],
            'points_earned': stat['total_points'] or 0,
            'tasks_count': stat['task_count'],
            'is_current_user': (
                str(stat['member__user__id']) == current_user_id_str
            ),
        }
        for stat in member_stats
    ]


def get_group_points_summary(
    group: Group, membership: GroupMember, current_user: Any
) -> dict[str, Any]:
    """
    Computes group points summary including transactions and member breakdown.
    Used by GroupPointsView.
    """
    transactions = PointTransaction.objects.filter(group=group).order_by(
        '-created_at'
    )
    all_user_txs = PointTransaction.objects.filter(
        group=group, member=membership
    )
    user_txs = all_user_txs.exclude(action_type='BENEFIT_CLAIMED')
    user_points = user_txs.aggregate(total=Sum('points'))['total'] or 0
    claim_benefit_points = (
        BenefitClaim.objects.filter(
            group=group, claimed_by=membership.user
        ).aggregate(total=Sum('benefit__required_points'))['total']
        or 0
    )
    tx_benefit_points = (
        all_user_txs.filter(action_type='BENEFIT_CLAIMED').aggregate(
            total=Sum('points')
        )['total']
        or 0
    )
    benefit_points = max(claim_benefit_points, tx_benefit_points)
    user_total_points = user_points + benefit_points
    task_points = (
        all_user_txs.filter(action_type='TASK_COMPLETED').aggregate(
            total=Sum('points')
        )['total']
        or 0
    )

    member_points_list = get_group_member_stats(
        group, current_user=current_user
    )
    group_total = group.total_points
    user_contribution_pct = (
        round((user_points / group_total * 100), 1) if group_total > 0 else 0.0
    )

    return {
        'total': group_total,
        'user_points': user_points,
        'user_total_points': user_total_points,
        'benefit_points': benefit_points,
        'task_points': task_points,
        'user_contribution_pct': user_contribution_pct,
        'member_points': member_points_list,
        'transactions': transactions,
    }


def get_user_points_summary(
    group: Group, membership: GroupMember, current_user: Any
) -> dict[str, Any]:
    """
    Computes user points breakdown and task completion statistics for a group.
    Used by UserPointsView.
    """
    all_user_txs = PointTransaction.objects.filter(
        group=group, member=membership
    )
    user_txs = all_user_txs.exclude(action_type='BENEFIT_CLAIMED')
    user_points = user_txs.aggregate(total=Sum('points'))['total'] or 0
    claim_benefit_points = (
        BenefitClaim.objects.filter(
            group=group, claimed_by=membership.user
        ).aggregate(total=Sum('benefit__required_points'))['total']
        or 0
    )
    tx_benefit_points = (
        all_user_txs.filter(action_type='BENEFIT_CLAIMED').aggregate(
            total=Sum('points')
        )['total']
        or 0
    )
    benefit_points = max(claim_benefit_points, tx_benefit_points)
    user_total_points = user_points + benefit_points
    task_points = (
        all_user_txs.filter(action_type='TASK_COMPLETED').aggregate(
            total=Sum('points')
        )['total']
        or 0
    )

    member_points_list = get_group_member_stats(
        group, current_user=current_user
    )
    group_total = group.total_points
    user_contribution_pct = (
        round((user_points / group_total * 100), 1) if group_total > 0 else 0.0
    )

    return {
        'group_id': str(group.id),
        'group_total_points': group_total,
        'user_points': user_points,
        'user_total_points': user_total_points,
        'benefit_points': benefit_points,
        'task_points': task_points,
        'user_contribution_pct': user_contribution_pct,
        'user_tasks_completed': user_txs.filter(
            action_type='TASK_COMPLETED'
        ).count(),
        'member_points': member_points_list,
    }
