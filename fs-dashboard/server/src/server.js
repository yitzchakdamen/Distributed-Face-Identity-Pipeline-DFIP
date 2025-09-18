/**
 * Express Application Setup
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
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

// Routes
import rootRoutes from "./routes/rootRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cameraRoutes from "./routes/cameraRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import mongoRoutes from "./routes/mongoRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cameraDirectRoutes from "./routes/cameraDirectRoutes.js";

app.use("/", rootRoutes);
app.use("/", healthRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/cameras", cameraRoutes);
app.use("/events", eventRoutes);
app.use("/api/mongo", mongoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/camera", cameraDirectRoutes);

// Global error handling middleware - must be last
app.use(globalErrorHandler);

export default app;
