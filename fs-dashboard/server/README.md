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
```

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
│   │   └── rootController.js
│   ├── middlewares/     # Middlewares
│   │   └── errorHandler.js
│   ├── routes/          # API routes
│   │   └── rootRoutes.js
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

## API Endpoints

### GET /

Basic connection test

```json
{
  "success": true,
  "message": "Welcome to FaceAlert Server!"
}
```

## Development

### Adding a New Route

1. Create a controller in `src/controllers/`
2. Create a route in `src/routes/`
3. Import and connect to server in `src/server.js`

### Error Handling

The server includes global error handling with:

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
