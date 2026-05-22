import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = globalThis.mongooseCache ?? {
  conn: null,
  promise: null
};

globalThis.mongooseCache = cached;

function getMongoUri() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.error("Missing MONGODB_URI");
    throw new Error("Missing MONGODB_URI");
  }

  return uri;
}

export async function connectMongo(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(getMongoUri(), {
        bufferCommands: false,
        dbName: process.env.MONGODB_DB?.trim() || undefined,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000
      })
      .catch((error) => {
        cached.promise = null;
        console.error("MongoDB connection failed", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export const dbConnect = connectMongo;
