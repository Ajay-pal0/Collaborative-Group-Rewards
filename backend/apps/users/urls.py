from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, MeView, PanVerifyView, PanStatusView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('pan/verify/', PanVerifyView.as_view(), name='pan-verify'),
    path('pan/status/', PanStatusView.as_view(), name='pan-status'),
]
