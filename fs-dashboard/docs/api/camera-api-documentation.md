# Camera Management API Documentation

## Overview

The Camera Management API provides endpoints for managing cameras in the face detection system. It supports role-based access control with three user roles: admin, operator, and viewer.

## Authentication

All camera endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## User Roles

- **admin**: Can create operators, view all cameras, and perform all operations
- **operator**: Can create cameras and assign them to viewers
- **viewer**: Can only view assigned cameras

## Base URL

```
/api/cameras
```

## Endpoints

### 1. Create Camera

Creates a new camera in the system.

**Endpoint:** `POST /api/cameras`

**Authentication:** Required (operator or admin)

**Request Body:**

```json
{
  "name": "Front Door Camera",
  "camera_id": "CAM001",
  "connection_string": "rtsp://192.168.1.100:554/stream"
}
```

**Request Body Schema:**

- `name` (string, required): Camera display name (3-100 characters)
- `camera_id` (string, required): Unique camera identifier (3-50 characters, alphanumeric and hyphens only)
- `connection_string` (string, required): Camera connection URL (valid URL format)

**Success Response (201):**

```json
{
  "success": true,
  "message": "Camera created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Front Door Camera",
    "camera_id": "CAM001",
    "connection_string": "rtsp://192.168.1.100:554/stream",
    "created_by": "user-uuid-here",
    "created_at": "2024-09-16T10:30:00Z",
    "updated_at": "2024-09-16T10:30:00Z"
  }
}
```

**Error Responses:**

- `400`: Validation error or camera ID already exists
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)

### 2. Get Cameras

Retrieves cameras accessible to the authenticated user.

**Endpoint:** `GET /api/cameras`

**Authentication:** Required

**Query Parameters:**

- `page` (integer, optional): Page number for pagination (default: 1, min: 1)
- `limit` (integer, optional): Items per page (default: 10, min: 1, max: 100)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Cameras retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Front Door Camera",
      "camera_id": "CAM001",
      "connection_string": "rtsp://192.168.1.100:554/stream",
      "created_by": "user-uuid-here",
      "created_at": "2024-09-16T10:30:00Z",
      "updated_at": "2024-09-16T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Behavior by Role:**

- **admin**: Returns all cameras in the system
- **operator/viewer**: Returns cameras created by the user or assigned to the user

### 3. Get Camera by ID

Retrieves a specific camera by ID.

**Endpoint:** `GET /api/cameras/:id`

**Authentication:** Required

**Path Parameters:**

- `id` (string, required): Camera UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Camera retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Front Door Camera",
    "camera_id": "CAM001",
    "connection_string": "rtsp://192.168.1.100:554/stream",
    "created_by": "user-uuid-here",
    "created_at": "2024-09-16T10:30:00Z",
    "updated_at": "2024-09-16T10:30:00Z"
  }
}
```

**Error Responses:**

- `404`: Camera not found or user doesn't have access
- `401`: Unauthorized
- `400`: Invalid camera ID format

### 4. Update Camera

Updates an existing camera.

**Endpoint:** `PUT /api/cameras/:id`

**Authentication:** Required (operator or admin)

**Path Parameters:**

- `id` (string, required): Camera UUID

**Request Body:**

```json
{
  "name": "Updated Camera Name",
  "connection_string": "rtsp://192.168.1.101:554/stream"
}
```

**Request Body Schema:**

- `name` (string, optional): Camera display name (3-100 characters)
- `connection_string` (string, optional): Camera connection URL

**Success Response (200):**

```json
{
  "success": true,
  "message": "Camera updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Updated Camera Name",
    "camera_id": "CAM001",
    "connection_string": "rtsp://192.168.1.101:554/stream",
    "created_by": "user-uuid-here",
    "created_at": "2024-09-16T10:30:00Z",
    "updated_at": "2024-09-16T10:35:00Z"
  }
}
```

### 5. Delete Camera

Deletes a camera from the system.

**Endpoint:** `DELETE /api/cameras/:id`

**Authentication:** Required (operator or admin)

**Path Parameters:**

- `id` (string, required): Camera UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Camera deleted successfully"
}
```

**Note:** Only the camera creator or an admin can delete a camera.

### 6. Assign Camera to User

Assigns a camera to a viewer user.

**Endpoint:** `POST /api/cameras/:id/assign`

**Authentication:** Required (operator or admin)

**Path Parameters:**

- `id` (string, required): Camera UUID

**Request Body:**

```json
{
  "user_id": "viewer-user-uuid-here"
}
```

**Request Body Schema:**

- `user_id` (string, required): UUID of the user to assign the camera to

**Success Response (200):**

```json
{
  "success": true,
  "message": "Camera assigned successfully"
}
```

**Error Responses:**

- `400`: User already assigned to camera or user not found
- `403`: Can only assign cameras to viewers

### 7. Remove Camera Assignment

Removes a camera assignment from a user.

**Endpoint:** `DELETE /api/cameras/:id/assign/:userId`

**Authentication:** Required (operator or admin)

**Path Parameters:**

- `id` (string, required): Camera UUID
- `userId` (string, required): User UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Camera assignment removed successfully"
}
```

### 8. Get Camera Assignments

Retrieves all user assignments for a specific camera.

**Endpoint:** `GET /api/cameras/:id/assignments`

**Authentication:** Required (operator or admin)

**Path Parameters:**

- `id` (string, required): Camera UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Camera assignments retrieved successfully",
  "data": [
    {
      "user_id": "viewer-uuid-1",
      "assigned_at": "2024-09-16T10:45:00Z",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Camera name is required"]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Camera not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Database Schema

### Cameras Table

```sql
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    camera_id VARCHAR(50) UNIQUE NOT NULL,
    connection_string TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Camera User Assignments Table

```sql
CREATE TABLE camera_user_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(camera_id, user_id)
);
```

## Usage Examples

### Create a Camera

```bash
curl -X POST http://localhost:5000/api/cameras \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Parking Lot Camera",
    "camera_id": "CAM002",
    "connection_string": "rtsp://192.168.1.102:554/stream"
  }'
```

### Get All Cameras

```bash
curl -X GET http://localhost:5000/api/cameras \
  -H "Authorization: Bearer your-jwt-token"
```

### Assign Camera to User

```bash
curl -X POST http://localhost:5000/api/cameras/camera-uuid/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "user_id": "viewer-user-uuid"
  }'
```
