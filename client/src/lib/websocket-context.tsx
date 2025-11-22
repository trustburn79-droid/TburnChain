import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

interface WebSocketContextValue {
  socket: WebSocket | null;
  isConnected: boolean;
  lastMessage: MessageEvent | null;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  socket: null,
  isConnected: false,
  lastMessage: null,
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
      };

      socket.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };

      socket.onclose = () => {
        console.log("[WebSocket] Connection closed");
        setIsConnected(false);
        socketRef.current = null;

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
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
