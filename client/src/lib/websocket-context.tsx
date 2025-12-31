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

// Reconnection configuration for stability
const RECONNECT_CONFIG = {
  maxAttempts: 5, // Maximum reconnection attempts before giving up
  maxDelay: 30000, // Maximum delay between attempts (30 seconds)
  cooldownResetMs: 60000, // Reset attempts after 60 seconds of stable connection
};

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const lastConnectedTimeRef = useRef<number>(0);
  const cooldownResetTimerRef = useRef<NodeJS.Timeout>();
  const isActiveRef = useRef<boolean>(true); // Guard for component unmount
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
        lastConnectedTimeRef.current = Date.now();
        
        // Set up cooldown reset timer - reset attempts counter after stable connection
        if (cooldownResetTimerRef.current) {
          clearTimeout(cooldownResetTimerRef.current);
        }
        cooldownResetTimerRef.current = setTimeout(() => {
          reconnectAttemptsRef.current = 0;
          console.log("[WebSocket] Cooldown reset - connection stable for 60s");
        }, RECONNECT_CONFIG.cooldownResetMs);
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
        
        // Clear cooldown reset timer
        if (cooldownResetTimerRef.current) {
          clearTimeout(cooldownResetTimerRef.current);
        }

        // Guard: Don't reconnect if component is unmounting
        if (!isActiveRef.current) {
          console.log("[WebSocket] Component unmounting, not reconnecting");
          return;
        }

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

        // Check max reconnect attempts
        if (reconnectAttemptsRef.current >= RECONNECT_CONFIG.maxAttempts) {
          console.warn(`[WebSocket] Max reconnection attempts (${RECONNECT_CONFIG.maxAttempts}) reached. Stopping reconnection.`);
          console.log("[WebSocket] Will rely on REST polling for data. Refresh page to retry WebSocket.");
          return;
        }

        // Exponential backoff with jitter to prevent thundering herd
        const baseDelay = Math.min(
          1000 * Math.pow(2, reconnectAttemptsRef.current), 
          RECONNECT_CONFIG.maxDelay
        );
        const jitter = Math.random() * 1000; // Add 0-1000ms of random jitter
        const delay = baseDelay + jitter;
        reconnectAttemptsRef.current++;

        console.log(`[WebSocket] Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttemptsRef.current}/${RECONNECT_CONFIG.maxAttempts})`);
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
    isActiveRef.current = true;
    connect();

    return () => {
      // Mark as inactive to prevent reconnection attempts
      isActiveRef.current = false;
      
      if (cooldownResetTimerRef.current) {
        clearTimeout(cooldownResetTimerRef.current);
      }
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
