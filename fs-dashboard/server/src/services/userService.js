/**
 * User Service
 * Business logic for user management operations
 */
import User from "../models/user.js";
import { hashPassword } from "./authService.js";
import { supabase } from "../db/supabase.js";
import { ApiError } from "../middlewares/errorHandler.js";

/**
 * Create a new user with hashed password
 *
 * @param {Object} userData - User data object
 * @param {string} userData.username - Username (required)
 * @param {string} userData.password - Plain text password (required)
 * @param {string} userData.name - Full name (required)
 * @param {string} userData.email - Email address (required)
 * @param {string} [userData.role='viewer'] - User role (admin, operator, viewer)
 * @returns {Promise<User>} - Created user instance
 * @throws {ApiError} - If user creation fails
 */
async function createUser(userData) {
  try {
    // Validate fields
    const requiredFields = ["username", "password", "name", "email"];
    for (const field of requiredFields) if (!userData[field]) throw new ApiError(400, `${field} is required`);

    const hashedPassword = await hashPassword(userData.password);

    const newUser = {
      username: userData.username,
      password: hashedPassword,
      name: userData.name,
      email: userData.email,
      role: userData.role || "viewer",
    };

    const { data, error } = await supabase.from("users").insert([newUser]).select().single();

    if (error) {
      if (error.code === "23505") throw new ApiError(409, "Username or email already exists");

      throw error;
    }

    return new User(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to create user: " + error.message);
  }
}

/**
 * Find user by email address
 *
 * @param {string} email - Email address to search for
 * @returns {Promise<User|null>} - User instance or null if not found
 * @throws {ApiError} - If search fails
 */
async function getUserByEmail(email) {
  try {
    if (!email) throw new ApiError(400, "Email is required");

    const { data, error } = await supabase.from("users").select("*").eq("email", email).single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data ? new User(data) : null;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to find user by email: " + error.message);
  }
}

/**
 * Find user by username
 *
 * @param {string} username - Username to search for
 * @returns {Promise<User|null>} - User instance or null if not found
 * @throws {ApiError} - If search fails
 */
async function getUserByUsername(username) {
  try {
    if (!username) throw new ApiError(400, "Username is required");

    const { data, error } = await supabase.from("users").select("*").eq("username", username).single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data ? new User(data) : null;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to find user by username: " + error.message);
  }
}

/**
 * Find user by ID
 *
 * @param {string|number} id - User ID to search for
 * @returns {Promise<User>} - User instance
 * @throws {ApiError} - If user not found or search fails
 */
async function getUserById(id) {
  try {
    if (!id) throw new ApiError(400, "User ID is required");

    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") throw new ApiError(404, "User not found");
      throw error;
    }

    return new User(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to find user by ID: " + error.message);
  }
}

export { createUser, getUserByEmail, getUserByUsername, getUserById };
