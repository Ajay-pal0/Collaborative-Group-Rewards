import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, default='')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.name} <{self.email}>'

    @property
    def pan_verification_record(self):
        return getattr(self, 'pan_verification', None)

    @property
    def pan_verified(self):
        rec = self.pan_verification_record
        return rec.is_verified if rec else False

    @property
    def pan_masked(self):
        rec = self.pan_verification_record
        return rec.pan_masked if rec else ''

    @property
    def pan_registered_name(self):
        rec = self.pan_verification_record
        return rec.registered_name if rec else ''

    @property
    def pan_verified_at(self):
        rec = self.pan_verification_record
        return rec.verified_at if rec else None


class PanVerification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='pan_verification'
    )
    pan_number = models.CharField(max_length=10, help_text='10-character PAN number')
    is_verified = models.BooleanField(default=False, db_index=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_id = models.CharField(max_length=255, blank=True, default='', help_text='Setu verification ID')
    registered_name = models.CharField(max_length=255, blank=True, default='', help_text='Name returned from PAN registry')
    category = models.CharField(max_length=100, blank=True, default='')
    aadhaar_seeding_status = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pan_verifications'
        ordering = ['-created_at']

    def __str__(self):
        status = 'Verified' if self.is_verified else 'Unverified'
        return f'{self.user.email} - {self.pan_masked} ({status})'

    @property
    def pan_masked(self):
        from apps.common.security import mask_pan
        return mask_pan(self.pan_number)

