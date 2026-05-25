import { model, models, Schema, type Document, type Model, Types } from "mongoose";
import {
  SOS_NEEDS,
  SOS_STATUSES,
  type SOSNeed,
  type SOSStatus,
  type SOSTimelineEvent
} from "@/types/sos";

export interface ISOSSignal extends Document {
  user: Types.ObjectId;
  fullName?: string;
  phone?: string;
  emergencyType?: SOSNeed;
  description?: string;
  needs: SOSNeed[];
  note?: string;
  status: SOSStatus;
  assignedRescuer?: Types.ObjectId;
  acceptedAt?: Date;
  resolvedAt?: Date;
  timeline?: Array<
    Omit<SOSTimelineEvent, "timestamp"> & {
      timestamp: Date;
    }
  >;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  addressText?: string;
  accuracy?: number;
  lastStatusAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SOSSignalSchema = new Schema<ISOSSignal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: 120
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30
    },
    emergencyType: {
      type: String,
      enum: SOS_NEEDS,
      default: "OTHER",
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    needs: {
      type: [String],
      enum: SOS_NEEDS,
      default: ["OTHER"],
      required: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: SOS_STATUSES,
      default: "PENDING",
      index: true
    },
    assignedRescuer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    acceptedAt: {
      type: Date,
      index: true
    },
    resolvedAt: {
      type: Date,
      index: true
    },
    timeline: {
      type: [
        {
          type: {
            type: String,
            enum: [
              "created",
              "accepted",
              "in_progress",
              "reached",
              "resolved",
              "cancelled",
              "restored_to_pending"
            ],
            required: true
          },
          timestamp: {
            type: Date,
            default: Date.now,
            required: true
          },
          actorId: {
            type: String,
            trim: true
          },
          actorName: {
            type: String,
            trim: true,
            maxlength: 120
          },
          fromStatus: {
            type: String,
            enum: SOS_STATUSES
          },
          toStatus: {
            type: String,
            enum: SOS_STATUSES
          },
          note: {
            type: String,
            trim: true,
            maxlength: 300
          }
        }
      ],
      default: []
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
    addressText: {
      type: String,
      trim: true,
      maxlength: 300
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 50000
    },
    lastStatusAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

SOSSignalSchema.index({ location: "2dsphere" });
SOSSignalSchema.index({ status: 1, createdAt: -1 });
SOSSignalSchema.index({ user: 1, createdAt: -1 });
SOSSignalSchema.index({ status: 1, lastStatusAt: -1, assignedRescuer: 1 });

export const SOSSignal =
  (models.SOSSignal as Model<ISOSSignal> | undefined) ??
  model<ISOSSignal>("SOSSignal", SOSSignalSchema);
