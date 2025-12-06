import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface ScanWebSocketState {
  isConnected: boolean;
  lastUpdate: number | null;
  error: string | null;
  latestBlock: any | null;
  latestTransaction: any | null;
  networkStats: any | null;
}

export function useScanWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  
  const [state, setState] = useState<ScanWebSocketState>({
    isConnected: false,
    lastUpdate: null,
    error: null,
    latestBlock: null,
    latestTransaction: null,
    networkStats: null
  });

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[ScanWS] Connected to server');
        reconnectAttempts.current = 0;
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          channels: ['block_updates', 'network_stats', 'validators_update']
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (e) {
          console.error('[ScanWS] Failed to parse message:', e);
        }
      };

      wsRef.current.onclose = () => {
        console.log('[ScanWS] Connection closed');
        setState(prev => ({ ...prev, isConnected: false }));
        scheduleReconnect();
      };

      wsRef.current.onerror = (error) => {
        console.error('[ScanWS] Error:', error);
        setState(prev => ({ ...prev, error: 'WebSocket connection error' }));
      };
    } catch (error) {
      console.error('[ScanWS] Failed to create WebSocket:', error);
      scheduleReconnect();
    }
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    const { type, data, timestamp } = message;

    switch (type) {
      case 'block_updates':
      case 'new_block':
        setState(prev => ({
          ...prev,
          latestBlock: data,
          lastUpdate: timestamp || Date.now()
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/public/v1/network/blocks/recent'] });
        queryClient.invalidateQueries({ queryKey: ['/api/public/v1/network/stats'] });
        break;

      case 'new_transaction':
        setState(prev => ({
          ...prev,
          latestTransaction: data,
          lastUpdate: timestamp || Date.now()
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/public/v1/network/transactions/recent'] });
        break;

      case 'network_stats':
        setState(prev => ({
          ...prev,
          networkStats: data,
          lastUpdate: timestamp || Date.now()
        }));
        queryClient.invalidateQueries({ queryKey: ['/api/public/v1/network/stats'] });
        break;

      case 'validators_update':
        queryClient.invalidateQueries({ queryKey: ['/api/public/v1/validators'] });
        break;

      default:
        break;
    }
  }, [queryClient]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setState(prev => ({ ...prev, error: 'Max reconnection attempts reached' }));
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current += 1;

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`[ScanWS] Reconnecting (attempt ${reconnectAttempts.current})...`);
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    ...state,
    reconnect: connect,
    disconnect
  };
}

export function useLiveIndicator() {
  const [isLive, setIsLive] = useState(true);
  const [lastPulse, setLastPulse] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastPulse(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { isLive, lastPulse };
}
