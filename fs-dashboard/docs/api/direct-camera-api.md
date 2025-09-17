# Direct Camera API Documentation

## Overview

This API provides direct access to camera events and images from MongoDB without the /api/mongo prefix. All endpoints require authentication and respect camera access permissions.

## Base URL

- Production: `https://api.facealert.live`
- Local Development: `http://localhost:3000` or `http://localhost:5000`

## Authentication

All endpoints require authentication with JWT token:

```
Authorization: Bearer your-jwt-token-here
```

## Access Control

Camera access is controlled based on user roles:

- **Admin**: Can access all cameras
- **Operator/Viewer**: Can only access assigned cameras

## Endpoints

### 1. Get Camera Events

Get events for a specific camera with optional filtering.

**Endpoint:** `GET /camera/:cameraId/events`

**Path Parameters:**
- `cameraId` (string, required): Camera ID to fetch events for

**Query Parameters:**
- `level` (string, optional): Filter by event level (info, warning, alert)
- `startDate` (string, optional): Filter events after this date (ISO format)
- `endDate` (string, optional): Filter events before this date (ISO format)
- `limit` (number, optional): Maximum events to return (default: 50)
- `skip` (number, optional): Number of events to skip for pagination (default: 0)
- `includeImages` (boolean, optional): Include base64 images (default: false)

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "68ca8dff5f4ece3f40baf090",
      "person_id": "189b33f52bef3c6e3bf743eec6c4e805915a580e11387c0411a97727a21bef43",
      "time": "2025-09-17T10:31:21.020Z",
      "level": "alert",
      "image_id": "5190c3ea-c722-5e3e-b014-e583a33b7235",
      "camera_id": "123",
      "message": "Person detected by camera 123",
      "image": "data:image/jpeg;base64,..." // Only if includeImages=true
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 50,
    "skip": 0
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: No access to this camera
- `503 Service Unavailable`: MongoDB unavailable

### 2. Get Latest Camera Event

Get the most recent event for a specific camera.

**Endpoint:** `GET /camera/:cameraId/latest`

**Path Parameters:**
- `cameraId` (string, required): Camera ID

**Query Parameters:**
- `includeImage` (boolean, optional): Include base64 image (default: false)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "68ca8dff5f4ece3f40baf090",
    "person_id": "189b33f52bef3c6e3bf743eec6c4e805915a580e11387c0411a97727a21bef43",
    "time": "2025-09-17T10:31:21.020Z",
    "level": "alert",
    "image_id": "5190c3ea-c722-5e3e-b014-e583a33b7235",
    "camera_id": "123",
    "message": "Person detected by camera 123",
    "image": "data:image/jpeg;base64,..." // Only if includeImage=true
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: No access to this camera
- `404 Not Found`: No events found for this camera
- `503 Service Unavailable`: MongoDB unavailable

### 3. Get Camera Statistics

Get event statistics for a specific camera.

**Endpoint:** `GET /camera/:cameraId/stats`

**Path Parameters:**
- `cameraId` (string, required): Camera ID

**Query Parameters:**
- `startDate` (string, optional): Start date for statistics (ISO format, default: 7 days ago)
- `endDate` (string, optional): End date for statistics (ISO format, default: now)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "totalEvents": 42,
    "byLevel": {
      "info": 20,
      "warning": 15,
      "alert": 7
    },
    "byDay": [
      {
        "date": "2025-09-10",
        "count": 5
      },
      {
        "date": "2025-09-11",
        "count": 8
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: No access to this camera
- `503 Service Unavailable`: MongoDB unavailable

### 4. Get Camera Image

Get a specific image from a camera.

**Endpoint:** `GET /camera/:cameraId/image/:imageId`

**Path Parameters:**
- `cameraId` (string, required): Camera ID
- `imageId` (string, required): Image ID

**Query Parameters:**
- `format` (string, optional): Image format (base64 or binary, default: binary)

**Success Response:**

For `format=binary` (default):
- Content-Type: image/jpeg
- Binary image data

For `format=base64`:

```json
{
  "success": true,
  "data": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: No access to this camera
- `404 Not Found`: Image not found for this camera
- `503 Service Unavailable`: MongoDB unavailable

## Usage Examples

### Get Events for Camera

```bash
curl -X GET "https://api.facealert.live/camera/123/events?level=alert&limit=10" \
  -H "Authorization: Bearer your-jwt-token-here"
```

### Get Latest Event with Image

```bash
curl -X GET "https://api.facealert.live/camera/123/latest?includeImage=true" \
  -H "Authorization: Bearer your-jwt-token-here"
```

### Get Camera Statistics

```bash
curl -X GET "https://api.facealert.live/camera/123/stats" \
  -H "Authorization: Bearer your-jwt-token-here"
```

### Get Camera Image

```bash
# Binary format
curl -X GET "https://api.facealert.live/camera/123/image/5190c3ea-c722-5e3e-b014-e583a33b7235" \
  -H "Authorization: Bearer your-jwt-token-here" \
  --output image.jpg

# Base64 format
curl -X GET "https://api.facealert.live/camera/123/image/5190c3ea-c722-5e3e-b014-e583a33b7235?format=base64" \
  -H "Authorization: Bearer your-jwt-token-here"
```

## Notes

- All timestamps are in ISO 8601 format
- Image IDs are UUIDs stored in events
- Binary images are served with correct Content-Type headers
- Base64 images include data URL prefix
- Pagination uses skip/limit pattern
- All endpoints respect user camera assignments
