import uuid
from django.db import models
from django.conf import settings


class RewardRule(models.Model):
    ACTION_CHOICES = [
        ('GROUP_CREATED', 'Group Created'),
        ('INVITE_CREATED', 'Invite Created'),
        ('PARTICIPANT_JOINED', 'Participant Joined'),
        ('PROFILE_COMPLETED', 'Profile Completed'),
        ('TASK_COMPLETED', 'Task Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    action_type = models.CharField(max_length=50, choices=ACTION_CHOICES, unique=True)
    points = models.PositiveIntegerField()
    description = models.CharField(max_length=255, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reward_rules'

    def __str__(self):
        return f'{self.action_type}: {self.points} pts'


class PointTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        'groups.Group', on_delete=models.CASCADE, related_name='point_transactions'
    )
    member = models.ForeignKey(
        'groups.GroupMember', on_delete=models.CASCADE, related_name='point_transactions'
    )
    action_type = models.CharField(max_length=50)
    reference_id = models.CharField(max_length=255)
    points = models.IntegerField()
    idempotency_key = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'point_transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['group', 'action_type']),
            models.Index(fields=['idempotency_key']),
        ]

    def __str__(self):
        return f'+{self.points} pts [{self.action_type}] in {self.group.name}'


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    points = models.PositiveIntegerField(default=150)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tasks'

    def __str__(self):
        return self.name


class Benefit(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    required_points = models.PositiveIntegerField()
    display_order = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'benefits'
        ordering = ['required_points', 'display_order']

    def __str__(self):
        return f'{self.name} ({self.required_points} pts)'


class BenefitClaim(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        'groups.Group', on_delete=models.CASCADE, related_name='benefit_claims'
    )
    benefit = models.ForeignKey(Benefit, on_delete=models.CASCADE, related_name='claims')
    claimed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='benefit_claims'
    )
    claimed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'benefit_claims'
        unique_together = [('group', 'benefit', 'claimed_by')]

    def __str__(self):
        return f'{self.benefit.name} claimed in {self.group.name}'
