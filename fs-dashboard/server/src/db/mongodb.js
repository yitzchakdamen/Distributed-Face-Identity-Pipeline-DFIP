/**
 * MongoDB Connection Module
 */
import { MongoClient, GridFSBucket } from "mongodb";
import { mongoConfig } from "../config/database.js";

// Store client, collections and GridFS as private variables
let client;
let eventsCollection;
let photoStorageBucket;
let connectionStatus = "disconnected";

// Connection options with pooling
const connectionOptions = mongoConfig.options;

/**
 * Creates connection to MongoDB with retry logic
 * @returns {Promise} - Promise that resolves when connection is established
 */
async function connectMongoDB(maxRetries = 3, retryDelay = 2000) {
  let retries = 0;

  // Check if MongoDB URI is configured
  if (!mongoConfig.uri) {
    console.log("⚠ MongoDB URI not configured - skipping MongoDB connection");
    connectionStatus = "not_configured";
    return null;
  }

  while (retries < maxRetries) {
    try {
      console.log(`Attempting MongoDB connection... (attempt ${retries + 1}/${maxRetries})`);

      client = await MongoClient.connect(mongoConfig.uri, connectionOptions);

      // Access database and collection
      const db = client.db(mongoConfig.dbName);
      eventsCollection = db.collection("event");

      // Initialize GridFS bucket for photo storage
      photoStorageBucket = new GridFSBucket(db, { bucketName: "photo_storage" });      console.log("✔ MongoDB connection established successfully");
      console.log(
        `✔ Connection pool configured: min=${connectionOptions.minPoolSize}, max=${connectionOptions.maxPoolSize}`
      );
      connectionStatus = "connected";
      return client;
    } catch (error) {
      retries++;
      connectionStatus = "error";
      console.error(`✘ MongoDB connection attempt ${retries} failed:`, error.message);

      if (retries < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      } else {
        console.error("✘ All MongoDB connection attempts failed");
        console.log("⚠ Server will continue without MongoDB - using fallback data");
        connectionStatus = "failed";
        return null; // Return null instead of throwing
      }
    }
  }
}

/**
 * Returns access to events collection
 * @returns {Collection} - MongoDB collection object
 */
function getEventsCollection() {
  if (!eventsCollection) {
    console.log("⚠ MongoDB not connected - events collection unavailable");
    return null;
  }
  return eventsCollection;
}

/**
 * Returns access to photo storage GridFS bucket
 * @returns {GridFSBucket} - GridFS bucket object
 */
function getPhotoStorageBucket() {
  if (!photoStorageBucket) {
    console.log("⚠ MongoDB not connected - photo storage unavailable");
    return null;
  }
  return photoStorageBucket;
}

/**
 * Get current MongoDB connection status
 */
function getMongoDBStatus() {
  return connectionStatus;
}

/**
 * Check if MongoDB is available
 */
function isMongoDBAvailable() {
  return connectionStatus === "connected";
}

/**
 * Closes MongoDB connection
 */
async function closeMongoDB() {
  if (client) {
    await client.close();
    connectionStatus = "disconnected";
    console.log("MongoDB connection closed");
  }
}

export { connectMongoDB, getEventsCollection, getPhotoStorageBucket, getMongoDBStatus, isMongoDBAvailable, closeMongoDB };
