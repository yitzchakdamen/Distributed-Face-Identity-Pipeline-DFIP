# MongoDB API Documentation

## Overview

This API provides access to MongoDB GridFS stored images and person/alert data. All endpoints return JSON responses and handle MongoDB availability gracefully.

## Base URL

- Production: `https://api.facealert.live`
- Local: `http://localhost:3000`

## Authentication

Currently, all endpoints are public for demo purposes.

## Error Handling

All endpoints handle MongoDB unavailability gracefully:

- `503 Service Unavailable`: MongoDB service not configured or unavailable
- `504 Gateway Timeout`: MongoDB operation timed out (database overloaded)
- `500 Internal Server Error`: Other server errors

## Endpoints

### 1. Get All Persons with Images

**Endpoint:** `GET /api/mongo/persons`

**Description:** Retrieves all persons stored in MongoDB with their associated images and statistics.

**Response Format:**

```json
{
  "success": true,
  "persons": [
    {
      "person_id": "person_001",
      "images": [
        {
          "image_id": "64f1234567890abcdef12345",
          "filename": "person_001_1.jpg",
          "timestamp": "2024-09-17T08:30:00.000Z",
          "base64_data": "data:image/jpeg;base64,/9j/4AAQ..."
        }
      ]
    }
  ],
  "stats": {
    "total_events": 202,
    "total_persons": 25,
    "total_images": 202,
    "avg_images_per_person": 8.08,
    "max_images_for_single_person": 73,
    "min_images_for_single_person": 0
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Gateway timeout",
  "message": "MongoDB operation timed out. Please try again later."
}
```

### 2. Get Alerts/Events with Images

**Endpoint:** `GET /api/mongo/alerts`

**Description:** Retrieves alerts/events from MongoDB with associated images.

**Query Parameters:**

- `level` (optional): Filter by alert level (info, warning, error)
- `camera_id` (optional): Filter by camera ID
- `limit` (optional): Number of results to return (default: 50)
- `skip` (optional): Number of results to skip (default: 0)

**Example Request:**

```http
GET /api/mongo/alerts?level=warning&limit=10&skip=0
```

**Response Format:**

```json
{
  "success": true,
  "data": [
    {
      "person_id": "person_001",
      "time": "2024-09-17T08:30:00.000Z",
      "level": "info",
      "image_id": "64f1234567890abcdef12345",
      "camera_id": "camera_01",
      "message": "Person detected: person_001",
      "image": "data:image/jpeg;base64,/9j/4AAQ..."
    }
  ],
  "pagination": {
    "limit": 50,
    "skip": 0,
    "total": 25
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Failed to fetch alerts data",
  "message": "MongoDB service is not available or an error occurred"
}
```

## Response Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 503  | Service Unavailable (MongoDB not configured) |
| 504  | Gateway Timeout (MongoDB operation timeout) |
| 500  | Internal Server Error |

## Data Models

### Person

```typescript
interface Person {
  person_id: string;
  images: PersonImage[];
}
```

### PersonImage

```typescript
interface PersonImage {
  image_id: string;
  filename: string;
  timestamp: string;
  base64_data: string;
}
```

### Alert

```typescript
interface Alert {
  person_id: string;
  time: string;
  level: string;
  image_id: string;
  camera_id: string;
  message: string;
  image: string | null;
}
```

### Statistics

```typescript
interface Stats {
  total_events: number;
  total_persons: number;
  total_images: number;
  avg_images_per_person: number;
  max_images_for_single_person: number;
  min_images_for_single_person: number;
}
```

## Notes

1. **Image Data:** All images are returned as base64-encoded data URLs ready for display in HTML img tags.

2. **Timeout Handling:** All operations have a 25-second timeout to prevent Heroku H12 errors.

3. **Graceful Degradation:** If MongoDB is not available, the API returns appropriate error messages instead of crashing.

4. **Production Considerations:** In production without MongoDB configured, all endpoints will return 503 errors with descriptive messages.

5. **Performance:** Large datasets may cause timeouts. Consider implementing pagination for better performance.
