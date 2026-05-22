import type { Types } from "mongoose";
import type { FavoriteLocationDTO } from "@/types/profile";

type ObjectIdLike = Types.ObjectId | string;

type FavoriteLike = {
  _id: ObjectIdLike;
  name: string;
  province?: string | null;
  district?: string | null;
  location: {
    coordinates: [number, number];
  };
  isDefault: boolean;
  createdAt: Date | string;
};

function toISODate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function serializeFavoriteLocation(favorite: FavoriteLike): FavoriteLocationDTO {
  const [longitude, latitude] = favorite.location.coordinates;

  return {
    id: String(favorite._id),
    name: favorite.name,
    province: favorite.province ?? null,
    district: favorite.district ?? null,
    latitude,
    longitude,
    isDefault: favorite.isDefault,
    createdAt: toISODate(favorite.createdAt)
  };
}
