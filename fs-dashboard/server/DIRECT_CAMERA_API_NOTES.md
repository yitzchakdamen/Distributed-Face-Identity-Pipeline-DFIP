# Direct Camera API Development Notes

## Implementation Summary

Added direct camera API endpoints without the `/api/mongo/` prefix for cleaner URL structure.

### New Files Created

1. **Routes**: `/src/routes/cameraDirectRoutes.js`
   - Direct camera endpoints
   - Authentication and authorization
   - Image handling (binary/base64)

2. **Utils**: `/src/utils/mongoUtils.js`
   - MongoDB availability checking
   - Configuration validation

3. **Documentation**: `/docs/api/direct-camera-api.md`
   - Complete API documentation
   - Usage examples
   - Error codes

4. **Postman Collections**:
   - `/docs/api/direct-camera-api-collection.json`
   - `/docs/api/direct-camera-api-environment.json`

### Updated Files

1. **Server**: `/src/server.js`
   - Added new route registration: `/camera` endpoints

2. **MongoDB Service**: `/src/services/mongoGridFSService.js`
   - Added `getEvents()` method with filtering
   - Added `getLatestEvent()` for most recent event
   - Added `countEvents()` for pagination
   - Added `getCameraStats()` for analytics
   - Added `getEventByImageId()` for image verification
   - Added `getImageStream()` for binary image serving

3. **README**: `/server/README.md`
   - Added Direct Camera API section
   - Updated available APIs list

## New Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/camera/:cameraId/events` | Get events for specific camera |
| GET | `/camera/:cameraId/latest` | Get latest event for camera |
| GET | `/camera/:cameraId/stats` | Get camera statistics |
| GET | `/camera/:cameraId/image/:imageId` | Get specific image |

## Testing

Test the endpoints using curl or Postman:

```bash
# Get events for camera 123
curl -H "Authorization: Bearer TOKEN" \
     "https://api.facealert.live/camera/123/events?limit=5"

# Get latest event with image
curl -H "Authorization: Bearer TOKEN" \
     "https://api.facealert.live/camera/123/latest?includeImage=true"

# Get camera statistics
curl -H "Authorization: Bearer TOKEN" \
     "https://api.facealert.live/camera/123/stats"

# Get image in binary format
curl -H "Authorization: Bearer TOKEN" \
     "https://api.facealert.live/camera/123/image/IMAGE_ID" \
     --output image.jpg
```

## Security Features

- JWT authentication required for all endpoints
- Camera access control based on user assignments
- Admin users can access all cameras
- Regular users only access assigned cameras
- Image access validated through event ownership

## Error Handling

- 401: Authentication required
- 403: Insufficient permissions
- 404: Resource not found
- 503: MongoDB unavailable

## Next Steps

1. Test endpoints with real data
2. Add rate limiting if needed
3. Add caching for frequently accessed images
4. Consider adding bulk operations
5. Monitor performance with large datasets

## Configuration

Make sure these environment variables are set:

```env
MONGODB_URI=mongodb://your-mongo-connection
MONGODB_DB_NAME=face_recognition_db
JWT_SECRET=your-jwt-secret
```

## Database Collections Used

- `events` - Event records with camera_id, person_id, image_id
- `photos.files` - GridFS file metadata
- `photos.chunks` - GridFS file chunks
