/**
 * 1. Connecting to dbs
 * 2. Starts the server
 */
import { connectMongoDB, closeMongoDB } from "./src/db/mongodb.js";
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

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectMongoDB();

    app.listen(PORT, HOST, () => {
      console.log(`✔ FaceAlert server running on http://${HOST}:${PORT}`);
      console.log(`✔ Environment: ${serverConfig.environment}`);
      console.log("✔ All systems ready!");
    });
  } catch (error) {
    console.error("✘ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
