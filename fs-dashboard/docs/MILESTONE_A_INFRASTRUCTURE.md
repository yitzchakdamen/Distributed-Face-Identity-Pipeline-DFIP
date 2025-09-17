# Milestone A - Infrastructure & Baseline

This milestone establishes the foundation for the Distributed Face Identity Pipeline (DFIP) with camera management and event-driven architecture.

## Completed Components

### 1. Database Schema
- **Cameras table**: Stores camera configuration and status
- **Camera Runtime table**: Tracks worker pod status and health
- **Persons table**: For known person management
- **Embeddings table**: Face embeddings storage
- **Alerts table**: System alerts and notifications

### 2. Camera Management API

#### Base URL: `/cameras`

#### Endpoints:

##### Create Camera
```
POST /cameras
Authorization: Bearer <token>
Role: admin, operator

Body:
{
  "name": "Front Door Camera",
  "connection_string": "rtsp://user:pass@192.168.1.100:554/stream",
  "status": "disabled", // optional, defaults to disabled
  "location": "Front Entrance", // optional
  "description": "Main entrance monitoring", // optional
  "metadata": {} // optional
}

Response:
{
  "success": true,
  "message": "Camera created successfully",
  "data": {
    "id": "uuid",
    "name": "Front Door Camera",
    "status": "disabled",
    "location": "Front Entrance",
    "description": "Main entrance monitoring",
    "metadata": {},
    "created_at": "2025-09-17T10:00:00Z",
    "updated_at": "2025-09-17T10:00:00Z"
  }
}
```

##### Update Camera Status
```
PATCH /cameras/{camera_id}/status
Authorization: Bearer <token>
Role: admin, operator

Body:
{
  "status": "enabled" // or "disabled"
}

Response:
{
  "success": true,
  "message": "Camera status updated successfully",
  "data": {
    "id": "uuid",
    "name": "Front Door Camera",
    "status": "enabled",
    ...
  }
}
```

##### Get Cameras with Runtime Status
```
GET /cameras/runtime
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Cameras with runtime status retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Front Door Camera",
      "status": "enabled",
      "location": "Front Entrance",
      "created_at": "2025-09-17T10:00:00Z",
      "runtime": {
        "camera_id": "uuid",
        "pod_name": "camera-worker-uuid",
        "worker_status": "running",
        "last_heartbeat": "2025-09-17T10:05:00Z",
        "health_status": "healthy",
        "error_count": 0
      }
    }
  ]
}
```

##### Worker Heartbeat
```
POST /cameras/{camera_id}/heartbeat

Body:
{
  "status": "running",
  "health_info": {
    "fps": 1.0,
    "memory_usage": "256MB",
    "cpu_usage": "15%"
  }
}

Response:
{
  "success": true,
  "message": "Heartbeat received"
}
```

### 3. Camera Manager API

#### Base URL: `/api/camera-manager`

##### Get Manager Status
```
GET /api/camera-manager/status
Authorization: Bearer <token>
Role: admin, operator

Response:
{
  "success": true,
  "data": {
    "is_running": true,
    "worker_count": 2,
    "workers": [
      {
        "camera_id": "uuid1",
        "podName": "camera-worker-uuid1",
        "namespace": "default",
        "image": "camera-worker:latest",
        "createdAt": "2025-09-17T10:00:00Z"
      }
    ]
  }
}
```

### 4. Event System

The system publishes events for camera lifecycle management:

#### Event Types:
- `camera.created` - When a new camera is added
- `camera.updated` - When camera configuration changes
- `camera.enabled` - When camera status changes to enabled
- `camera.disabled` - When camera status changes to disabled
- `camera.deleted` - When camera is removed
- `worker.heartbeat` - Worker health status updates
- `worker.error` - Worker error notifications

#### Event Schema:
```json
{
  "type": "camera.enabled",
  "camera_id": "uuid",
  "camera": {
    "id": "uuid",
    "name": "Front Door Camera",
    "connection_string": "rtsp://...",
    "status": "enabled",
    ...
  },
  "timestamp": "2025-09-17T10:00:00Z"
}
```

### 5. Camera Manager (Controller)

The Camera Manager listens to camera events and manages worker lifecycle:

#### Features:
- **Event-driven**: Responds to camera enabled/disabled events
- **Worker management**: Creates and destroys camera worker processes
- **Status tracking**: Maintains runtime status in database
- **Error handling**: Tracks worker errors and failures
- **Reconciliation**: Ensures enabled cameras have running workers

#### Workflow:
1. Camera enabled → Manager creates worker → Updates runtime status
2. Camera disabled → Manager destroys worker → Updates runtime status
3. Worker error → Manager tracks errors → Auto-restart or alert
4. Heartbeat → Manager updates last seen timestamp

### 6. Models & Data Access Layer

#### Camera Model
```javascript
class Camera {
  constructor({ id, name, connection_string, status, location, description, metadata })
  static validateStatus(status) // validates enabled/disabled
  toJSON() // full object
  toPublicJSON() // without sensitive connection_string
}
```

#### CameraRuntime Model
```javascript
class CameraRuntime {
  constructor({ camera_id, pod_name, worker_status, last_heartbeat, health_status, error_count })
  static validateWorkerStatus(status) // validates worker states
  toJSON()
}
```

#### Database Access Layer (DAL)
- `CameraDAL`: CRUD operations for cameras table
- `CameraRuntimeDAL`: Runtime status management

## Testing the Implementation

### 1. Start the Server
```bash
cd server
npm run dev
```

### 2. Create a Camera
```bash
curl -X POST http://localhost:3001/cameras \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Camera",
    "connection_string": "rtsp://test:test@192.168.1.100:554/stream",
    "status": "disabled"
  }'
```

### 3. Enable Camera (Triggers Worker Creation)
```bash
curl -X PATCH http://localhost:3001/cameras/{camera_id}/status \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "enabled"}'
```

### 4. Check Manager Status
```bash
curl -X GET http://localhost:3001/api/camera-manager/status \
  -H "Authorization: Bearer <your-token>"
```

### 5. Check Runtime Status
```bash
curl -X GET http://localhost:3001/cameras/runtime \
  -H "Authorization: Bearer <your-token>"
```

## Next Steps (Milestone B)

1. **Real Camera Worker Container**
   - Docker image with OpenCV/FFmpeg
   - RTSP stream reading
   - Frame extraction and publishing

2. **Message Bus Integration**
   - Replace EventEmitter with Kafka/Redis Streams
   - Implement proper message serialization

3. **Kubernetes Integration**
   - Real pod creation/deletion
   - Secrets management for connection strings
   - RBAC configuration

4. **Monitoring & Health Checks**
   - Proper liveness/readiness probes
   - Metrics collection
   - Error recovery strategies

## Architecture Decisions

- **Event-driven design**: Loose coupling between API and worker management
- **Postgres for metadata**: Reliable ACID transactions for camera configuration
- **Runtime status separation**: Separate table for frequently updated worker status
- **Security**: Connection strings not exposed in public API responses
- **Graceful shutdown**: Proper cleanup of workers on manager stop
