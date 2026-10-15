import uuid
from django.conf import settings
from django.db import models


class CreditReportStatus(models.TextChoices):
    NOT_REQUESTED = 'NOT_REQUESTED', 'Not Requested'
    PENDING = 'PENDING', 'Pending'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'
    PENDING_PROVIDER_ACCESS = 'PENDING_PROVIDER_ACCESS', 'Pending Provider Access'


class CreditReport(models.Model):
    """
    Stores access-controlled credit summary and report metadata for an authorized user.
    Keeps credit data strictly separated from identity verification.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='credit_reports'
    )
    provider = models.CharField(max_length=50, default='SUREPASS')
    provider_reference = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Provider report/inquiry reference ID'
    )
    status = models.CharField(
        max_length=30,
        choices=CreditReportStatus.choices,
        default=CreditReportStatus.NOT_REQUESTED,
        db_index=True
    )
    credit_score = models.IntegerField(
        null=True,
        blank=True,
        help_text='Bureau credit score (300-900), only populated when authorized report returns it'
    )
    score_band = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text='Categorical band (e.g. Excellent, Good, Fair, Poor)'
    )
    total_outstanding = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Total outstanding loan/credit debt balance'
    )
    active_accounts_count = models.IntegerField(
        default=0,
        help_text='Number of active credit/loan accounts'
    )
    overdue_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Total overdue balance across credit lines'
    )
    report_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Minimized, access-controlled report data (no raw unmasked PII or credentials)'
    )
    status_message = models.TextField(blank=True, default='')
    consent_at = models.DateTimeField(null=True, blank=True)
    fetched_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'credit_reports'
        ordering = ['-created_at']

    def __str__(self):
        score_str = f'Score: {self.credit_score}' if self.credit_score else 'No Score'
        return f'{self.user.email} - Credit Report ({self.status}, {score_str})'

    @property
    def has_valid_score(self) -> bool:
        return self.status == CreditReportStatus.COMPLETED and self.credit_score is not None
