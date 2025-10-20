import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/notemind";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with cached connection
 */
export const dbConnect = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

/**
 * Disconnect from MongoDB
 */
export const dbDisconnect = async () => {
  await mongoose.disconnect();
  cached.conn = null;
  cached.promise = null;
};

export default dbConnect;