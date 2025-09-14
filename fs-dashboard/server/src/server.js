/**
 * Express Application Setup
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { corsConfig } from "./config/cors.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Security
app.use(helmet());
app.disable("x-powered-by");

// CORS
app.use(cors(corsConfig));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files with proper MIME types for client build
app.use(express.static("public", {
//   setHeaders: (res, path) => {
//     if (path.endsWith('.svg')) {
//       res.setHeader('Content-Type', 'image/svg+xml');
//     }
//     if (path.endsWith('.js')) {
//       res.setHeader('Content-Type', 'application/javascript');
//     }
//     if (path.endsWith('.css')) {
//       res.setHeader('Content-Type', 'text/css');
//     }
//   }
}));

// Routes
import rootRoutes from "./routes/rootRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

app.use("/api", rootRoutes);
app.use("/api", healthRoutes);

// SPA catch-all route - must be after API routes and static files
app.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// Global error handling middleware - must be last
app.use(globalErrorHandler);

export default app;
