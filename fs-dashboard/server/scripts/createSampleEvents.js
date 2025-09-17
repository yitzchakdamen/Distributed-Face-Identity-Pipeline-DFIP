// MongoDB Events Sample Data Script
// This script creates sample events data for testing the Events API

import { MongoClient, ObjectId, GridFSBucket } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB_NAME || "face_recognition_db";

async function createSampleEvents() {
  let client;
  
  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const eventsCollection = db.collection("event");
    
    // Sample camera IDs (these should match your existing cameras)
    const sampleCameraIds = [
      "camera_entrance_01",
      "camera_lobby_02", 
      "camera_office_03",
      "camera_parking_04"
    ];
    
    // Sample person IDs
    const samplePersonIds = [
      "person_001",
      "person_002",
      "person_003",
      "person_004",
      "person_005"
    ];
    
    // Sample image IDs (these would be real GridFS file IDs in production)
    const sampleImageIds = [
      new ObjectId(),
      new ObjectId(),
      new ObjectId(),
      new ObjectId(),
      new ObjectId(),
      new ObjectId(),
      new ObjectId(),
      new ObjectId()
    ];
    
    // Generate sample events over the last 30 days
    const sampleEvents = [];
    const now = new Date();
    
    for (let i = 0; i < 50; i++) {
      // Random timestamp within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      
      const eventTime = new Date(now);
      eventTime.setDate(eventTime.getDate() - daysAgo);
      eventTime.setHours(eventTime.getHours() - hoursAgo);
      eventTime.setMinutes(eventTime.getMinutes() - minutesAgo);
      
      // Random level distribution (more low, fewer high)
      const levelRandom = Math.random();
      let level;
      if (levelRandom < 0.6) level = "low";
      else if (levelRandom < 0.9) level = "medium";
      else level = "high";
      
      const event = {
        _id: new ObjectId(),
        person_id: samplePersonIds[Math.floor(Math.random() * samplePersonIds.length)],
        camera_id: sampleCameraIds[Math.floor(Math.random() * sampleCameraIds.length)],
        level: level,
        timestamp: eventTime,
        image_id: sampleImageIds[Math.floor(Math.random() * sampleImageIds.length)],
        metadata: {
          confidence: Math.round((0.7 + Math.random() * 0.3) * 100) / 100, // 0.7-1.0
          bounding_box: {
            x: Math.floor(Math.random() * 200),
            y: Math.floor(Math.random() * 150),
            width: 150 + Math.floor(Math.random() * 100),
            height: 200 + Math.floor(Math.random() * 100)
          },
          detection_type: Math.random() > 0.5 ? "face_recognition" : "motion_detection",
          processing_time_ms: Math.floor(Math.random() * 500) + 100
        }
      };
      
      sampleEvents.push(event);
    }
    
    // WARNING: THIS SCRIPT WILL DELETE ALL EXISTING EVENTS IN THE DATABASE!
    // Only run this if you want to replace all existing data with sample data.
    // For production use, comment out the deleteMany line below.
    
    console.log("⚠️  WARNING: This script will DELETE ALL existing events!");
    console.log("⚠️  If you want to preserve existing data, stop this script now!");
    console.log("⚠️  Sleeping for 5 seconds...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // COMMENTED OUT TO PREVENT DATA LOSS - UNCOMMENT ONLY IF YOU WANT TO DELETE ALL DATA
    // console.log("Clearing existing events...");
    // await eventsCollection.deleteMany({});
    
    console.log("Skipping deletion of existing events for data safety...");
    console.log("Adding sample events to existing collection...");
    
    // Insert sample events
    console.log("Inserting sample events...");
    const result = await eventsCollection.insertMany(sampleEvents);
    
    console.log(`✅ Successfully created ${result.insertedCount} sample events`);
    
    // Show some statistics
    const stats = await eventsCollection.aggregate([
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log("\n📊 Events by level:");
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} events`);
    });
    
    // Show events by camera
    const cameraStats = await eventsCollection.aggregate([
      {
        $group: {
          _id: "$camera_id",
          count: { $sum: 1 },
          latestEvent: { $max: "$timestamp" }
        }
      }
    ]).toArray();
    
    console.log("\n📷 Events by camera:");
    cameraStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} events (latest: ${stat.latestEvent.toISOString()})`);
    });
    
    console.log("\n🎉 Sample data creation completed successfully!");
    
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed.");
    }
  }
}

// Create sample data for GridFS (mock images)
async function createSampleImages() {
  let client;
  
  try {
    console.log("\n📸 Creating sample images in GridFS...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName: "photo_storage" });
    
    // Create some mock image data (small PNG header)
    const mockImageData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // Color type RGB
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00, // RGB data
      0x01, 0x00, 0x01, 0x1A, 0x34, 0x57, 0x2E, 0x00, // End data
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
      0x42, 0x60, 0x82
    ]);
    
    // Create 8 sample images
    for (let i = 0; i < 8; i++) {
      const uploadStream = bucket.openUploadStream(`sample_event_image_${i + 1}.png`, {
        metadata: {
          originalName: `sample_event_image_${i + 1}.png`,
          contentType: "image/png",
          uploadDate: new Date(),
          size: mockImageData.length
        }
      });
      
      uploadStream.end(mockImageData);
      
      await new Promise((resolve, reject) => {
        uploadStream.on("finish", resolve);
        uploadStream.on("error", reject);
      });
      
      console.log(`  ✅ Created sample image ${i + 1}`);
    }
    
    console.log("📸 Sample images created successfully!");
    
  } catch (error) {
    console.error("❌ Error creating sample images:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Main function
async function main() {
  console.log("🚀 Starting Events API sample data creation...");
  console.log(`📍 MongoDB URI: ${MONGODB_URI}`);
  console.log(`📍 Database: ${DB_NAME}\n`);
  
  await createSampleEvents();
  // Note: Uncomment the next line if you want to create sample images too
  await createSampleImages();
  
  console.log("\n✨ All done! You can now test the Events API with sample data.");
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error("💥 Script failed:", error);
  process.exit(1);
});
