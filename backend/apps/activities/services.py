from typing import Any
from .models import Activity
from apps.groups.broadcast import broadcast_group_update


def record_activity(
    group: Any,
    member: Any,
    event_type: str,
    metadata: dict[str, Any] | None = None,
) -> Activity:
    """
    Creates an activity record for group feed and broadcasts via WebSocket.
    """
    activity = Activity.objects.create(
        group=group,
        member=member,
        event_type=event_type,
        metadata=metadata or {},
    )
    member_user = getattr(member, 'user', None) if member else None
    user_name = (
        getattr(member_user, 'name', None)
        or getattr(member_user, 'email', 'Member')
        if member_user else 'Member'
    )
    user_id = str(member_user.id) if member_user else None
    user_email = getattr(member_user, 'email', None) if member_user else None

    broadcast_group_update(
        group_id=str(group.id),
        event_type=event_type,
        data={
            'id': str(activity.id),
            'event_type': event_type,
            'member_id': str(member.id) if member else None,
            'user_id': user_id,
            'user_email': user_email,
            'member_name': user_name,
            'metadata': metadata or {},
            'total_points': getattr(group, 'total_points', 0),
            'created_at': activity.created_at.isoformat(),
        },
    )
    return activity
