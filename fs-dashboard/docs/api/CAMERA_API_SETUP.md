# Camera API Setup and Testing Guide

## Quick Start

This guide will help you set up and test the Camera Management API using the provided documentation and Postman collection.

## Prerequisites

1. Server running on port 5000 (or update base_url in environment)
2. Valid user account with operator or admin role
3. Postman application installed

## Files Overview

- `camera-api-documentation.md` - Complete API documentation
- `camera-api-postman-collection.json` - Postman collection with all endpoints
- `camera-api-postman-environment.json` - Environment variables for testing

## Setup Instructions

### 1. Import Postman Files

1. Open Postman
2. Click "Import" button
3. Upload `camera-api-postman-collection.json`
4. Upload `camera-api-postman-environment.json`

### 2. Configure Environment

1. Select "Camera API Environment" from the environment dropdown
2. Update the following variables:
   - `base_url`: Your server URL (default: <http://localhost:5000>)
   - `user_email`: Valid operator or admin email
   - `user_password`: User password

### 3. Test Authentication

1. Open "Authentication" folder in the collection
2. Run "Login" request
3. Verify JWT token is automatically saved to environment

### 4. Test Camera Operations

1. Create a camera using "Create Camera" request
2. View cameras with "Get All Cameras"
3. Test other endpoints as needed

## API Endpoints Summary

### Core Operations

- `POST /api/cameras` - Create camera (operator/admin)
- `GET /api/cameras` - List cameras (all roles)
- `GET /api/cameras/:id` - Get specific camera
- `PUT /api/cameras/:id` - Update camera (operator/admin)
- `DELETE /api/cameras/:id` - Delete camera (operator/admin)

### User Assignments

- `POST /api/cameras/:id/assign` - Assign camera to viewer
- `DELETE /api/cameras/:id/assign/:userId` - Remove assignment
- `GET /api/cameras/:id/assignments` - List camera assignments

## Role Permissions

- **Admin**: Full access to all operations and all cameras
- **Operator**: Can create cameras, assign to viewers, manage own cameras
- **Viewer**: Can only view assigned cameras

## Testing Workflow

1. **Login** → Get JWT token
2. **Create Camera** → Save camera ID
3. **List Cameras** → Verify creation
4. **Assign to User** → Test user assignments
5. **Update/Delete** → Test modifications

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check JWT token is valid
   - Ensure user has correct role

2. **400 Validation Error**
   - Check request body format
   - Verify required fields

3. **404 Not Found**
   - Verify camera exists
   - Check user has access to camera

### Debug Tips

- Check server logs for detailed error messages
- Verify database connectivity
- Ensure all required environment variables are set

## Environment Variables

The following variables are automatically managed:

- `jwt_token` - Auto-populated after login
- `created_camera_id` - Auto-populated after camera creation
- `camera_id_param` - Use for URL parameters in requests

## Next Steps

After successful testing:

1. Update production URLs in environment
2. Create additional test scenarios
3. Integrate with frontend application
4. Set up monitoring and logging
