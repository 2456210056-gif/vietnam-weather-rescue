export type WeatherTileLayerResult = {
  url: string;
  attribution: string;
  frameTime?: number;
  cacheBust: number;
};

type RainViewerFrame = {
  time: number;
  path: string;
};

type RainViewerResponse = {
  host: string;
  radar?: {
    past?: RainViewerFrame[];
    nowcast?: RainViewerFrame[];
  };
};

export async function getLatestRainRadarTile(): Promise<WeatherTileLayerResult | null> {
  const cacheBust = Date.now();
  const response = await fetch(
    `https://api.rainviewer.com/public/weather-maps.json?_=${cacheBust}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as RainViewerResponse;
  const frames = [...(payload.radar?.nowcast ?? []), ...(payload.radar?.past ?? [])].sort(
    (a, b) => a.time - b.time
  );
  const latestFrame = frames.at(-1);

  if (!payload.host || !latestFrame) {
    return null;
  }

  return {
    url: `${payload.host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png?_=${cacheBust}`,
    attribution: "Radar mưa © RainViewer",
    frameTime: latestFrame.time,
    cacheBust
  };
}

export function getStormWindTile(): WeatherTileLayerResult | null {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  if (!apiKey) {
    return null;
  }

  const cacheBust = Date.now();

  return {
    url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}&_=${cacheBust}`,
    attribution: "Gió/bão © OpenWeather",
    cacheBust
  };
}

export function formatRadarFrameTime(frameTime?: number) {
  if (!frameTime) {
    return "Đang dùng dữ liệu mới nhất có sẵn.";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(frameTime * 1000));
}
