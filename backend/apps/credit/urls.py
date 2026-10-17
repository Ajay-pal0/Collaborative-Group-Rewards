from django.urls import path
from apps.credit.views import (
    CreditProfileView,
    CreditScoreView,
    CreditFullReportView,
    CreditReportView,
)

urlpatterns = [
    path('profile/', CreditProfileView.as_view(), name='credit-profile'),
    path('score/', CreditScoreView.as_view(), name='credit-score'),
    path('full-report/', CreditFullReportView.as_view(), name='credit-full-report'),
    path('report/', CreditReportView.as_view(), name='credit-report'),
]
