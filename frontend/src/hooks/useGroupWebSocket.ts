import { useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  event?: string;
  data?: Record<string, unknown>;
  group_id?: string;
  message?: string;
}

interface UseGroupWebSocketOptions {
  groupId?: string;
  onUpdate?: (event: string, data?: Record<string, unknown>) => void;
  enabled?: boolean;
}

export function useGroupWebSocket({
  groupId,
  onUpdate,
  enabled = true,
}: UseGroupWebSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  const connect = useCallback(() => {
    if (!groupId || !enabled) return;

    // Determine WebSocket URL from environment or current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the proxied /ws endpoint through Vite dev server or current origin
    const wsUrl = `${protocol}//${window.location.host}/ws/groups/${groupId}/`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        // Send initial ping to keep alive
        ws.send(JSON.stringify({ action: 'ping' }));
      };

      ws.onmessage = (event) => {
        try {
          const payload: WebSocketMessage = JSON.parse(event.data);
          if (payload.type === 'update' && payload.event) {
            onUpdateRef.current?.(payload.event, payload.data);
          } else if (payload.type === 'refresh_requested') {
            onUpdateRef.current?.('refresh', payload.data);
          }
        } catch {
          // Ignore non-json frames
        }
      };

      ws.onclose = () => {
        socketRef.current = null;
        // Auto-reconnect after 3 seconds if still mounted
        if (enabled && groupId) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current();
          }, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // Reconnect on next interval
      reconnectTimeoutRef.current = setTimeout(() => {
        connectRef.current();
      }, 5000);
    }
  }, [groupId, enabled]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  const requestRefresh = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'refresh' }));
    }
  }, []);

  return { requestRefresh };
}
