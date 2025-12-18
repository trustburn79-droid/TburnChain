import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { queryClient } from "./queryClient";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketContextValue {
  socket: WebSocket | null;
  isConnected: boolean;
  lastMessage: MessageEvent | null;
  subscribeToEvent: (eventType: string, callback: (data: any) => void) => (() => void);
}

const WebSocketContext = createContext<WebSocketContextValue>({
  socket: null,
  isConnected: false,
  lastMessage: null,
  subscribeToEvent: () => () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const eventListeners = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const connect = () => {
    try {
      // Get WebSocket URL from current location
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("[WebSocket] Connected to server");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        setLastMessage(event);
        
        // Parse message and notify event listeners
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          const listeners = eventListeners.current.get(message.type);
          if (listeners) {
            listeners.forEach(callback => {
              try {
                callback(message.data);
              } catch (error) {
                console.error(`[WebSocket] Error in event listener for ${message.type}:`, error);
              }
            });
          }
        } catch (error) {
          // Not all messages may be in our expected format, ignore parse errors
        }
      };

      socket.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };

      socket.onclose = () => {
        console.log("[WebSocket] Connection closed");
        setIsConnected(false);
        socketRef.current = null;

        // Trigger REST fallback for critical queries when WebSocket disconnects
        console.log("[WebSocket] Triggering REST fallback for critical queries");
        queryClient.invalidateQueries({ queryKey: ["/api/network/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dex/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/staking/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/lending/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/yield/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/liquid-staking/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/nft/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/launchpad/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/gamefi/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/bridge/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/burn/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/governance/stats"] });

        // Exponential backoff reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;

        console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    } catch (error) {
      console.error("[WebSocket] Failed to create connection:", error);
    }
  };

  // Subscribe to specific event types
  const subscribeToEvent = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!eventListeners.current.has(eventType)) {
      eventListeners.current.set(eventType, new Set());
    }
    eventListeners.current.get(eventType)?.add(callback);
    
    // Return unsubscribe function
    return () => {
      eventListeners.current.get(eventType)?.delete(callback);
      if (eventListeners.current.get(eventType)?.size === 0) {
        eventListeners.current.delete(eventType);
      }
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        lastMessage,
        subscribeToEvent,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
