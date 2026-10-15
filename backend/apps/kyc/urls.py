from django.urls import path
from apps.kyc.views import (
    KycStatusView,
    PanVerifyView,
    AadhaarInitiateView,
    AadhaarVerifyView,
    AadhaarCallbackView,
    AadhaarCancelView,
    KycCreditReportView,
)
from apps.kyc.webhooks import DigilockerWebhookView

urlpatterns = [
    # Status
    path('status/', KycStatusView.as_view(), name='kyc-status'),
    path('aadhaar/status/', KycStatusView.as_view(), name='kyc-aadhaar-status'),

    # Aadhaar DigiLocker (supports both standard and v1 nomenclature)
    path('aadhaar/initialize/', AadhaarInitiateView.as_view(), name='kyc-aadhaar-initialize'),
    path('aadhaar/initiate/', AadhaarInitiateView.as_view(), name='kyc-aadhaar-initiate'),
    path('aadhaar/complete/', AadhaarVerifyView.as_view(), name='kyc-aadhaar-complete'),
    path('aadhaar/verify/', AadhaarVerifyView.as_view(), name='kyc-aadhaar-verify'),
    path('aadhaar/cancel/', AadhaarCancelView.as_view(), name='kyc-aadhaar-cancel'),
    path('aadhaar/callback/', AadhaarCallbackView.as_view(), name='kyc-aadhaar-callback'),

    # PAN Verification
    path('pan/verify/', PanVerifyView.as_view(), name='kyc-pan-verify'),

    # Credit Report (KYC integration)
    path('credit-report/', KycCreditReportView.as_view(), name='kyc-credit-report'),

    # Webhook
    path('webhooks/digilocker/', DigilockerWebhookView.as_view(), name='kyc-webhook-digilocker'),
]
