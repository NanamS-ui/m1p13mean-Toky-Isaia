const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;