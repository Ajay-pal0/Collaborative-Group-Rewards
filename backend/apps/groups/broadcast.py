import asyncio
import logging
from typing import Any
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger('groups.broadcast')


async def async_broadcast_group_update(
    group_id: str,
    event_type: str = 'group_updated',
    data: dict[str, Any] | None = None,
) -> None:
    """Async broadcast directly awaiting channel_layer.group_send."""
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        await channel_layer.group_send(
            f"group_{group_id}",
            {
                'type': 'group.message',
                'event': event_type,
                'data': data or {},
            },
        )
    except Exception as exc:
        logger.warning(
            f"Failed to broadcast async websocket update for {group_id}: {exc}"
        )


def broadcast_group_update(
    group_id: str,
    event_type: str = 'group_updated',
    data: dict[str, Any] | None = None,
) -> None:
    """
    Broadcasts real-time events to all WebSocket connections for group_id.
    Seamlessly works from synchronous views/services and active async loops.
    """
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        message = {
            'type': 'group.message',
            'event': event_type,
            'data': data or {},
        }

        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            asyncio.create_task(
                channel_layer.group_send(f"group_{group_id}", message)
            )
        else:
            async_to_sync(channel_layer.group_send)(
                f"group_{group_id}",
                message,
            )
    except Exception as exc:
        logger.warning(
            f"Failed to broadcast websocket update for {group_id}: {exc}"
        )
