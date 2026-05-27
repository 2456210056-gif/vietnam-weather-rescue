import { model, models, Schema, type Document, type Model, Types } from "mongoose";

export const WEATHER_REPORT_TYPES = [
  "FLOOD",
  "LANDSLIDE",
  "STORM",
  "RESCUE_SHORTAGE",
  "OTHER"
] as const;

export type WeatherReportType = (typeof WEATHER_REPORT_TYPES)[number];

export const WEATHER_REPORT_STATUSES = [
  "NEW",
  "REVIEWING",
  "VERIFIED",
  "ASSIGNED",
  "RESOLVED",
  "REJECTED"
] as const;

export type WeatherReportStatus = (typeof WEATHER_REPORT_STATUSES)[number];

export const WEATHER_REPORT_SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type WeatherReportSeverity = (typeof WEATHER_REPORT_SEVERITIES)[number];

export interface IWeatherReport extends Document {
  user?: Types.ObjectId;
  fullName?: string;
  email?: string;
  phone?: string;
  area: string;
  type: WeatherReportType;
  description: string;
  contact?: string;
  severity?: WeatherReportSeverity;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  status: WeatherReportStatus;
  handledBy?: Types.ObjectId;
  handledAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeatherReportSchema = new Schema<IWeatherReport>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    area: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 160,
      index: true
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      trim: true,
      maxlength: 160
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30
    },
    type: {
      type: String,
      enum: WEATHER_REPORT_TYPES,
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1200
    },
    contact: {
      type: String,
      trim: true,
      maxlength: 160
    },
    severity: {
      type: String,
      enum: WEATHER_REPORT_SEVERITIES,
      default: "medium",
      index: true
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        validate: {
          validator(value?: number[]) {
            return (
              !value ||
              value.length === 0 ||
              (value.length === 2 &&
                value[0] >= -180 &&
                value[0] <= 180 &&
                value[1] >= -90 &&
                value[1] <= 90)
            );
          },
          message: "Coordinates must be [longitude, latitude]."
        }
      }
    },
    status: {
      type: String,
      enum: WEATHER_REPORT_STATUSES,
      default: "NEW",
      index: true
    },
    handledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    handledAt: {
      type: Date,
      index: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

WeatherReportSchema.index({ location: "2dsphere" });
WeatherReportSchema.index({ status: 1, createdAt: -1 });

export const WeatherReport =
  (models.WeatherReport as Model<IWeatherReport> | undefined) ??
  model<IWeatherReport>("WeatherReport", WeatherReportSchema);
