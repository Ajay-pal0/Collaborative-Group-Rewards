from django.db import transaction, IntegrityError
from django.db.models import F
from apps.groups.models import Group, GroupMember
from apps.activities.services import record_activity
from .models import RewardRule, PointTransaction, Benefit, BenefitClaim


def build_idempotency_key(action_type, reference_id):
    return f'{action_type}:{reference_id}'


def _increment_group_cached_points(group, points):
    Group.objects.filter(id=group.id).update(cached_total_points=F('cached_total_points') + points)


def award_points(group, member, action_type, reference_id):
    """
    Awards points for an action. Idempotent — if the key already exists,
    silently returns the existing transaction.
    """
    try:
        rule = RewardRule.objects.get(action_type=action_type, is_active=True)
    except RewardRule.DoesNotExist:
        # No active rule — skip silently
        return None

    key = build_idempotency_key(action_type, reference_id)

    try:
        with transaction.atomic():
            tx = PointTransaction.objects.create(
                group=group,
                member=member,
                action_type=action_type,
                reference_id=reference_id,
                points=rule.points,
                idempotency_key=key,
            )
            _increment_group_cached_points(group, rule.points)
        return tx
    except IntegrityError:
        # Already awarded — return existing
        return PointTransaction.objects.filter(idempotency_key=key).first()


def complete_task(group, member, task):
    """
    Completes a task for a member in a group. Idempotent by task+member+group.
    """
    reference_id = f'{group.id}:{member.user_id}:TASK:{task.id}'
    key = build_idempotency_key('TASK_COMPLETED', reference_id)

    if PointTransaction.objects.filter(idempotency_key=key).exists():
        raise ValueError('You have already completed this task.')

    try:
        with transaction.atomic():
            tx = PointTransaction.objects.create(
                group=group,
                member=member,
                action_type='TASK_COMPLETED',
                reference_id=reference_id,
                points=task.points,
                idempotency_key=key,
            )
            _increment_group_cached_points(group, task.points)
            record_activity(
                group=group,
                member=member,
                event_type='task_completed',
                metadata={'task_name': task.name, 'points': task.points},
            )
        return tx
    except IntegrityError:
        raise ValueError('You have already completed this task.')


def get_benefit_states(group, user=None):
    """
    Returns all active benefits with their state (locked/available/claimed)
    relative to the group's current points and the specific user's claim history.
    """
    total = group.total_points
    benefits = Benefit.objects.filter(status='active').order_by('required_points')
    
    claims_query = BenefitClaim.objects.filter(group=group)
    if user and user.is_authenticated:
        claims_query = claims_query.filter(claimed_by=user)

    claims = {
        claim.benefit_id: claim
        for claim in claims_query.select_related('claimed_by')
    }

    result = []
    for benefit in benefits:
        claim = claims.get(benefit.id)
        if claim:
            state = 'claimed'
        elif total >= benefit.required_points:
            state = 'available'
        else:
            state = 'locked'

        result.append({
            'benefit': benefit,
            'state': state,
            'claim': claim,
        })
    return result


def claim_benefit(group, benefit, user):
    """
    Claims a benefit for a specific user in a group. Validates threshold and duplicate claim
    for that user using atomic transactions and row-level locking for concurrency safety.
    """
    try:
        with transaction.atomic():
            locked_group = Group.objects.select_for_update().get(id=group.id)
            total = locked_group.total_points
            if total < benefit.required_points:
                raise ValueError(
                    f'Group needs {benefit.required_points} points to unlock this benefit. '
                    f'Current: {total}.'
                )

            if BenefitClaim.objects.filter(group=locked_group, benefit=benefit, claimed_by=user).exists():
                return BenefitClaim.objects.get(group=locked_group, benefit=benefit, claimed_by=user)

            claim = BenefitClaim.objects.create(
                group=locked_group,
                benefit=benefit,
                claimed_by=user,
            )
            membership = GroupMember.objects.filter(group=locked_group, user=user).first()
            if membership:
                ref_id = f'{locked_group.id}:{user.id}:BENEFIT:{benefit.id}'
                key = build_idempotency_key('BENEFIT_CLAIMED', ref_id)
                PointTransaction.objects.get_or_create(
                    group=locked_group,
                    member=membership,
                    action_type='BENEFIT_CLAIMED',
                    defaults={
                        'reference_id': ref_id,
                        'points': benefit.required_points,
                        'idempotency_key': key,
                    }
                )
                record_activity(
                    group=locked_group,
                    member=membership,
                    event_type='benefit_claimed',
                    metadata={
                        'benefit_name': benefit.name,
                        'points': benefit.required_points,
                    },
                )
            return claim
    except IntegrityError:
        # Already claimed concurrently by this user
        existing = BenefitClaim.objects.get(group=group, benefit=benefit, claimed_by=user)
        return existing


def complete_profile(group, member):
    """
    Awards PROFILE_COMPLETED points for a member in a group.
    Idempotent by member + group context.
    """
    reference_id = f'{group.id}:{member.user_id}:PROFILE'
    key = build_idempotency_key('PROFILE_COMPLETED', reference_id)

    if PointTransaction.objects.filter(idempotency_key=key).exists():
        raise ValueError('You have already completed your profile reward for this group.')

    rule = RewardRule.objects.filter(action_type='PROFILE_COMPLETED', is_active=True).first()
    points = rule.points if rule else 50

    with transaction.atomic():
        tx = PointTransaction.objects.create(
            group=group,
            member=member,
            action_type='PROFILE_COMPLETED',
            reference_id=reference_id,
            points=points,
            idempotency_key=key,
        )
        _increment_group_cached_points(group, points)
        user_name = member.user.name or member.user.email or 'Member'
        message = f'{user_name} completed profile details (+{points} pts)'
        record_activity(
            group=group,
            member=member,
            event_type='profile_completed',
            metadata={
                'member_name': user_name,
                'user_name': user_name,
                'user_id': str(member.user_id),
                'points': points,
                'message': message,
            },
        )
    return tx


