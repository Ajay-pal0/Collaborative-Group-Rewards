import uuid
from django.db import models


class Activity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        'groups.Group', on_delete=models.CASCADE, related_name='activities'
    )
    member = models.ForeignKey(
        'groups.GroupMember', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='activities'
    )
    event_type = models.CharField(max_length=50)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activities'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['group', '-created_at']),
        ]

    def __str__(self):
        return f'{self.event_type} in {self.group.name}'
