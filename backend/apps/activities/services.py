from .models import Activity


def record_activity(group, member, event_type, metadata=None):
    """Creates an activity record for the group feed."""
    return Activity.objects.create(
        group=group,
        member=member,
        event_type=event_type,
        metadata=metadata or {},
    )
