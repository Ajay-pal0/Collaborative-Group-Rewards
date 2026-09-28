from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    MeView,
    PanVerifyView,
    PanStatusView,
    CheckEmailView,
    ForgotPasswordView,
    ResetPasswordView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('pan/verify/', PanVerifyView.as_view(), name='pan-verify'),
    path('pan/status/', PanStatusView.as_view(), name='pan-status'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('password-reset/check-email/', CheckEmailView.as_view(), name='password-reset-check-email'),
    path('password-reset/confirm/', ResetPasswordView.as_view(), name='password-reset-confirm'),
]
