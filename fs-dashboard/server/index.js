/**
 * 1. Connecting to dbs
 * 2. Starts the server
 */
import app from "./src/server.js";
import { serverConfig } from "./src/config/server.js";

const HOST = serverConfig.host;
const PORT = serverConfig.port;

// Start server after init dbs
async function startServer() {
  try {
    // In the future, init dbs here...

    app.listen(PORT, () => {
      console.log(`✔ FaceAlert server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("✘ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
