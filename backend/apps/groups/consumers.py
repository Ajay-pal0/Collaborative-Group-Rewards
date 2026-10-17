import logging
from typing import Any
from channels.generic.websocket import AsyncJsonWebsocketConsumer

logger = logging.getLogger('groups.websocket')


class GroupUpdatesConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer that delivers real-time collaborative updates (points,
    tasks, activities, benefits) to all connected squad members for a group.
    """

    group_id: str | None = None
    group_channel_name: str | None = None

    async def connect(self) -> None:
        kwargs = self.scope.get('url_route', {}).get('kwargs', {})
        self.group_id = kwargs.get('group_id')
        if not self.group_id:
            await self.close(code=4000)
            return

        self.group_channel_name = f"group_{self.group_id}"

        # Join the group broadcast layer
        await self.channel_layer.group_add(
            self.group_channel_name,
            self.channel_name,
        )
        await self.accept()

        logger.info(f"WebSocket client connected to group {self.group_id}")
        await self.send_json({
            'type': 'connected',
            'group_id': self.group_id,
            'message': 'Real-time WebSocket connection established.',
        })

    async def disconnect(self, close_code: int) -> None:
        if self.group_channel_name:
            await self.channel_layer.group_discard(
                self.group_channel_name,
                self.channel_name,
            )
        logger.info(
            f"WebSocket client disconnected from group {self.group_id}: "
            f"{close_code}"
        )

    async def receive_json(
        self, content: dict[str, Any], **kwargs: Any
    ) -> None:
        action = content.get('action')
        if action == 'ping':
            await self.send_json({'type': 'pong'})
        elif action == 'refresh':
            await self.send_json({
                'type': 'refresh_requested',
                'group_id': self.group_id,
            })

    async def group_message(self, event: dict[str, Any]) -> None:
        """
        Handler for messages broadcasted to group_<id> channel.
        """
        await self.send_json({
            'type': 'update',
            'event': event.get('event', 'group_updated'),
            'data': event.get('data', {}),
        })
