import { getUserById, getUserByUsername, getUserByEmail } from "../services/userService.js";
import { ApiError } from "../middlewares/errorHandler.js";

/**
 * Get user profile (current authenticated user)
 * GET /users/profile
 */
export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id; // From JWT middleware

    const user = await getUserById(userId);
    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user by ID
 * GET /users/:id
 * Access control handled by canAccessUser middleware
 */
export async function getUserByIdController(req, res, next) {
  try {
    const { id } = req.params;

    const user = await getUserById(id);
    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
