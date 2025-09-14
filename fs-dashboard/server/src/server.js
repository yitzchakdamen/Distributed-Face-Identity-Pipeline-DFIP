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

app.use("/", rootRoutes);

// Global error handling middleware - must be last
app.use(globalErrorHandler);

export default app;
