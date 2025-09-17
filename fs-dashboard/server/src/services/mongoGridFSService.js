// MongoDB GridFS service for handling image storage and retrieval

import { MongoClient, GridFSBucket } from "mongodb";
import { mongoConfig } from "../config/database.js";

class MongoGridFSService {
  constructor() {
    this.client = null;
    this.db = null;
    this.bucket = null;
    this.isConnected = false;
  }

  // Connect to MongoDB and initialize GridFS bucket
  async connect() {
    try {
      if (this.isConnected) {
        return this.db;
      }

      // Check if MongoDB URI is configured
      if (!mongoConfig.uri) {
        throw new Error("MongoDB URI not configured. Please set MONGODB_URI environment variable.");
      }

      this.client = new MongoClient(mongoConfig.uri, mongoConfig.options);
      await this.client.connect();
      
      this.db = this.client.db(mongoConfig.dbName);
      this.bucket = new GridFSBucket(this.db, { 
        bucketName: mongoConfig.collections.photoStorage 
      });
      
      this.isConnected = true;
      console.log("Connected to MongoDB GridFS successfully");
      
      return this.db;
    } catch (error) {
      console.error("Failed to connect to MongoDB GridFS:", error);
      throw error;
    }
  }

  // Get image from GridFS by image_id
  async getImageById(imageId) {
    try {
      await this.connect();
      
      // Find file document by metadata.image_id
      const fileDoc = await this.db.collection(`${mongoConfig.collections.photoStorage}.files`)
        .findOne({ "metadata.image_id": imageId });
      
      if (!fileDoc) {
        return null;
      }

      // Get the file data from GridFS
      const downloadStream = this.bucket.openDownloadStream(fileDoc._id);
      
      return {
        stream: downloadStream,
        contentType: fileDoc.contentType || "image/jpeg",
        filename: fileDoc.filename,
        length: fileDoc.length
      };
    } catch (error) {
      console.error("Error getting image from GridFS:", error);
      throw error;
    }
  }

  // Get image as base64 string
  async getImageAsBase64(imageId) {
    try {
      const imageData = await this.getImageById(imageId);
      
      if (!imageData) {
        return null;
      }

      return new Promise((resolve, reject) => {
        const chunks = [];
        
        imageData.stream.on("data", (chunk) => {
          chunks.push(chunk);
        });
        
        imageData.stream.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const base64String = buffer.toString("base64");
          resolve(`data:${imageData.contentType};base64,${base64String}`);
        });
        
        imageData.stream.on("error", (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  }

  // Get all events from MongoDB
  async getEvents(filters = {}) {
    try {
      await this.connect();
      
      const query = {};
      
      // Apply level filter
      if (filters.level) {
        query.level = filters.level;
      }
      
      // Apply date range filter
      if (filters.startDate || filters.endDate) {
        query.time = {};
        if (filters.startDate) {
          query.time.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.time.$lte = new Date(filters.endDate);
        }
      }
      
      // Apply camera filter
      if (filters.camera_id) {
        query.camera_id = filters.camera_id;
      }

      const events = await this.db.collection(mongoConfig.collections.events)
        .find(query)
        .sort({ time: -1 }) // Sort by newest first
        .limit(filters.limit || 50)
        .skip(filters.skip || 0)
        .toArray();

      return events;
    } catch (error) {
      console.error("Error getting events from MongoDB:", error);
      throw error;
    }
  }

  // Get persons with their images
  async getPersonsWithImages() {
    try {
      await this.connect();
      
      const events = await this.db.collection(mongoConfig.collections.events)
        .find({}, { person_id: 1, image_id: 1 })
        .toArray();

      const persons = {};

      for (const event of events) {
        const personId = event.person_id;
        const imageId = event.image_id;

        if (!persons[personId]) {
          persons[personId] = {
            person_id: personId,
            images: []
          };
        }

        if (imageId) {
          try {
            const base64Image = await this.getImageAsBase64(imageId);
            if (base64Image) {
              persons[personId].images.push(base64Image);
            }
          } catch (error) {
            console.warn(`Failed to get image ${imageId} for person ${personId}:`, error.message);
          }
        }
      }

      return Object.values(persons);
    } catch (error) {
      console.error("Error getting persons with images:", error);
      throw error;
    }
  }

  // Get statistics
  async getStats() {
    try {
      await this.connect();
      
      const totalEvents = await this.db.collection(mongoConfig.collections.events).countDocuments();
      
      const uniquePersons = await this.db.collection(mongoConfig.collections.events)
        .distinct("person_id");
      
      const totalImages = await this.db.collection(`${mongoConfig.collections.photoStorage}.files`)
        .countDocuments();

      return {
        total_events: totalEvents,
        total_persons: uniquePersons.length,
        total_images: totalImages,
        avg_images_per_person: uniquePersons.length > 0 ? (totalImages / uniquePersons.length) : 0
      };
    } catch (error) {
      console.error("Error getting statistics:", error);
      throw error;
    }
  }

  // Close connection
  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.isConnected = false;
        console.log("Disconnected from MongoDB GridFS");
      }
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
    }
  }
}

// Create singleton instance
export const mongoGridFSService = new MongoGridFSService();
export default mongoGridFSService;
