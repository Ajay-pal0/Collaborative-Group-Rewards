import uuid
from django.conf import settings
from django.db import models


class VerificationType(models.TextChoices):
    AADHAAR = 'AADHAAR', 'Aadhaar'
    PAN = 'PAN', 'PAN'


class VerificationStatus(models.TextChoices):
    NOT_STARTED = 'NOT_STARTED', 'Not Started'
    PENDING = 'PENDING', 'Pending'
    VERIFIED = 'VERIFIED', 'Verified'
    FAILED = 'FAILED', 'Failed'
    EXPIRED = 'EXPIRED', 'Expired'


class IdentityVerification(models.Model):
    """
    Canonical identity verification status record per user and document type.
    Stores backend-verified identity outcomes from Surepass.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='identity_verifications'
    )
    verification_type = models.CharField(
        max_length=20,
        choices=VerificationType.choices,
        db_index=True
    )
    status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.NOT_STARTED,
        db_index=True
    )
    provider = models.CharField(max_length=50, default='SUREPASS')
    provider_reference = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Provider session/client ID (e.g. client_id from Surepass)'
    )
    masked_id = models.CharField(
        max_length=50,
        blank=True,
        default='',
        help_text='Masked document identifier (e.g. ABCDE****A or XXXXXXXX1234)'
    )
    registered_name = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Name returned from government registry'
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text='Sanitized provider metadata (no unmasked secrets or sensitive PII)'
    )
    error_message = models.TextField(blank=True, default='')
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kyc_identity_verifications'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'verification_type'],
                name='unique_user_verification_type'
            )
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.verification_type} ({self.status})'

    @property
    def is_verified(self) -> bool:
        return self.status == VerificationStatus.VERIFIED

    @property
    def badge(self) -> dict:
        label = f'{self.get_verification_type_display()} Verified'
        return {
            'label': label,
            'awarded': self.is_verified,
            'status': self.status.lower(),
        }


class IdentityVerificationAudit(models.Model):
    """
    Immutable audit history for identity verification state changes and attempts.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    verification = models.ForeignKey(
        IdentityVerification,
        on_delete=models.CASCADE,
        related_name='audit_records',
        null=True,
        blank=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='identity_audit_records'
    )
    verification_type = models.CharField(max_length=20, choices=VerificationType.choices)
    action = models.CharField(
        max_length=50,
        help_text='Action taken (INITIATED, SUCCESS, FAILED, CALLBACK_PROCESSED)'
    )
    status_before = models.CharField(max_length=20, blank=True, default='')
    status_after = models.CharField(max_length=20, blank=True, default='')
    provider_reference = models.CharField(max_length=255, blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'kyc_identity_verification_audits'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.action} ({self.status_after}) at {self.created_at}'


class VerificationConsent(models.Model):
    """
    Records informed user consent for compliance, identity verification, or credit inquiries.
    """
    class ConsentType(models.TextChoices):
        AADHAAR = 'AADHAAR', 'Aadhaar'
        PAN = 'PAN', 'PAN'
        CREDIT = 'CREDIT', 'Credit'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='verification_consents'
    )
    verification = models.ForeignKey(
        IdentityVerification,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='consents'
    )
    verification_type = models.CharField(max_length=20, choices=ConsentType.choices)
    purpose = models.CharField(max_length=255)
    disclosure_version = models.CharField(max_length=50, default='v1.0')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    consent_given = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'kyc_verification_consents'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - Consent for {self.verification_type} ({self.created_at})'
