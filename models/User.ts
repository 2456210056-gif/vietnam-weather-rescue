import { model, models, Schema, type Document, type Model, Types } from "mongoose";
import { USER_ROLES, type UserRole } from "@/types/roles";

export interface IUser extends Document {
  fullName: string;
  name?: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  password?: string;
  avatar?: string;
  image?: string;
  role: UserRole;
  isActive: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  favoriteLocations: Types.ObjectId[];
  emergencyContacts: Types.ObjectId[];
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    name: {
      type: String,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30
    },
    passwordHash: {
      type: String,
      select: false
    },
    // Backward-compatible hash field for documents created by the earlier schema.
    password: {
      type: String,
      select: false
    },
    avatar: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    favoriteLocations: [
      {
        type: Schema.Types.ObjectId,
        ref: "FavoriteLocation"
      }
    ],
    emergencyContacts: [
      {
        type: Schema.Types.ObjectId,
        ref: "EmergencyContact"
      }
    ],
    emailVerified: Date
  },
  {
    timestamps: true
  }
);

UserSchema.index({ role: 1, createdAt: -1 });

export const User =
  (models.User as Model<IUser> | undefined) ?? model<IUser>("User", UserSchema);
