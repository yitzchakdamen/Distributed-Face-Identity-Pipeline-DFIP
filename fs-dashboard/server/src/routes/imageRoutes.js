import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/imageController.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// POST /images/upload - Upload image (supports both file upload and base64)
router.post("/upload", upload.single("image"), uploadImage);

export default router;
