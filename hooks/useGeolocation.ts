"use client";

import { useCallback, useState } from "react";
import { saveLastKnownLocation } from "@/lib/location-storage";

export type GeolocationSnapshot = {
  accuracy: number;
  latitude: number;
  longitude: number;
};

export type GeolocationStatus =
  | "idle"
  | "loading"
  | "success"
  | "permission_denied"
  | "unsupported"
  | "error";

type GeolocationState =
  | {
      message: string;
      position: null;
      status: "idle" | "loading" | "unsupported" | "error" | "permission_denied";
    }
  | {
      message: string;
      position: GeolocationSnapshot;
      status: "success";
    };

const ONLINE_GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 30_000,
  timeout: 12_000
};

const OFFLINE_GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 10 * 60 * 1000,
  timeout: 20_000
};

const FALLBACK_GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 30 * 60 * 1000,
  timeout: 8_000
};

function getErrorState(error: GeolocationPositionError): GeolocationState {
  if (error.code === error.PERMISSION_DENIED) {
    return {
      status: "permission_denied",
      position: null,
      message: "Bạn chưa cấp quyền vị trí. Hãy bật quyền định vị hoặc nhập vị trí thủ công."
    };
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return {
      status: "error",
      position: null,
      message: "Thiết bị chưa xác định được vị trí. Có thể do GPS yếu hoặc không có mạng hỗ trợ."
    };
  }

  if (error.code === error.TIMEOUT) {
    return {
      status: "error",
      position: null,
      message: "Không lấy được vị trí trong thời gian cho phép. Hãy thử lại hoặc dùng vị trí gần nhất."
    };
  }

  return {
    status: "error",
    position: null,
    message: "Không thể lấy vị trí lúc này."
  };
}

function getCurrentPosition(options: PositionOptions) {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    position: null,
    message: "Sẵn sàng lấy vị trí GPS."
  });

  const requestLocation = useCallback(async (options?: { isOnline?: boolean }) => {
    if (!("geolocation" in navigator)) {
      const unsupportedState: GeolocationState = {
        status: "unsupported",
        position: null,
        message: "Thiết bị hoặc trình duyệt không hỗ trợ Geolocation API."
      };
      setState(unsupportedState);
      return null;
    }

    setState({
      status: "loading",
      position: null,
      message: "Đang xác định vị trí..."
    });

    try {
      const position = await getCurrentPosition(
        options?.isOnline === false ? OFFLINE_GEOLOCATION_OPTIONS : ONLINE_GEOLOCATION_OPTIONS
      );
      const snapshot = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      saveLastKnownLocation({
        accuracy: snapshot.accuracy,
        lat: snapshot.latitude,
        lng: snapshot.longitude,
        source: "gps"
      });

      setState({
        status: "success",
        position: snapshot,
        message: `Đã lấy vị trí, sai số khoảng ${Math.round(snapshot.accuracy)}m.`
      });
      return snapshot;
    } catch (firstError) {
      try {
        const position = await getCurrentPosition(FALLBACK_GEOLOCATION_OPTIONS);
        const snapshot = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        saveLastKnownLocation({
          accuracy: snapshot.accuracy,
          lat: snapshot.latitude,
          lng: snapshot.longitude,
          source: "browser"
        });

        setState({
          status: "success",
          position: snapshot,
          message: `Đã lấy vị trí gần đúng, sai số khoảng ${Math.round(snapshot.accuracy)}m.`
        });
        return snapshot;
      } catch {
        const nextState =
          firstError && typeof firstError === "object" && "code" in firstError
            ? getErrorState(firstError as GeolocationPositionError)
            : {
                status: "error" as const,
                position: null,
                message: "Không thể lấy vị trí lúc này."
              };
        setState(nextState);
        return null;
      }
    }
  }, []);

  return {
    ...state,
    requestLocation,
    isLoading: state.status === "loading",
    isPermissionDenied: state.status === "permission_denied"
  };
}
