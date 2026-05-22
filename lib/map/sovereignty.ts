export type SeaArea = {
  id: "hoang-sa" | "truong-sa";
  name: string;
  latitude: number;
  longitude: number;
  description: string;
};

export const VIETNAM_CENTER = {
  latitude: 14.6,
  longitude: 108.3,
  zoom: 5
};

export const SOVEREIGNTY_AREAS: SeaArea[] = [
  {
    id: "hoang-sa",
    name: "Quần đảo Hoàng Sa (Việt Nam)",
    latitude: 16.5,
    longitude: 112,
    description: "Khu vực biển Hoàng Sa thuộc chủ quyền Việt Nam."
  },
  {
    id: "truong-sa",
    name: "Quần đảo Trường Sa (Việt Nam)",
    latitude: 10,
    longitude: 114,
    description: "Khu vực biển Trường Sa thuộc chủ quyền Việt Nam."
  }
];
