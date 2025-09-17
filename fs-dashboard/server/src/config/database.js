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
  collections: {
    events: "Event",
    photoStorage: "Photo_storage"
  }
};

export const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_KEY,
  options: {
    auth: {
      persistSession: false, // Disable session persistence for server-side usage
    },
  },
};
