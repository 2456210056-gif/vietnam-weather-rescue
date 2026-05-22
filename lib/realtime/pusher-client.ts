"use client";

import Pusher from "pusher-js";

let client: Pusher | null = null;

export function hasPusherClientConfig() {
  return Boolean(process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER);
}

export function getPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    return null;
  }

  if (!client) {
    client = new Pusher(key, {
      cluster
    });
  }

  return client;
}
