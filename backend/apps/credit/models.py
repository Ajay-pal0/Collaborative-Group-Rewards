import uuid
from django.conf import settings
from django.db import models


class CreditRequestType(models.TextChoices):
    SCORE = 'SCORE', 'Score Only'
    FULL_REPORT = 'FULL_REPORT', 'Full CIBIL Report'


class CreditRequestStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'


class CreditReportStatus(models.TextChoices):
    NOT_REQUESTED = 'NOT_REQUESTED', 'Not Requested'
    PENDING = 'PENDING', 'Pending'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'
    PENDING_PROVIDER_ACCESS = 'PENDING_PROVIDER_ACCESS', 'Pending Provider Access'


class CreditReportRequest(models.Model):
    """
    Tracks individual requests made to bureau/Surepass credit endpoints.
    Distinguishes Score inquiries from Full CIBIL Report fetches.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='credit_requests'
    )
    request_type = models.CharField(
        max_length=20,
        choices=CreditRequestType.choices,
        default=CreditRequestType.SCORE,
        db_index=True
    )
    provider = models.CharField(max_length=50, default='SUREPASS')
    environment = models.CharField(max_length=50, default='SANDBOX')
    provider_client_reference = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Bureau client_id or inquiry tracking reference'
    )
    status = models.CharField(
        max_length=20,
        choices=CreditRequestStatus.choices,
        default=CreditRequestStatus.PENDING,
        db_index=True
    )
    consent_reference = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Reference ID of associated VerificationConsent record'
    )
    error_code = models.CharField(max_length=50, blank=True, default='')
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'credit_report_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.request_type} ({self.status})'


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
    request = models.ForeignKey(
        CreditReportRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports'
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
    high_credit_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Highest sanctioned or credit limit amount'
    )
    overdue_accounts_count = models.IntegerField(
        default=0,
        help_text='Number of accounts with past-due payments'
    )
    zero_balance_accounts_count = models.IntegerField(
        default=0,
        help_text='Number of closed or settled zero-balance accounts'
    )
    oldest_account_date = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text='Date of earliest reported credit account'
    )
    recent_account_date = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text='Date of most recently opened credit account'
    )
    total_enquiries_count = models.IntegerField(
        default=0,
        help_text='Total number of bureau enquiries recorded'
    )
    recent_enquiry_date = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text='Date of most recent bureau inquiry'
    )

    # Structured normalized bureau details (sanitized & masked)
    accounts_summary = models.JSONField(
        default=dict,
        blank=True,
        help_text='accountSummary breakdown from bureau response'
    )
    inquiry_summary = models.JSONField(
        default=dict,
        blank=True,
        help_text='inquirySummary breakdown from bureau response'
    )
    accounts_data = models.JSONField(
        default=list,
        blank=True,
        help_text='Sanitized accounts list with masked numbers, lender, balances, status'
    )
    enquiries_data = models.JSONField(
        default=list,
        blank=True,
        help_text='Sanitized list of enquiries with lender and date'
    )
    report_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Minimized, access-controlled report data (no raw unmasked PII or credentials)'
    )
    schema_version = models.CharField(max_length=20, default='v1.0')

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
