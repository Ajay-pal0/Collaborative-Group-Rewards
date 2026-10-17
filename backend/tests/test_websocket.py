from django.test import TestCase
from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator
from config.asgi import application
from apps.groups.broadcast import async_broadcast_group_update


class WebSocketConsumerTests(TestCase):
    def test_websocket_connection_and_broadcast(self):
        @async_to_sync
        async def run_test():
            communicator = WebsocketCommunicator(
                application,
                "/ws/groups/test-group-123/",
            )
            connected, _ = await communicator.connect()
            assert connected

            # Receive connection welcome message
            response = await communicator.receive_json_from()
            assert response['type'] == 'connected'
            assert response['group_id'] == 'test-group-123'

            # Send ping action
            await communicator.send_json_to({'action': 'ping'})
            pong = await communicator.receive_json_from()
            assert pong['type'] == 'pong'

            # Broadcast test event to the channel
            await async_broadcast_group_update(
                group_id='test-group-123',
                event_type='task_completed',
                data={'points': 50, 'task_name': 'Verify Profile'},
            )

            update_msg = await communicator.receive_json_from()
            assert update_msg['type'] == 'update'
            assert update_msg['event'] == 'task_completed'
            assert update_msg['data']['points'] == 50

            await communicator.disconnect()

        run_test()
