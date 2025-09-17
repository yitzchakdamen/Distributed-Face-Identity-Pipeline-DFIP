// Script to add sample events for testing
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB_NAME || "face_recognition_db";

async function addSampleEvents() {
  let client;

  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const eventsCollection = db.collection("Event");

    // Sample events for camera 123 (which exists)
    const sampleEvents = [
      {
        person_id: "ad2a1cee4a1568440d2ad00983ec07c67ee042b5e05b65f4e7700819f6263dc6",
        time: new Date("2025-09-17T10:31:22.209Z"),
        level: "alert",
        image_id: "b5fe8846-930b-5641-8bbe-5184e4f32a11",
        camera_id: "123",
        message: "Person ad2a1cee4a1568440d2ad00983ec07c67ee042b5e05b65f4e7700819f6263dc6 detected by camera 123 on 2025-09-17T10:31:22.209Z."
      },
      {
        person_id: "person_002",
        time: new Date("2025-09-17T10:35:00.000Z"),
        level: "warning",
        image_id: "c6fe8846-930b-5641-8bbe-5184e4f32a12",
        camera_id: "123",
        message: "Person person_002 detected by camera 123 on 2025-09-17T10:35:00.000Z."
      },
      {
        person_id: "person_003",
        time: new Date("2025-09-17T10:40:00.000Z"),
        level: "info",
        image_id: "d7fe8846-930b-5641-8bbe-5184e4f32a13",
        camera_id: "456", // Different camera that user doesn't have access to
        message: "Person person_003 detected by camera 456 on 2025-09-17T10:40:00.000Z."
      }
    ];

    const result = await eventsCollection.insertMany(sampleEvents);
    console.log(`Inserted ${result.insertedCount} events`);

    // Verify the events were inserted
    const count = await eventsCollection.countDocuments();
    console.log(`Total events in database: ${count}`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

addSampleEvents();
