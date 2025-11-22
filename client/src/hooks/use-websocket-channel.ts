import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useWebSocket } from "@/lib/websocket-context";

interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: number;
  lastSyncedAt: string;
}

interface UseWebSocketChannelOptions<T> {
  /**
   * The WebSocket message type/channel to subscribe to
   * e.g., 'ai_decisions_snapshot', 'consensus_round_update'
   */
  channel: string;

  /**
   * Zod schema for validating incoming data
   */
  schema: z.ZodType<T>;

  /**
   * Query key to update when data arrives
   * e.g., ['/api/ai/decisions']
   */
  queryKey: string | string[];

  /**
   * Whether this channel broadcasts snapshots (arrays) or single updates
   * - 'snapshot': Updates entire query data with array (e.g., ai_decisions_snapshot)
   * - 'update': Adds/updates single item in existing array (e.g., ai_decision_update)
   * - 'replace': Replaces entire query data (e.g., network_stats_update)
   */
  updateMode?: 'snapshot' | 'update' | 'replace';

  /**
   * Optional callback when validated data arrives
   */
  onMessage?: (data: T) => void;

  /**
   * Whether to enable this subscription (default: true)
   */
  enabled?: boolean;
}

/**
 * Subscribe to a WebSocket channel and automatically update TanStack Query cache
 * with Zod-validated data. Falls back to REST polling when disconnected.
 *
 * @example
 * ```tsx
 * useWebSocketChannel({
 *   channel: 'ai_decisions_snapshot',
 *   schema: aiDecisionsSnapshotSchema,
 *   queryKey: ['/api/ai/decisions'],
 *   updateMode: 'snapshot',
 * });
 * ```
 */
export function useWebSocketChannel<T>({
  channel,
  schema,
  queryKey,
  updateMode = 'snapshot',
  onMessage,
  enabled = true,
}: UseWebSocketChannelOptions<T>) {
  const { lastMessage, isConnected } = useWebSocket();
  const queryClient = useQueryClient();
  const processedTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !lastMessage || !isConnected) {
      return;
    }

    try {
      const message = JSON.parse(lastMessage.data) as WebSocketMessage;

      // Filter for our specific channel
      if (message.type !== channel) {
        return;
      }

      // Prevent duplicate processing (same timestamp)
      if (message.timestamp === processedTimestampRef.current) {
        return;
      }
      processedTimestampRef.current = message.timestamp;

      // Validate with Zod schema
      const parseResult = schema.safeParse(message.data);
      if (!parseResult.success) {
        console.error(
          `[WebSocket] Schema validation failed for channel '${channel}':`,
          parseResult.error
        );
        return;
      }

      const validatedData = parseResult.data;

      // Update TanStack Query cache based on update mode
      const normalizedKey = Array.isArray(queryKey) ? queryKey : [queryKey];

      switch (updateMode) {
        case 'snapshot':
          // Replace entire array (for periodic snapshots)
          queryClient.setQueryData(normalizedKey, validatedData);
          break;

        case 'update':
          // Add or update single item in existing array
          queryClient.setQueryData(normalizedKey, (oldData: any) => {
            if (!Array.isArray(oldData)) {
              return [validatedData];
            }
            // Try to find existing item by id and update it, or append
            const itemWithId = validatedData as any;
            if (itemWithId.id) {
              const index = oldData.findIndex((item: any) => item.id === itemWithId.id);
              if (index >= 0) {
                const newData = [...oldData];
                newData[index] = validatedData;
                return newData;
              }
            }
            // Prepend new item
            return [validatedData, ...oldData];
          });
          break;

        case 'replace':
          // Replace entire data (for single objects like network stats)
          queryClient.setQueryData(normalizedKey, validatedData);
          break;
      }

      // Trigger optional callback
      onMessage?.(validatedData);

      console.log(`[WebSocket] Updated cache for ${channel}:`, {
        queryKey: normalizedKey,
        mode: updateMode,
        timestamp: message.timestamp,
      });
    } catch (error) {
      console.error(`[WebSocket] Error processing message for channel '${channel}':`, error);
    }
  }, [lastMessage, channel, schema, queryKey, updateMode, onMessage, enabled, isConnected, queryClient]);

  return {
    isConnected,
  };
}
