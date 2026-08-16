import uuid
import secrets
from django.db import models
from django.conf import settings
from django.utils import timezone


class Group(models.Model):
    TYPE_CHOICES = [
        ('friends', 'Friends'),
        ('family', 'Family'),
        ('colleagues', 'Colleagues'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    group_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='owned_groups'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    cached_total_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'groups'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def total_points(self):
        if self.cached_total_points > 0:
            return self.cached_total_points
        from apps.rewards.models import PointTransaction
        result = PointTransaction.objects.filter(group=self).exclude(action_type='BENEFIT_CLAIMED').aggregate(
            total=models.Sum('points')
        )
        return result['total'] or 0


    @property
    def member_count(self):
        return self.memberships.filter(status='active').count()


class GroupMember(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('member', 'Member'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('left', 'Left'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_members'
        unique_together = [('group', 'user')]

    def __str__(self):
        return f'{self.user.name} in {self.group.name} ({self.role})'


class Invitation(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('revoked', 'Revoked'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='invitations')
    token = models.CharField(max_length=64, unique=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='created_invitations'
    )
    expires_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invitations'

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=7)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return self.status == 'active' and self.expires_at > timezone.now()

    def __str__(self):
        return f'Invite to {self.group.name} ({self.token[:8]}...)'
