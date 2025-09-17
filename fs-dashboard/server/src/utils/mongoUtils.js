// Utility functions for MongoDB operations

import { isMongoDBAvailable } from "../db/mongodb.js";

/**
 * Check if MongoDB should be used based on configuration and availability
 * @returns {boolean} True if MongoDB is available and configured
 */
export function shouldUseMongoDB() {
  // Check if MongoDB URI is configured
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    return false;
  }
  
  // Check if MongoDB is currently available
  return isMongoDBAvailable();
}

export default {
  shouldUseMongoDB
};
