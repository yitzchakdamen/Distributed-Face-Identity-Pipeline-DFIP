/**
 * Database Configuration
 * Configuration settings for MongoDB
 */

import { config } from "dotenv";

config();

export const mongoConfig = {
  uri: process.env.MONGODB_URI,
  dbName: process.env.MONGODB_DB_NAME || "face_identity",
  options: {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
  },
};
