"use client";

import { useCallback, useState } from "react";

export type GeolocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracy: number;
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
      status: "idle" | "loading" | "unsupported" | "error" | "permission_denied";
      position: null;
      message: string;
    }
  | {
      status: "success";
      position: GeolocationSnapshot;
      message: string;
    };

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 10_000,
  timeout: 15_000
};

function getErrorState(error: GeolocationPositionError): GeolocationState {
  if (error.code === error.PERMISSION_DENIED) {
    return {
      status: "permission_denied",
      position: null,
      message:
        "Bạn chưa cấp quyền vị trí. Vui lòng bật quyền vị trí hoặc chọn tỉnh/thành thủ công."
    };
  }

  if (error.code === error.TIMEOUT) {
    return {
      status: "error",
      position: null,
      message: "Không lấy được vị trí trong thời gian cho phép. Hãy thử lại."
    };
  }

  return {
    status: "error",
    position: null,
    message: "Không thể xác định vị trí hiện tại."
  };
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    position: null,
    message: "Sẵn sàng lấy vị trí GPS."
  });

  const requestLocation = useCallback(async () => {
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
      message: "Đang lấy vị trí GPS..."
    });

    return new Promise<GeolocationSnapshot | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const snapshot = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          setState({
            status: "success",
            position: snapshot,
            message: `Đã lấy vị trí, sai số khoảng ${Math.round(snapshot.accuracy)}m.`
          });
          resolve(snapshot);
        },
        (error) => {
          const nextState = getErrorState(error);
          setState(nextState);
          resolve(null);
        },
        GEOLOCATION_OPTIONS
      );
    });
  }, []);

  return {
    ...state,
    requestLocation,
    isLoading: state.status === "loading",
    isPermissionDenied: state.status === "permission_denied"
  };
}
