import express from "express";
import { 
  getProfile, 
  getUserByIdController, 
  getAllUsersController, 
  createUserController, 
  updateUserController, 
  deleteUserController 
} from "../controllers/userController.js";
import { authenticateToken, canAccessUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /users - Get all users or filter by role (protected)
router.get("/", authenticateToken, getAllUsersController);

// GET /users/profile - Get current user profile (protected)
router.get("/profile", authenticateToken, getProfile);

// POST /users - Create new user (protected)
router.post("/", authenticateToken, createUserController);

// GET /users/:id - Get user by ID (protected, with access control)
router.get("/:id", authenticateToken, canAccessUser, getUserByIdController);

// PUT /users/:id - Update user (protected)
router.put("/:id", authenticateToken, updateUserController);

// DELETE /users/:id - Delete user (protected)
router.delete("/:id", authenticateToken, deleteUserController);

export default router;
