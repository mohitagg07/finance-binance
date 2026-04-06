/**
 * src/config/database.js
 * ───────────────────────
 * Connects to MongoDB using Mongoose.
 * Called once from server.js before the HTTP server starts.
 *
 * Mongoose maintains a connection pool automatically.
 * All models share this single connection.
 */

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      "MONGO_URI is not set in your .env file.\n" +
      "See .env.example for setup instructions."
    );
  }

  await mongoose.connect(uri, {
    // These are the recommended options for Mongoose 8+
    serverSelectionTimeoutMS: 10000, // fail fast if Atlas/local unreachable
  });

  console.log(`  🍃  MongoDB connected → ${mongoose.connection.host}`);
}

module.exports = { connectDB };
