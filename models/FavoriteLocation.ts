import { model, models, Schema, type Document, type Model, Types } from "mongoose";

export interface IFavoriteLocation extends Document {
  user: Types.ObjectId;
  name: string;
  province?: string;
  district?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteLocationSchema = new Schema<IFavoriteLocation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    province: {
      type: String,
      trim: true,
      maxlength: 120
    },
    district: {
      type: String,
      trim: true,
      maxlength: 120
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator(value: number[]) {
            return (
              value.length === 2 &&
              value[0] >= -180 &&
              value[0] <= 180 &&
              value[1] >= -90 &&
              value[1] <= 90
            );
          },
          message: "Coordinates must be [longitude, latitude]."
        }
      }
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

FavoriteLocationSchema.index({ location: "2dsphere" });
FavoriteLocationSchema.index({ user: 1, name: 1 }, { unique: true });
FavoriteLocationSchema.index({ user: 1, isDefault: 1 });

export const FavoriteLocation =
  (models.FavoriteLocation as Model<IFavoriteLocation> | undefined) ??
  model<IFavoriteLocation>("FavoriteLocation", FavoriteLocationSchema);
