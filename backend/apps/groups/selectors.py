from django.db.models import QuerySet
from apps.groups.models import Group, GroupMember
from apps.activities.models import Activity
from typing import Any


def get_user_active_groups(user: Any) -> QuerySet[Group]:
    """
    Retrieves all groups where the specified user has an active membership.
    """
    group_ids = GroupMember.objects.filter(
        user=user, status='active'
    ).values_list('group_id', flat=True)
    return Group.objects.filter(id__in=group_ids)


def get_group_recent_activities(group: Group, limit: int = 50) -> QuerySet[Activity]:
    """
    Retrieves the most recent activities for a group, ordered chronologically descending.
    """
    return Activity.objects.filter(group=group).order_by('-created_at')[:limit]
