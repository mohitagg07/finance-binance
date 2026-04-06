/**
 * server.js — Entry point
 *
 * 1. Load environment variables
 * 2. Connect to MongoDB (exits on failure)
 * 3. Start the HTTP server
 * 4. Handle graceful shutdown on SIGTERM / SIGINT
 */

require("dotenv").config();

const { connectDB } = require("./src/config/database");
const app           = require("./src/app");
const PORT          = parseInt(process.env.PORT || "3000", 10);

async function start() {
  // Connect to MongoDB before accepting any HTTP traffic
  await connectDB();

  const server = app.listen(PORT);

  // ── Handle port already in use ────────────────────────────────────────────
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌  Port ${PORT} is already in use.`);
      console.error("    Something else is already running on that port.\n");
      console.error("    Fix options:");
      console.error(`      A) Kill the process using port ${PORT}:`);
      console.error(`         Windows: Run this command in CMD as Administrator:`);
      console.error(`           netstat -ano | findstr :${PORT}`);
      console.error(`           taskkill /PID <PID_NUMBER> /F`);
      console.error(`      B) Use a different port — set PORT=3001 in your .env file\n`);
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });

  server.on("listening", () => {
    console.log("\n" + "═".repeat(54));
    console.log("  🚀  Finance Backend  (MongoDB Edition)");
    console.log("═".repeat(54));
    console.log(`  API URL    →  http://localhost:${PORT}/api`);
    console.log(`  Health     →  http://localhost:${PORT}/health`);
    console.log(`  Env        →  ${process.env.NODE_ENV || "development"}`);
    console.log("═".repeat(54) + "\n");
  });

  // ── Graceful Shutdown ─────────────────────────────────────────────────────
  async function shutdown(signal) {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(async () => {
      const mongoose = require("mongoose");
      await mongoose.disconnect();
      console.log("MongoDB disconnected. Server closed.");
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
}

start().catch((err) => {
  console.error("\n❌  Failed to start server:", err.message);
  console.error("\nCommon causes:");
  console.error("  • MONGO_URI in .env is missing or incorrect");
  console.error("  • MongoDB Atlas network access not configured");
  console.error("  • No internet connection\n");
  process.exit(1);
});
