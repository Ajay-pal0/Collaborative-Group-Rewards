from django.urls import path
from .views import (
    GroupListCreateView, GroupDetailView, GroupMembersView,
    InviteCreateView, InvitePreviewView, JoinGroupView, GroupActivityView
)

urlpatterns = [
    path('groups/', GroupListCreateView.as_view(), name='group-list-create'),
    path('groups/<uuid:group_id>/', GroupDetailView.as_view(), name='group-detail'),
    path('groups/<uuid:group_id>/members/', GroupMembersView.as_view(), name='group-members'),
    path('groups/<uuid:group_id>/invites/', InviteCreateView.as_view(), name='invite-create'),
    path('groups/<uuid:group_id>/activities/', GroupActivityView.as_view(), name='group-activities'),
    path('invites/<str:token>/', InvitePreviewView.as_view(), name='invite-preview'),
    path('invites/<str:token>/join/', JoinGroupView.as_view(), name='invite-join'),
]
