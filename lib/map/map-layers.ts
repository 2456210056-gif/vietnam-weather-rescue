import type { MapLayerConfig } from "@/types/map";

export const BASE_MAP_LAYERS: MapLayerConfig[] = [
  {
    id: "osm-standard",
    name: "OpenStreetMap Standard",
    type: "base",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    description: "Bản đồ nền cộng đồng, không phải dữ liệu thời gian thực.",
    source: "OpenStreetMap",
    maxZoom: 19,
    realtime: false
  },
  {
    id: "carto-light",
    name: "Carto Light",
    type: "base",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    description: "Bản đồ nền sáng, phù hợp xem marker cứu hộ; không phải dữ liệu realtime.",
    source: "CARTO / OpenStreetMap",
    maxZoom: 20,
    realtime: false
  },
  {
    id: "carto-dark",
    name: "Carto Dark",
    type: "base",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    description: "Bản đồ nền tối, không phản ánh thay đổi tức thời ngoài thực địa.",
    source: "CARTO / OpenStreetMap",
    maxZoom: 20,
    realtime: false
  },
  {
    id: "esri-imagery",
    name: "Esri World Imagery",
    type: "base",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    description: "Ảnh vệ tinh/imagery có thể không phải ảnh mới nhất.",
    source: "Esri / Maxar",
    maxZoom: 19,
    realtime: false
  },
  {
    id: "opentopo",
    name: "OpenTopoMap",
    type: "base",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    description: "Bản đồ địa hình phục vụ quan sát địa thế; không phải dữ liệu realtime.",
    source: "OpenTopoMap / OpenStreetMap",
    maxZoom: 17,
    realtime: false
  },
  {
    id: "humanitarian",
    name: "Humanitarian OSM",
    type: "base",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of Humanitarian OpenStreetMap Team',
    description: "Bản đồ nền nhân đạo/cứu hộ, có thể không cập nhật tức thời.",
    source: "Humanitarian OpenStreetMap Team",
    maxZoom: 19,
    realtime: false
  }
];

export const WEATHER_OVERLAY_LAYERS: MapLayerConfig[] = [
  {
    id: "precipitation_new",
    name: "Mưa",
    type: "overlay",
    url: "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid={apiKey}&_={timestamp}",
    attribution: "OpenWeather",
    description: "Lớp mưa từ OpenWeather Maps, URL được gắn cache key khi tải.",
    source: "OpenWeather",
    opacity: 0.54,
    realtime: true,
    requiresOpenWeatherKey: true
  },
  {
    id: "clouds_new",
    name: "Mây",
    type: "overlay",
    url: "https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid={apiKey}&_={timestamp}",
    attribution: "OpenWeather",
    description: "Lớp mây từ OpenWeather Maps, dùng dữ liệu current map mặc định của provider.",
    source: "OpenWeather",
    opacity: 0.38,
    realtime: true,
    requiresOpenWeatherKey: true
  },
  {
    id: "wind_new",
    name: "Gió",
    type: "overlay",
    url: "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid={apiKey}&_={timestamp}",
    attribution: "OpenWeather",
    description: "Lớp gió từ OpenWeather Maps, dùng cache key để tránh tile cũ.",
    source: "OpenWeather",
    opacity: 0.4,
    realtime: true,
    requiresOpenWeatherKey: true
  },
  {
    id: "temp_new",
    name: "Nhiệt độ",
    type: "overlay",
    url: "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid={apiKey}&_={timestamp}",
    attribution: "OpenWeather",
    description: "Lớp nhiệt độ từ OpenWeather Maps, không hardcode API key.",
    source: "OpenWeather",
    opacity: 0.34,
    realtime: true,
    requiresOpenWeatherKey: true
  },
  {
    id: "pressure_new",
    name: "Áp suất",
    type: "overlay",
    url: "https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid={apiKey}&_={timestamp}",
    attribution: "OpenWeather",
    description: "Lớp áp suất nếu OpenWeather hỗ trợ cho API key hiện tại.",
    source: "OpenWeather",
    opacity: 0.34,
    realtime: true,
    requiresOpenWeatherKey: true
  }
];

export function getBaseMapLayer(layerId: string) {
  return BASE_MAP_LAYERS.find((layer) => layer.id === layerId) ?? BASE_MAP_LAYERS[0];
}

export function getWeatherOverlayLayer(layerId: string) {
  return WEATHER_OVERLAY_LAYERS.find((layer) => layer.id === layerId);
}
