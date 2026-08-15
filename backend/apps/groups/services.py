import secrets
from django.db import transaction, IntegrityError
from django.utils import timezone
from .models import Group, GroupMember, Invitation
from apps.rewards.services import award_points
from apps.activities.services import record_activity


def create_group(user, name, group_type, group_id=None):
    """
    Creates a group, assigns the owner as first member, and fires the
    GROUP_CREATED reward — all in one atomic transaction.
    Supports client-side UUID idempotency.
    """
    if group_id:
        existing = Group.objects.filter(id=group_id).first()
        if existing:
            return existing

    try:
        with transaction.atomic():
            kwargs = {'name': name, 'group_type': group_type, 'created_by': user}
            if group_id:
                kwargs['id'] = group_id
            group = Group.objects.create(**kwargs)
            membership = GroupMember.objects.create(
                group=group,
                user=user,
                role='owner',
            )
            award_points(
                group=group,
                member=membership,
                action_type='GROUP_CREATED',
                reference_id=str(group.id),
            )
            record_activity(
                group=group,
                member=membership,
                event_type='group_created',
                metadata={'group_name': name},
            )
        return group
    except IntegrityError:
        if group_id:
            return Group.objects.get(id=group_id)
        raise


def get_or_create_invitation(group, user):
    """
    Returns the most recent active invitation for the group, or creates one.
    Awards INVITE_CREATED points only for new invitations.
    """
    # Find an existing active, non-expired invitation
    existing = Invitation.objects.filter(
        group=group,
        status='active',
        expires_at__gt=timezone.now(),
    ).order_by('-created_at').first()

    if existing:
        return existing, False  # (invitation, created)

    with transaction.atomic():
        token = secrets.token_urlsafe(32)
        invitation = Invitation.objects.create(
            group=group,
            token=token,
            created_by=user,
            expires_at=timezone.now() + timezone.timedelta(days=7),
        )
        membership = GroupMember.objects.get(group=group, user=user)
        award_points(
            group=group,
            member=membership,
            action_type='INVITE_CREATED',
            reference_id=str(invitation.id),
        )
        record_activity(
            group=group,
            member=membership,
            event_type='invite_created',
            metadata={'token': token[:8] + '...'},
        )
    return invitation, True


def join_group(invitation_token, user):
    """
    Validates invitation, creates membership, awards PARTICIPANT_JOINED points.
    All in one atomic transaction.
    """
    try:
        invitation = Invitation.objects.select_related('group').get(token=invitation_token)
    except Invitation.DoesNotExist:
        raise ValueError('Invitation not found.')

    if not invitation.is_valid:
        if invitation.expires_at <= timezone.now():
            raise ValueError('This invitation has expired.')
        raise ValueError('This invitation is no longer valid.')

    group = invitation.group

    # Check if already a member
    if GroupMember.objects.filter(group=group, user=user).exists():
        # Return existing membership without error — idempotent
        membership = GroupMember.objects.get(group=group, user=user)
        return group, membership, False  # (group, membership, newly_joined)

    with transaction.atomic():
        membership = GroupMember.objects.create(
            group=group,
            user=user,
            role='member',
        )
        award_points(
            group=group,
            member=membership,
            action_type='PARTICIPANT_JOINED',
            reference_id=f'{group.id}:{user.id}',
        )
        record_activity(
            group=group,
            member=membership,
            event_type='member_joined',
            metadata={'member_name': user.name},
        )
    return group, membership, True
