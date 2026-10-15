from django.urls import path
from apps.credit.views import CreditProfileView, CreditReportView

urlpatterns = [
    path('profile/', CreditProfileView.as_view(), name='credit-profile'),
    path('report/', CreditReportView.as_view(), name='credit-report'),
]
