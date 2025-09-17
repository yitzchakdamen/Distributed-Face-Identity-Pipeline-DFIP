# FaceAlert Server

## Installation and Setup

### Prerequisites

- Node.js v16+
- npm or yarn

### Installation

```bash
cd server
npm install
```

### Running

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

## Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
# Environment
NODE_ENV=development

# Server
PORT=3001
HOST=localhost

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Database - Supabase (Required)
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# Database - MongoDB (Optional - for MongoDB Gallery feature)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=face_identity
```

### MongoDB Configuration (Optional)

The MongoDB integration is optional. If you want to use the MongoDB Gallery feature:

1. Set up a MongoDB instance
2. Add the connection string to `MONGODB_URI`
3. Ensure your MongoDB has a database with GridFS collections for image storage

If MongoDB is not configured, the `/api/mongo/*` endpoints will return a 503 error with a helpful message.

### Configuration Files

- `src/config/server.js` - Basic server configuration
- `src/config/cors.js` - CORS configuration
- `.env` - Environment variables

## Project Structure

```text
server/
├── src/
│   ├── config/          # Configurations
│   │   ├── server.js    # Server configuration
│   │   └── cors.js      # CORS configuration
│   ├── controllers/     # API controllers
│   │   ├── rootController.js
│   │   └── healthController.js
│   ├── middlewares/     # Middlewares
│   │   └── errorHandler.js
│   ├── routes/          # API routes
│   │   ├── rootRoutes.js
│   │   └── healthRoutes.js
│   └── server.js        # Main server file
├── .env                 # Environment variables
├── .env.example         # Environment variables example
├── index.js             # Entry point
└── package.json         # Dependencies and scripts
```

## Features

- Express.js - Fast and lightweight web framework
- CORS - Cross-origin resource sharing support
- Helmet - Basic security
- ES Modules - Modern module support
- Error Handling - Advanced error handling
- Environment Variables - Dynamic configuration

## Available APIs

- **Authentication API**: User registration, login, and token management
- **Camera Management API**: Create, read, update, delete cameras and manage user assignments
- **Events API**: Retrieve and filter events from the system
- **Direct Camera API**: Direct access to camera events and images from MongoDB
- **MongoDB API**: Raw access to MongoDB collections and GridFS

### Direct Camera API

The server provides direct camera endpoints without the "/api/mongo/" prefix:

- `GET /camera/:cameraId/events` - Get events for a specific camera
- `GET /camera/:cameraId/latest` - Get the latest event for a camera
- `GET /camera/:cameraId/stats` - Get event statistics for a camera
- `GET /camera/:cameraId/image/:imageId` - Get a specific image from a camera

Detailed documentation available in [docs/api/direct-camera-api.md](../docs/api/direct-camera-api.md)

## API Endpoints

### GET /

Basic connection test

```json
{
  "success": true,
  "message": "Welcome to FaceAlert Server!"
}
```

### GET /health

Health check endpoint for monitoring and deployment verification

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-09-14T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## Development

### Adding a New Route

1. Create a controller in `src/controllers/`
2. Create a dedicated route file in `src/routes/` (e.g., `userRoutes.js`)
3. Import and connect the route to server in `src/server.js`

Example structure:

- `src/controllers/userController.js` - Controller logic
- `src/routes/userRoutes.js` - Route definitions
- `src/server.js` - Route registration

### Error Handling

The server includes global error handling with:

- Development mode: Full error details and stack traces
- Production mode: Generic error messages for security

### Production Deployment

For production deployment, ensure these environment variables are set:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
ALLOWED_ORIGINS=https://yourdomain.com
SUPABASE_URL=your_production_supabase_url
SUPABASE_KEY=your_production_supabase_key

# Optional - for MongoDB Gallery feature
MONGODB_URI=your_production_mongodb_connection_string
MONGODB_DB_NAME=face_identity
```

#### Heroku Deployment

Set environment variables using Heroku CLI:

```bash
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your_supabase_url
heroku config:set SUPABASE_KEY=your_supabase_key
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set MONGODB_DB_NAME=face_identity
```

#### GitHub Secrets (for CI/CD)

Add these secrets to your GitHub repository:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `MONGODB_URI` (optional)
- `MONGODB_DB_NAME` (optional)

- Detailed logging
- Customized error messages
- Stack trace in development environment

## Main Dependencies

- express - Web framework
- cors - CORS support
- helmet - HTTP headers security
- dotenv - Environment variables loading

## Security

- Helmet.js for HTTP headers protection
- CORS restricted to allowed domains
- "X-Powered-By" header hiding
- Request size limit (10MB)
