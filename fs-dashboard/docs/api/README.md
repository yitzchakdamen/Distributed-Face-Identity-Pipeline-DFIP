# FS Dashboard API Documentation

## Overview

This API provides authentication, user management, and camera management services for the Face Alert Dashboard system.

## Available API Documentation

- **[Camera Management API](./camera-api-documentation.md)** - Complete documentation for camera CRUD operations and user assignments
- **[Authentication & User Management](#user-authentication)** - User registration, login, and role management

## Postman Collections

### Camera API Collection

Import the following files into Postman to test the Camera Management API:

1. **Collection**: `camera-api-postman-collection.json`
   - Contains all camera management endpoints
   - Includes authentication, CRUD operations, and user assignments
   - Automatic token management with test scripts

2. **Environment**: `camera-api-postman-environment.json`
   - Pre-configured variables for testing
   - Update `base_url`, `user_email`, and `user_password` as needed
   - Auto-populated variables for created resources

### How to Use Postman Collection

1. Import both collection and environment files into Postman
2. Select the "Camera API Environment" in Postman
3. Update environment variables:
   - `base_url`: Your server URL (default: http://localhost:5000)
   - `user_email`: Valid operator or admin email
   - `user_password`: Password for the user
4. Run "Login" request first to get JWT token
5. Use other requests to test camera functionality

**Note**: The JWT token is automatically saved to environment variables after successful login.

## Base URLs

### Development

```
http://localhost:3000
```

### Production

```
https://api.facealert.live
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After logging in, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User

- **POST** `/auth/register`
- **Description**: Create a new user account
- **Body**:

```json
{
  "username": "string (3-30 chars)",
  "password": "string (min 6 chars)",
  "name": "string (required)",
  "email": "string (valid email)",
  "role": "string (admin|manager|viewer) - optional, defaults to viewer"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "token": "jwt-token"
  }
}
```

#### Login User

- **POST** `/auth/login`
- **Description**: Authenticate user and get JWT token
- **Body**:

```json
{
  "username": "string",
  "password": "string"
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "token": "jwt-token"
  }
}
```

### Users (Protected Routes)

#### Get User Profile

- **GET** `/users/profile`
- **Description**: Get current authenticated user's profile
- **Headers**: `Authorization: Bearer <token>`
- **Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
}
```

#### Get User by ID

- **GET** `/users/:id`
- **Description**: Get user information by ID
- **Headers**: `Authorization: Bearer <token>`
- **Parameters**: `id` (user UUID)
- **Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
}
```

### Health

#### Health Check

- **GET** `/health`
- **Description**: Check server health status
- **Response**:

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "timestamp",
  "uptime": "number",
  "environment": "string"
}
```

#### Server Root

- **GET** `/`
- **Description**: Welcome message
- **Response**:

```json
{
  "success": true,
  "message": "Welcome to FaceAlert Server!"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack (in development mode)"
}
```

### Common Error Codes

- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Invalid or missing token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **409**: Conflict - Resource already exists
- **500**: Internal Server Error

## Postman Collection

Import the provided Postman collection and environment files:

- `postman-collection.json` - API endpoints
- `postman-environment.json` - Development environment (localhost:3000)
- `postman-environment-production.json` - Production environment (api.facealert.live)

### Usage with Postman

1. Import all files into Postman
2. Select the appropriate environment:
   - "FS Dashboard Development" for local testing
   - "FS Dashboard Production" for production testing
3. Use "Register User" or "Login User" to get a JWT token
4. The token will be automatically set in the environment variables
5. Use protected endpoints with the token

### Testing Production

To test the production API at `https://api.facealert.live`:

1. Select the "FS Dashboard Production" environment in Postman
2. Use the same endpoints as in development
3. Note: Production may have different data and rate limits

## Example Usage

### Development (localhost)

### 1. Register a new user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!",
    "name": "Test User",
    "email": "test@example.com"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!"
  }'
```

### 3. Get profile (with token)

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/users/profile
```

### Production (api.facealert.live)

### 1. Test production health

```bash
curl https://api.facealert.live/health
```

### 2. Register on production

```bash
curl -X POST https://api.facealert.live/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "produser",
    "password": "ProdTest123!",
    "name": "Production User",
    "email": "prod@example.com"
  }'
```

### 3. Login on production

```bash
curl -X POST https://api.facealert.live/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "produser",
    "password": "ProdTest123!"
  }'
```

## Validation Rules

### Username

- Length: 3-30 characters
- Allowed: letters, numbers, underscore
- Must be unique

### Password

- Minimum length: 6 characters
- Must contain at least one letter and one number

### Email

- Must be valid email format
- Must be unique

### Name

- Required field
- Minimum length: 1 character

### Role

- Allowed values: "admin", "manager", "viewer"
- Defaults to "viewer" if not specified
