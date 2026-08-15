from django.urls import path
from .views import (
    TaskListView, TaskCompleteView,
    BenefitListView, BenefitClaimView,
    GroupPointsView, UserPointsView, ProfileCompleteView
)

urlpatterns = [
    path('tasks/', TaskListView.as_view(), name='task-list'),
    path('groups/<uuid:group_id>/tasks/<uuid:task_id>/complete/', TaskCompleteView.as_view(), name='task-complete'),
    path('groups/<uuid:group_id>/profile/complete/', ProfileCompleteView.as_view(), name='profile-complete'),
    path('groups/<uuid:group_id>/benefits/', BenefitListView.as_view(), name='benefit-list'),
    path('groups/<uuid:group_id>/benefits/<uuid:benefit_id>/claim/', BenefitClaimView.as_view(), name='benefit-claim'),
    path('groups/<uuid:group_id>/points/', GroupPointsView.as_view(), name='group-points'),
    path('groups/<uuid:group_id>/user-points/', UserPointsView.as_view(), name='user-points'),
]

