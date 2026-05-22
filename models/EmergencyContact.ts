import { model, models, Schema, type Document, type Model, Types } from "mongoose";

export interface IEmergencyContact extends Document {
  user: Types.ObjectId;
  name: string;
  phone: string;
  relationship?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
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
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: 80
    }
  },
  {
    timestamps: true
  }
);

EmergencyContactSchema.index({ user: 1, phone: 1 }, { unique: true });

export const EmergencyContact =
  (models.EmergencyContact as Model<IEmergencyContact> | undefined) ??
  model<IEmergencyContact>("EmergencyContact", EmergencyContactSchema);
