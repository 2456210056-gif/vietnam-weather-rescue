"use client";

import { useState } from "react";

export type RescueNavigationStatus =
  | "idle"
  | "locating"
  | "success"
  | "permission_denied"
  | "unsupported"
  | "error";

export type RescueNavigationPosition = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export function useRescueNavigation() {
  const [status, setStatus] = useState<RescueNavigationStatus>("idle");
  const [position, setPosition] = useState<RescueNavigationPosition | null>(null);
  const [message, setMessage] = useState("");

  async function requestPosition() {
    setMessage("");

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      setMessage("Trình duyệt không hỗ trợ định vị. Bạn vẫn có thể mở Google Maps.");
      return null;
    }

    setStatus("locating");

    return new Promise<RescueNavigationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (currentPosition) => {
          const nextPosition = {
            lat: currentPosition.coords.latitude,
            lng: currentPosition.coords.longitude,
            accuracy: currentPosition.coords.accuracy
          };
          setPosition(nextPosition);
          setStatus("success");
          resolve(nextPosition);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setStatus("permission_denied");
            setMessage(
              "Bạn cần cấp quyền vị trí để chỉ đường trong bản đồ. Bạn vẫn có thể mở Google Maps."
            );
          } else {
            setStatus("error");
            setMessage("Không thể lấy vị trí hiện tại. Bạn vẫn có thể mở Google Maps.");
          }
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 12_000,
          maximumAge: 20_000
        }
      );
    });
  }

  function reset() {
    setStatus("idle");
    setPosition(null);
    setMessage("");
  }

  return {
    status,
    position,
    message,
    isLocating: status === "locating",
    requestPosition,
    reset
  };
}
