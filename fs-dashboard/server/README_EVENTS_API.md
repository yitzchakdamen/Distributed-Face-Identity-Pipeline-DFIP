# Events API System 🎥

Complete API system for managing facial recognition events with role-based access control and image storage.

## Overview

The Events API provides endpoints for viewing and managing facial recognition events captured by cameras. It integrates with the existing Camera API to ensure users can only access events from cameras they have permission to view.

## Features

- 🔐 **Role-based access control** - Users see only events from assigned cameras
- 📊 **Statistics and analytics** - Get insights about event patterns
- 🖼️ **Image management** - Serve event images from GridFS storage
- 📄 **Pagination support** - Efficient handling of large datasets
- 🔍 **Advanced filtering** - Filter by date, level, camera, etc.
- ⚡ **Performance optimized** - Efficient database queries and caching

## Database Schema

### Events Collection
```javascript
{
  _id: ObjectId,
  person_id: String,        // Identified person ID
  camera_id: String,        // Camera that captured the event
  level: String,            // Alert level: "low", "medium", "high"
  timestamp: Date,          // When the event occurred
  image_id: ObjectId,       // Reference to GridFS image
  metadata: {
    confidence: Number,     // Detection confidence (0-1)
    bounding_box: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    detection_type: String,
    processing_time_ms: Number
  }
}
```

### GridFS Photo Storage
Images are stored in GridFS bucket named `photo_storage` with metadata including:
- Original filename
- Content type
- Upload date
- File size

## API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/events` | List events with pagination | All authenticated |
| GET | `/events/stats` | Get event statistics | All authenticated |
| GET | `/events/count` | Get total event count | All authenticated |
| GET | `/events/:id` | Get specific event | Camera access required |
| GET | `/events/:id/image` | Get event image | Camera access required |

## Access Control

Events access is controlled through camera assignments:

- **Admin**: Can view events from all cameras
- **Operator**: Can view events from assigned cameras  
- **Viewer**: Can view events from assigned cameras (read-only)

Users can only access events from cameras they have been assigned to through the Camera Management system.

## Installation & Setup

### 1. Install Dependencies
```bash
cd fs-dashboard/server
npm install
```

### 2. Environment Variables
Ensure your `.env` file includes:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=face_recognition_db
```

### 3. Create Sample Data (Optional)
```bash
npm run create-sample-events
```

### 4. Start the Server
```bash
npm run dev
```

## Usage Examples

### Get Recent Events
```javascript
const response = await fetch('/events?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

### Filter by Alert Level
```javascript
const response = await fetch('/events?level=high&limit=5', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Get Event Statistics
```javascript
const response = await fetch('/events/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const stats = await response.json();
```

### Download Event Image
```javascript
const response = await fetch(`/events/${eventId}/image?download=true`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const blob = await response.blob();
```

## Architecture

### Models
- **Event**: Database operations and GridFS image retrieval
- **Camera**: Integration with existing camera permissions

### Services
- **EventService**: Business logic with role-based access control
- **CameraService**: Camera permission validation

### Controllers
- **EventController**: HTTP request handling and validation

### Routes
- **EventRoutes**: API endpoint definitions with authentication

## File Structure

```
src/
├── models/
│   └── event.js              # Event model with GridFS support
├── services/
│   └── eventService.js       # Business logic with access control
├── controllers/
│   └── eventController.js    # HTTP request handlers
├── routes/
│   └── eventRoutes.js        # API route definitions
├── schemas/
│   └── eventSchemas.js       # Joi validation schemas
└── scripts/
    └── createSampleEvents.js # Sample data generation
```

## Testing

### Using Postman
1. Import the collection: `docs/api/events-api-collection.json`
2. Set the `authToken` variable with a valid JWT
3. Run the requests to test functionality

### Manual Testing
```bash
# Get events
curl -H "Authorization: Bearer <token>" http://localhost:3000/events

# Get statistics
curl -H "Authorization: Bearer <token>" http://localhost:3000/events/stats

# Get specific event
curl -H "Authorization: Bearer <token>" http://localhost:3000/events/{eventId}
```

## Error Handling

The API includes comprehensive error handling for:
- Authentication failures
- Access control violations
- Invalid parameters
- Database connection issues
- Image retrieval problems
- GridFS operations

## Performance Considerations

### Database Indexing
Recommended indexes for optimal performance:
```javascript
// Events collection indexes
db.events.createIndex({ "camera_id": 1, "timestamp": -1 })
db.events.createIndex({ "level": 1, "timestamp": -1 })
db.events.createIndex({ "timestamp": -1 })
db.events.createIndex({ "person_id": 1, "timestamp": -1 })
```

### Caching
- Image responses include cache headers for browser caching
- Statistics can be cached for short periods to reduce load

### Pagination
- Default limit of 10 events per page
- Maximum limit of 100 events per page
- Cursor-based pagination for large datasets

## Security

- All endpoints require JWT authentication
- Role-based access control prevents unauthorized access
- Input validation using Joi schemas
- SQL injection prevention through parameterized queries
- XSS protection through proper data sanitization

## Monitoring

### Metrics to Track
- API response times
- Database query performance
- Image download speeds
- Error rates by endpoint
- User access patterns

### Logging
- Request/response logging
- Error logging with stack traces
- Performance metric logging
- Security event logging

## Future Enhancements

- [ ] Real-time event notifications via WebSockets
- [ ] Event export functionality (CSV, PDF)
- [ ] Advanced analytics and reporting
- [ ] Event clustering and pattern recognition
- [ ] Integration with external notification systems
- [ ] Event archiving and cleanup policies

## Contributing

1. Create a feature branch from `main`
2. Implement changes with proper tests
3. Update documentation as needed
4. Submit a pull request for review

## Support

For questions or issues:
1. Check the API documentation in `docs/api/EVENTS_API.md`
2. Review the Postman collection for examples
3. Check server logs for error details
4. Contact the development team

---

**Note**: This Events API is part of the Distributed Face Identity Pipeline (DFIP) system and requires the Camera API to be properly configured for access control to function correctly.
