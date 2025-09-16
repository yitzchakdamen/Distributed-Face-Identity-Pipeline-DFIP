import express from "express";
import { getProfile, getUserByIdController } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /users/profile - Get current user profile (protected)
router.get("/profile", authenticateToken, getProfile);

// GET /users/:id - Get user by ID (protected)
router.get("/:id", authenticateToken, getUserByIdController);

export default router;
