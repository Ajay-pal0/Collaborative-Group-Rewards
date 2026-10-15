import logging
from typing import Any

from apps.common.integrations.client import ExternalApiClient
from apps.common.security import validate_pan_format, mask_pan
from apps.kyc.services.surepass_service import SurepassIntegrationService
from apps.kyc.services.kyc_service import verify_user_pan as kyc_verify_pan
from apps.users.models import User, PanVerification

logger = logging.getLogger('users.pan_service')


class SurepassPanVerificationService:
    """
    Dedicated integration service for Surepass PAN verification API.
    Interacts with Surepass exclusively via the centralized ExternalApiClient.
    """

    PROVIDER = 'surepass'
    API_NAME = 'pan_comprehensive'

    def __init__(self, client: ExternalApiClient | None = None):
        self._service = SurepassIntegrationService(client=client)

    def verify_pan(self, pan: str, reason: str = 'Verification of user PAN for reward distribution') -> dict[str, Any]:
        """
        Executes external verification with Surepass.
        Returns a dictionary with status, parsed details, and error message.
        """
        return self._service.verify_pan_comprehensive(pan=pan, consent='Y')


# Alias for backwards compatibility with existing references
SetuPanVerificationService = SurepassPanVerificationService


def verify_user_pan(
    user: User,
    pan: str,
    service: Any = None,
) -> dict[str, Any]:
    """
    Main business transaction for PAN verification via Surepass:
    Delegates to the unified KYC verification layer.
    """
    surepass_service = None
    if service is not None:
        if isinstance(service, SurepassIntegrationService):
            surepass_service = service
        elif hasattr(service, '_service'):
            surepass_service = service._service
        else:
            surepass_service = service

    return kyc_verify_pan(
        user=user,
        pan=pan,
        consent=True,
        service=surepass_service,
    )
