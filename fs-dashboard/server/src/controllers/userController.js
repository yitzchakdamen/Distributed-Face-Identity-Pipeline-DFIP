import { getUserById, getUserByUsername, getUserByEmail, getAllUsers, createUser, updateUser, deleteUser } from "../services/userService.js";
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

/**
 * Get all users or filter by role
 * GET /users or GET /users?role=viewer
 */
export async function getAllUsersController(req, res, next) {
  try {
    const { role } = req.query;
    
    const users = await getAllUsers(role);
    
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new user
 * POST /users
 */
export async function createUserController(req, res, next) {
  try {
    const userData = req.body;
    
    const newUser = await createUser(userData);

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user
 * PUT /users/:id
 */
export async function updateUserController(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedUser = await updateUser(id, updateData);
    if (!updatedUser) throw new ApiError(404, "User not found");

    res.status(200).json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user
 * DELETE /users/:id
 */
export async function deleteUserController(req, res, next) {
  try {
    const { id } = req.params;
    
    await deleteUser(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
