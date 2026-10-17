import logging
from apps.users.models import User

logger = logging.getLogger('users.update_password')


def update_user_password(
    user: User, current_password: str, new_password: str
) -> tuple[bool, str]:
    """
    Validates current password and updates the authenticated user's password.
    Returns (success: bool, message: str).
    """
    if not user.check_password(current_password):
        return False, "Current password is incorrect."

    if current_password == new_password:
        return (
            False,
            "New password must be different from your current password.",
        )

    if len(new_password) < 6:
        return False, "New password must be at least 6 characters."

    user.set_password(new_password)
    user.save(update_fields=['password'])
    logger.info(f"Password successfully updated for user {user.email}")
    return True, "Password updated successfully."
