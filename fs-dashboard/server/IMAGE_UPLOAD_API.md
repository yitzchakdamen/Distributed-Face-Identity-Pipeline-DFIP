# Image Upload API

This endpoint allows uploading images to the Face Detection service.

## Endpoint

```
POST /images/upload
```

## Usage

### Option 1: File Upload (multipart/form-data)

```bash
curl -X POST http://localhost:3000/images/upload \
  -F "image=@path/to/your/image.jpg"
```

### Option 2: Base64 JSON

```bash
curl -X POST http://localhost:3000/images/upload \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
  }'
```

## Request Formats

### File Upload

- **Content-Type**: `multipart/form-data`
- **Field name**: `image`
- **Accepted formats**: Any image format (jpg, png, gif, etc.)
- **Max size**: 10MB

### Base64 JSON

- **Content-Type**: `application/json`
- **Body**:

  ```json
  {
    "image": "data:image/[format];base64,[base64-string]"
  }
  ```

## Response

### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Image received successfully.",
    "size_bytes": 12345
  },
  "message": "Image processed successfully"
}
```

### Error Responses

#### No Image Provided (400)

```json
{
  "error": "No image provided. Send either file upload or base64 image data."
}
```

#### Data Service Unavailable (503)

```json
{
  "error": "Data service is not available",
  "details": "Please ensure the data service is running on port 8000"
}
```

#### Data Service Error (varies)

```json
{
  "error": "Data service error",
  "details": "Error details from data service"
}
```

## Configuration

The data service URL is configured in the controller:

```javascript
const DATA_SERVICE_URL = "http://localhost:8000";
```

To change the data service endpoint, modify this constant in:
`src/controllers/imageController.js`

## Testing

A simple HTML test page is available at:
`image-upload-test.html`

Open this file in a browser to test both file upload and base64 upload methods.

## Dependencies

- **axios**: For HTTP requests to data service
- **multer**: For handling file uploads
- **express**: Web framework
