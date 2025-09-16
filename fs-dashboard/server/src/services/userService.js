// User Service - BLL and db operations

import User from "../models/user.js";
import { hashPassword } from "./authService.js";
import { supabase } from "../db/supabase.js";
import { ApiError } from "../middlewares/errorHandler.js";
import { validate } from "./validationService.js";
import { createUserSchema, emailSchema, usernameSchema, userIdSchema } from "../schemas/userSchemas.js";

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
/**
 * Create a new user with password hashing
 * @param {Object} userData - User data
 * @returns {Object} - Created user
 */
export async function createUser(userData) {
  const validatedData = validate(userData, createUserSchema);

  const hashedPassword = await hashPassword(validatedData.password);

  const dbUserData = {
    ...validatedData,
    password: hashedPassword,
  };

  const { data, error } = await supabase.from("users").insert(dbUserData).select().single();

  if (error) throw new Error(`Database error: ${error.message}`);

  return new User(data);
}

/**
 * Find user by email address
 *
 * @param {string} email - Email address to search for
 * @returns {Promise<User|null>} - User instance or null if not found
 * @throws {ApiError} - If search fails
 */
/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Object|null} - User object or null if not found
 */
export async function getUserByEmail(email) {
  const validatedEmail = validate(email, emailSchema);

  const { data, error } = await supabase.from("users").select("*").eq("email", validatedEmail).single();

  if (error) {
    if (error.code === "PGRST116") return null; // User not found

    throw new Error(`Database error: ${error.message}`);
  }

  return new User(data);
}

/**
 * Get user by username
 * @param {string} username - Username
 * @returns {Object|null} - User object or null if not found
 */
export async function getUserByUsername(username) {
  const validatedUsername = validate(username, usernameSchema);

  const { data, error } = await supabase.from("users").select("*").eq("username", validatedUsername).single();

  if (error) {
    if (error.code === "PGRST116") return null; // User not found

    throw new Error(`Database error: ${error.message}`);
  }

  return new User(data);
}

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Object|null} - User object or null if not found
 */
export async function getUserById(id) {
  const validatedId = validate(id, userIdSchema);

  const { data, error } = await supabase.from("users").select("*").eq("id", validatedId).single();

  if (error) {
    if (error.code === "PGRST116") return null; // User not found

    throw new Error(`Database error: ${error.message}`);
  }

  return new User(data);
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
    const validatedUsername = validate(username, usernameSchema);

    const { data, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("username", validatedUsername)
      .single();

    if (dbError) {
      if (dbError.code === "PGRST116") return null;
      throw dbError;
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
    const validatedId = validate(id, userIdSchema);

    const { data, error: dbError } = await supabase.from("users").select("*").eq("id", validatedId).single();

    if (dbError) {
      if (dbError.code === "PGRST116") throw new ApiError(404, "User not found");
      throw dbError;
    }

    return new User(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Failed to find user by ID: " + error.message);
  }
}

export { createUser, getUserByEmail, getUserByUsername, getUserById };
