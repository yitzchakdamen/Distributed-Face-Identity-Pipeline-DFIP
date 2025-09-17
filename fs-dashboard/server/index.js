/**
 * 1. Connecting to dbs
 * 2. Starts the server
 */
import { connectMongoDB, closeMongoDB } from "./src/db/mongodb.js";
import { testSupabaseConnection } from "./src/db/supabase.js";
import { serverConfig } from "./src/config/server.js";
import app from "./src/server.js";

const HOST = serverConfig.host;
const PORT = serverConfig.port;

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  console.log(`✔ ${signal} received, shutting down gracefully...`);
  await closeMongoDB();
  process.exit(0);
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server after init dbs
async function startServer() {
  try {
    console.log("Starting Face Alert Server...");

    // Try to connect to MongoDB, but don't fail if it's not available
    console.log("Attempting to connect to MongoDB...");
    try {
      await connectMongoDB();
      console.log("✔ MongoDB connected successfully");
    } catch (error) {
      console.log("⚠ MongoDB connection failed, continuing with mock data fallback");
      console.log("MongoDB error:", error.message);
    }

    // Test Supabase connection
    console.log("Testing Supabase connection...");
    try {
      await testSupabaseConnection();
      console.log("✔ Supabase connected successfully");
    } catch (error) {
      console.log("⚠ Supabase connection failed");
      console.log("Supabase error:", error.message);
    }

    app.listen(PORT, HOST, () => {
      console.log(`✔ FaceAlert server running on http://${HOST}:${PORT}`);
      console.log(`✔ Environment: ${serverConfig.environment}`);
      console.log("✔ Server started - databases will connect on demand");
    });
  } catch (error) {
    console.error("✘ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
