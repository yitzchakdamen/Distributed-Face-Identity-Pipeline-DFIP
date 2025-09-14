/**
 * 1. Connecting to dbs
 * 2. Starts the server
 */
import app from "./src/server.js";
import { serverConfig } from "./src/config/server.js";

const HOST = serverConfig.host;
const PORT = serverConfig.port;

// Graceful shutdown handler
function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Graceful shutdown starting...`);
  // Add cleanup code here if needed
  process.exit(0);
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server after init dbs
async function startServer() {
  try {
    // In the future, init dbs here...

    app.listen(PORT, HOST, () => {
      console.log(`✔ FaceAlert server running on http://${HOST}:${PORT}`);
      console.log(`Environment: ${serverConfig.environment}`);
    });
  } catch (error) {
    console.error("✘ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
