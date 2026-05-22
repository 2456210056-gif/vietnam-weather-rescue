import type { SOSSignalDTO } from "@/types/sos";
import type { UserRole } from "@/types/roles";

export type FavoriteLocationDTO = {
  id: string;
  name: string;
  province?: string | null;
  district?: string | null;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: string;
};

export type ProfileUserDTO = {
  id: string;
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  image?: string | null;
  role: UserRole;
};

export type ProfileSummaryDTO = {
  user: ProfileUserDTO;
  favorites: FavoriteLocationDTO[];
  sosHistory: SOSSignalDTO[];
  stats: {
    favoriteCount: number;
    sosCount: number;
    activeSOSCount: number;
  };
};
