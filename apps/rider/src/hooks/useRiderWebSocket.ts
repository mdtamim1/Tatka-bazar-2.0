"use client";
import { useEffect, useRef, useCallback, useState } from "react";

export type WsMessageType =
  | "TASK_NEW"
  | "TASK_UPDATED"
  | "TASK_CANCELLED"
  | "NOTIFICATION"
  | "DUTY_CHANGED"
  | "RIDER_SUSPENDED"
  | "RIDER_ACTIVATED"
  | "PING"
  | "PONG"
  | "CONNECTED";

export interface WsMessage {
  type: WsMessageType;
  riderId?: string;
  payload?: unknown;
  timestamp?: string;
}

type MessageHandler = (msg: WsMessage) => void;

const WS_BASE = (() => {
  if (typeof window === "undefined") return "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return apiUrl.replace(/^https?:/, (m) => (m === "https:" ? "wss:" : "ws:"));
})();

const INITIAL_RECONNECT_DELAY = 1000;  // 1s
const MAX_RECONNECT_DELAY = 30000;     // 30s max
const MAX_RECONNECT_ATTEMPTS = 10;
const PING_INTERVAL_MS = 25000;        // Ping every 25s to keep alive

export interface UseRiderWebSocketOptions {
  riderId: string;
  token: string | null;
  onMessage?: MessageHandler;
  enabled?: boolean;
}

export interface UseRiderWebSocketReturn {
  isConnected: boolean;
  reconnectCount: number;
  sendMessage: (msg: WsMessage) => void;
  disconnect: () => void;
}

export function useRiderWebSocket({
  riderId,
  token,
  onMessage,
  enabled = true,
}: UseRiderWebSocketOptions): UseRiderWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const onMessageRef = useRef(onMessage);

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);

  // Keep callback ref up to date
  onMessageRef.current = onMessage;

  const clearPingTimer = useCallback(() => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((msg: WsMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(msg));
      } catch (err) {
        console.warn("[WS] Send failed:", err);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    isMountedRef.current = false;
    clearPingTimer();
    clearReconnectTimer();
    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent reconnect trigger
      wsRef.current.close(1000, "Client disconnecting");
      wsRef.current = null;
    }
    setIsConnected(false);
  }, [clearPingTimer, clearReconnectTimer]);

  const connect = useCallback(() => {
    if (!isMountedRef.current || !riderId || !token || !WS_BASE) return;

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    const url = `${WS_BASE}/ws/rider?riderId=${encodeURIComponent(riderId)}&token=${encodeURIComponent(token)}`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch (err) {
      console.warn("[WS] Failed to create WebSocket:", err);
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) { ws.close(); return; }
      console.log("[WS] Connected");
      setIsConnected(true);
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
      reconnectCountRef.current = 0;
      setReconnectCount(0);

      // Start ping interval
      clearPingTimer();
      pingTimerRef.current = setInterval(() => {
        sendMessage({ type: "PING", timestamp: new Date().toISOString() });
      }, PING_INTERVAL_MS);
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      try {
        const msg: WsMessage = JSON.parse(event.data);
        if (msg.type === "PONG") return; // Ignore pong
        onMessageRef.current?.(msg);
      } catch {
        console.warn("[WS] Failed to parse message:", event.data);
      }
    };

    ws.onerror = (err) => {
      console.warn("[WS] Error:", err);
    };

    ws.onclose = (event) => {
      if (!isMountedRef.current) return;
      clearPingTimer();
      setIsConnected(false);
      wsRef.current = null;

      // Don't reconnect on deliberate close (code 1000)
      if (event.code === 1000) return;

      // Exponential backoff reconnect
      if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          reconnectDelayRef.current * Math.pow(1.5, reconnectCountRef.current),
          MAX_RECONNECT_DELAY
        );
        reconnectCountRef.current++;
        setReconnectCount(reconnectCountRef.current);
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
        reconnectTimerRef.current = setTimeout(connect, delay);
      } else {
        console.warn("[WS] Max reconnect attempts reached. Falling back to polling.");
        window.dispatchEvent(new CustomEvent("ws_connection_failed"));
      }
    };
  }, [riderId, token, clearPingTimer, sendMessage]);

  useEffect(() => {
    isMountedRef.current = true;
    if (enabled && riderId && token) {
      connect();
    }

    // Reconnect on browser coming back online
    const handleOnline = () => {
      if (enabled && isMountedRef.current && !wsRef.current) {
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
        reconnectCountRef.current = 0;
        connect();
      }
    };

    window.addEventListener("online", handleOnline);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("online", handleOnline);
      clearPingTimer();
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close(1000, "Component unmounted");
        wsRef.current = null;
      }
    };
  }, [enabled, riderId, token, connect, clearPingTimer, clearReconnectTimer]);

  return { isConnected, reconnectCount, sendMessage, disconnect };
}
