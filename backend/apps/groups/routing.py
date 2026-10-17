from django.urls import re_path
from .consumers import GroupUpdatesConsumer

websocket_urlpatterns = [
    re_path(
        r'^ws/groups/(?P<group_id>[^/]+)/?$',
        GroupUpdatesConsumer.as_asgi(),
    ),
]
