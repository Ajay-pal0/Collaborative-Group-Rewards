import hashlib
import logging
import secrets
from datetime import timedelta
from email.utils import parseaddr, formataddr
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from apps.users.models import PasswordResetToken, User

logger = logging.getLogger('users.password_reset')


def generate_password_reset_token(user: User) -> tuple[str, PasswordResetToken]:
    """
    Generates a cryptographically secure, short-lived reset token (20 min),
    stores its SHA-256 hash in the database, and returns (raw_token, token_obj).
    Any previous unused tokens for the user are invalidated.
    """
    # Invalidate old unused tokens for this user
    PasswordResetToken.objects.filter(user=user, used_at__isnull=True).delete()

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
    expires_at = timezone.now() + timedelta(minutes=20)

    token_obj = PasswordResetToken.objects.create(
        user=user,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    return raw_token, token_obj


def send_password_reset_email(user: User, raw_token: str) -> str:
    """
    Builds the reset URL and sends the password reset email to the user.
    Returns the reset link.
    """
    frontend_base = getattr(settings, 'FRONTEND_URL', 'https://collaborative-group-rewards.vercel.app').rstrip('/')
    reset_url = f"{frontend_base}/reset-password/{raw_token}"

    subject = "Reset Your Password - Collaborative Group Rewards"
    message_text = (
        f"Hello {user.name},\n\n"
        f"We received a request to reset your password for Collaborative Group Rewards.\n\n"
        f"Please click the link below to set a new password:\n"
        f"{reset_url}\n\n"
        f"This link is valid for 20 minutes and can only be used once.\n\n"
        f"If you did not request a password reset, you can safely ignore this email.\n\n"
        f"Best regards,\n"
        f"Collaborative Group Rewards Team"
    )

    html_message = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #171923; line-height: 1.5;">
        <h2 style="color: #635BFF; margin-top: 0;">Reset Your Password</h2>
        <p>Hello <strong>{user.name}</strong>,</p>
        <p>We received a request to reset your password for your <strong>Collaborative Group Rewards</strong> account.</p>
        <p style="margin: 24px 0;">
            <a href="{reset_url}" style="background-color: #635BFF; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
            </a>
        </p>
        <p style="font-size: 13px; color: #667085;">
            Or copy and paste this link into your browser:<br/>
            <a href="{reset_url}" style="color: #635BFF; word-break: break-all;">{reset_url}</a>
        </p>
        <p style="font-size: 12px; color: #98A2B3; margin-top: 24px; border-top: 1px solid #E7E9EE; padding-top: 16px;">
            This link is valid for <strong>20 minutes</strong> and can only be used once.<br/>
            If you did not request a password reset, please disregard this email.
        </p>
    </div>
    """

    raw_from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@group-rewards.app')
    cleaned_from = str(raw_from_email).strip().strip('\'"') if raw_from_email else 'noreply@group-rewards.app'
    display_name, email_address = parseaddr(cleaned_from)
    from_email = formataddr((display_name, email_address)) if (display_name and email_address) else (email_address or cleaned_from)

    try:
        send_mail(
            subject=subject,
            message=message_text,
            html_message=html_message,
            from_email=from_email,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Password reset email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send email to {user.email}: {e}")
        # If SMTP is configured or in production, re-raise so caller knows dispatch failed
        if not getattr(settings, 'DEBUG', False) or 'smtp' in str(getattr(settings, 'EMAIL_BACKEND', '')).lower():
            raise

    return reset_url


def verify_and_reset_password(raw_token: str, new_password: str) -> tuple[bool, str]:
    """
    Verifies the reset token and updates the user's password.
    Returns (success: bool, message: str).
    """
    if not raw_token or not str(raw_token).strip():
        return False, "Reset token is required."

    if not new_password or len(new_password) < 6:
        return False, "Password must be at least 6 characters."

    token_hash = hashlib.sha256(raw_token.strip().encode('utf-8')).hexdigest()

    reset_token = (
        PasswordResetToken.objects
        .filter(token_hash=token_hash)
        .select_related('user')
        .first()
    )

    if not reset_token:
        return False, "Invalid or expired password reset link."

    if reset_token.used_at is not None:
        return False, "This password reset link has already been used. Please request a new one."

    if reset_token.expires_at < timezone.now():
        return False, "This password reset link has expired. Please request a new one."

    user = reset_token.user
    user.set_password(new_password)
    user.save(update_fields=['password'])

    # Invalidate token
    reset_token.used_at = timezone.now()
    reset_token.save(update_fields=['used_at'])

    logger.info(f"Password reset successfully for user {user.email}")
    return True, "Password has been reset successfully."
