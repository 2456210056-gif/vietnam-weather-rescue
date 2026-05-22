import "server-only";

import Pusher from "pusher";
import { SOS_CHANNEL, SOS_EVENTS } from "@/lib/realtime/events";
import type { SOSRealtimePayload } from "@/types/sos";

type PusherServerConfig = {
  appId: string;
  key: string;
  secret: string;
  cluster: string;
};

function getPusherConfig(): PusherServerConfig | null {
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;

  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    return null;
  }

  return {
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER
  };
}

const config = getPusherConfig();

export const pusherServer = config
  ? new Pusher({
      ...config,
      useTLS: true
    })
  : null;

export async function publishSOSCreated(payload: SOSRealtimePayload) {
  if (!pusherServer) {
    return false;
  }

  // MongoDB remains the source of truth. Pusher is only a low-latency fan-out
  // channel, so a missed socket event can always be recovered by refetching /api/sos.
  try {
    await pusherServer.trigger(SOS_CHANNEL, SOS_EVENTS.created, payload);
    return true;
  } catch {
    return false;
  }
}

export async function publishSOSUpdated(payload: SOSRealtimePayload) {
  if (!pusherServer) {
    return false;
  }

  try {
    await pusherServer.trigger(SOS_CHANNEL, SOS_EVENTS.updated, payload);
    return true;
  } catch {
    return false;
  }
}
