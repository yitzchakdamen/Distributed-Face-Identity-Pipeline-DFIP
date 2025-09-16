# Events API Documentation

The Events API provides endpoints for viewing and managing facial recognition events captured by cameras. All endpoints require authentication and respect role-based access control.

## Base URL
```
/events
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints Overview

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| GET | `/events` | Get paginated list of events | All authenticated users |
| GET | `/events/stats` | Get events statistics | All authenticated users |
| GET | `/events/count` | Get total events count | All authenticated users |
| GET | `/events/:id` | Get specific event details | Users with camera access |
| GET | `/events/:id/image` | Get event image | Users with camera access |

## Detailed Endpoints

### 1. Get Events
**GET** `/events`

Retrieves a paginated list of events accessible to the authenticated user based on their camera assignments.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 10 | Items per page (min: 1, max: 100) |
| `level` | string | - | Filter by alert level: "low", "medium", "high" |
| `startDate` | string | - | Start date (ISO 8601 format) |
| `endDate` | string | - | End date (ISO 8601 format) |
| `cameraId` | string | - | Filter by specific camera ID |

#### Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8b2c1e4b0a1b2c3d4e5f6",
      "person_id": "person_123",
      "camera_id": "camera_456",
      "level": "medium",
      "timestamp": "2023-09-06T10:30:00.000Z",
      "image_id": "64f8b2c1e4b0a1b2c3d4e5f7",
      "metadata": {
        "confidence": 0.85,
        "bounding_box": {
          "x": 100,
          "y": 150,
          "width": 200,
          "height": 250
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Get Events Statistics
**GET** `/events/stats`

Retrieves aggregated statistics about events for the authenticated user.

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | string | Start date filter (ISO 8601) |
| `endDate` | string | End date filter (ISO 8601) |
| `level` | string | Level filter: "low", "medium", "high" |

#### Response
```json
{
  "success": true,
  "data": {
    "totalEvents": 145,
    "levelStats": [
      {
        "_id": "high",
        "count": 15
      },
      {
        "_id": "medium", 
        "count": 45
      },
      {
        "_id": "low",
        "count": 85
      }
    ],
    "camerasCount": 3
  }
}
```

### 3. Get Events Count
**GET** `/events/count`

Retrieves the total count of events accessible to the authenticated user.

#### Query Parameters
Same as `/events/stats`

#### Response
```json
{
  "success": true,
  "data": {
    "count": 145
  }
}
```

### 4. Get Event by ID
**GET** `/events/:id`

Retrieves detailed information about a specific event.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Event ObjectId (24 character hex) |

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "64f8b2c1e4b0a1b2c3d4e5f6",
    "person_id": "person_123",
    "camera_id": "camera_456",
    "level": "medium",
    "timestamp": "2023-09-06T10:30:00.000Z",
    "image_id": "64f8b2c1e4b0a1b2c3d4e5f7",
    "metadata": {
      "confidence": 0.85,
      "bounding_box": {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 250
      }
    }
  }
}
```

### 5. Get Event Image
**GET** `/events/:id/image`

Retrieves the image associated with a specific event from GridFS storage.

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Event ObjectId (24 character hex) |

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `download` | boolean | false | Force download as attachment |
| `format` | string | "jpeg" | Image format: "jpeg", "jpg", "png" |

#### Response
Returns binary image data with appropriate headers:
- `Content-Type`: `image/{format}`
- `Content-Length`: Size in bytes
- `Cache-Control`: `public, max-age=86400`
- `Content-Disposition`: (if download=true) `attachment; filename="event-{id}-image.{format}"`

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid query parameters",
  "details": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied. You don't have permission to view events from this camera."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Event not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Error description"
}
```

## Access Control

Events access is controlled by camera assignments:

1. **Admin**: Can view events from all cameras
2. **Operator**: Can view events from assigned cameras
3. **Viewer**: Can view events from assigned cameras (read-only)

Users can only access events from cameras they have been assigned to through the camera management system.

## Rate Limiting

- Image endpoints may have stricter rate limits due to bandwidth considerations
- Standard API rate limits apply to all other endpoints

## Examples

### Get recent high-level events
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3000/events?level=high&limit=5"
```

### Get events from specific camera
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3000/events?cameraId=camera_456&page=1&limit=20"
```

### Download event image
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3000/events/64f8b2c1e4b0a1b2c3d4e5f6/image?download=true&format=png" \
     --output event_image.png
```

### Get events statistics
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3000/events/stats"
```
