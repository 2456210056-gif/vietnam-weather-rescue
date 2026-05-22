"use client";

import { useEffect, useState } from "react";
import { SOS_CHANNEL, SOS_EVENTS } from "@/lib/realtime/events";
import { getPusherClient, hasPusherClientConfig } from "@/lib/realtime/pusher-client";
import { useSOSStore } from "@/stores/sosStore";
import type { SOSRealtimePayload } from "@/types/sos";

type RealtimeState = "disabled" | "unavailable" | "connecting" | "connected";

export function useSOSRealtime(enabled: boolean) {
  const upsertSignal = useSOSStore((state) => state.upsertSignal);
  const [isConnected, setIsConnected] = useState(false);
  const hasConfig = hasPusherClientConfig();

  useEffect(() => {
    if (!enabled || !hasConfig) {
      return undefined;
    }

    const pusher = getPusherClient();

    if (!pusher) {
      return undefined;
    }

    const channel = pusher.subscribe(SOS_CHANNEL);

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    const handleEvent = (payload: SOSRealtimePayload) => {
      upsertSignal(payload.signal);
    };

    pusher.connection.bind("connected", handleConnected);
    pusher.connection.bind("disconnected", handleDisconnected);
    pusher.connection.bind("unavailable", handleDisconnected);
    channel.bind(SOS_EVENTS.created, handleEvent);
    channel.bind(SOS_EVENTS.updated, handleEvent);

    return () => {
      channel.unbind(SOS_EVENTS.created, handleEvent);
      channel.unbind(SOS_EVENTS.updated, handleEvent);
      pusher.connection.unbind("connected", handleConnected);
      pusher.connection.unbind("disconnected", handleDisconnected);
      pusher.connection.unbind("unavailable", handleDisconnected);
      pusher.unsubscribe(SOS_CHANNEL);
    };
  }, [enabled, hasConfig, upsertSignal]);

  const state: RealtimeState = !enabled
    ? "disabled"
    : !hasConfig
      ? "unavailable"
      : isConnected
        ? "connected"
        : "connecting";

  return {
    state,
    isConnected: state === "connected",
    isUnavailable: state === "unavailable"
  };
}
