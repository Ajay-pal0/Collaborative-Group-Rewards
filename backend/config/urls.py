from django.contrib import admin
from django.urls import path, include

from apps.kyc.webhooks import DigilockerWebhookView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Unified KYC & Identity APIs
    path('api/kyc/', include('apps.kyc.urls')),
    path('api/v1/kyc/', include('apps.kyc.urls')),
    path('api/webhooks/surepass/digilocker', DigilockerWebhookView.as_view(), name='surepass-webhook'),
    path('api/webhooks/surepass/digilocker/', DigilockerWebhookView.as_view(), name='surepass-webhook-slash'),
    # Credit Information
    path('api/credit/', include('apps.credit.urls')),
    path('api/v1/credit/', include('apps.credit.urls')),
    # Auth & Application APIs
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.groups.urls')),
    path('api/', include('apps.rewards.urls')),
]
