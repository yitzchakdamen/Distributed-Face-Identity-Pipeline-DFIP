# Milestone A Setup Instructions

## Prerequisites

1. **Supabase Account**: Create tables in your Supabase database
2. **Environment Variables**: Configure database connection
3. **Node.js 18+**: For running the server

## Database Setup

### 1. Run Migrations in Supabase

Execute the following SQL scripts in your Supabase SQL Editor:

#### Migration 1: Create Cameras Table
```sql
-- Execute: server/src/db/migrations/001_create_cameras_table.sql
```

#### Migration 2: Create Persons and Alerts Tables  
```sql
-- Execute: server/src/db/migrations/002_create_persons_embeddings_alerts.sql
```

### 2. Environment Configuration

Create or update your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret
```

## Running the Server

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Load Sample Data (Optional)
```bash
npm run seed
```

## Testing the Implementation

### 1. Check Server Status
```bash
curl http://localhost:3001/health
```

### 2. Create Authentication Token
You'll need a valid JWT token for API calls. Use your existing auth system or create a test token.

### 3. Create Test Camera
```bash
curl -X POST http://localhost:3001/cameras \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Camera",
    "connection_string": "rtsp://test:test@192.168.1.100:554/stream",
    "status": "disabled"
  }'
```

### 4. Enable Camera (Triggers Worker Creation)
```bash
curl -X PATCH http://localhost:3001/cameras/{camera_id}/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "enabled"}'
```

### 5. Check Camera Manager Status
```bash
curl http://localhost:3001/api/camera-manager/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. View Cameras with Runtime Status
```bash
curl http://localhost:3001/cameras/runtime \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Console Output

When you enable a camera, you should see:

```
Publishing camera.updated event: { type: 'camera.updated', camera_id: '...', ... }
Publishing camera.enabled event: { type: 'camera.enabled', camera_id: '...', ... }
Creating worker for camera: uuid
Worker created successfully for camera: uuid, pod: camera-worker-uuid
```

## Key Features Demonstrated

1. **Event-Driven Architecture**: Camera status changes trigger events
2. **Worker Management**: Camera Manager creates/destroys mock workers
3. **Runtime Tracking**: Database tracks worker status and health
4. **API Integration**: RESTful endpoints for camera management
5. **Health Monitoring**: Worker heartbeat system

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys in `.env`
- Check if tables exist in Supabase dashboard
- Ensure RLS policies allow your operations

### Authentication Issues
- Verify JWT token is valid and not expired
- Check user has required roles (admin/operator)
- Ensure auth middleware is working

### Camera Manager Issues
- Check console logs for event publishing
- Verify Camera Manager started successfully
- Look for worker creation/destruction logs

## Next Steps

This milestone provides the foundation. Next steps include:

1. **Real Workers**: Replace mock workers with actual containers
2. **Kubernetes**: Deploy workers as K8s pods
3. **Message Bus**: Replace EventEmitter with Kafka/Redis
4. **Monitoring**: Add Prometheus metrics and health checks

## File Structure

```
server/
├── src/
│   ├── db/
│   │   ├── migrations/           # Database schema migrations
│   │   ├── CameraDAL.js         # Database access layer
│   │   └── supabase.js          # Database connection
│   ├── models/
│   │   ├── Camera.js            # Camera and runtime models
│   │   └── Person.js            # Person and alert models
│   ├── events/
│   │   └── CameraEventPublisher.js  # Event system
│   ├── services/
│   │   └── camera-manager/
│   │       └── CameraManager.js     # Worker lifecycle management
│   ├── routes/
│   │   ├── cameraRoutes.js          # Camera API endpoints
│   │   └── cameraManagerRoutes.js   # Manager API endpoints
│   └── controllers/
│       └── cameraController.js      # Updated with new functionality
├── scripts/
│   └── loadSampleData.js        # Sample data loader
└── docs/
    └── MILESTONE_A_INFRASTRUCTURE.md  # Detailed documentation
```
