import bcrypt from "bcrypt";
import { authConfig } from "../config/auth.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../middlewares/errorHandler.js";
const BCRYPT_SALT_ROUNDS = authConfig.bcryptSaltRounds;
const DEFAULT_TOKEN_EXPIRATION = authConfig.jwtExpiresIn;
const JWT_SECRET = authConfig.jwtSecret;

/**
 * Hash a password using bcrypt
 *
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} - Hashed password
 * @throws {Error} - If hashing fails
 */
async function hashPassword(password) {
  if (!password) throw new Error("Password cannot be empty");
  if (typeof password !== "string") throw new Error("Password must be type of string");

  try {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  } catch (error) {
    throw new Error("Failed to hash password: " + error.message);
  }
}

/**
 * Compare a password against a hash
 *
 * @param {string} password - Plain text password to check
 * @param {string} hash - Stored hash to compare against
 * @returns {Promise<boolean>} - True if password matches hash
 * @throws {Error} - If comparison fails
 */
async function comparePassword(password, hash) {
  if (!password) throw new Error("Password cannot be empty");
  if (typeof password !== "string") throw new Error("Password must be type of string");
  if (!hash) throw new Error("Hash cannot be empty");
  if (typeof hash !== "string") throw new Error("Hash must be type of string");
  if (hash.length != 60) throw new Error("hash.length must be 60 characters");

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error("Failed to compare password: " + error.message);
  }
}

/**
 * Generate a JWT token for a user
 *
 * @param {Object} user - User object
 * @param {string} user.id - User ID
 * @param {string} user.username - Username
 * @param {string} user.name - User name
 * @param {string} user.email - User email
 * @param {string} user.role - User role
 * @returns {string} - JWT token
 * @throws {Error} - If token generation fails
 */
function generateToken(user) {
  if (!authConfig.jwtSecret) throw new Error("JWT_SECRET not configured in environment variables");
  if (!user || !user.id || !user.username || !user.name || !user.email || !user.role) {
    throw new Error("User object must contain id, username, name, email, and role");
  }

  try {
    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const expiresIn = DEFAULT_TOKEN_EXPIRATION;

    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  } catch (error) {
    throw new Error("Failed to generate token: " + error.message);
  }
}

/**
 * Verify and decode a JWT token
 *
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 * @throws {ApiError} - If token is invalid or expired
 */
function verifyToken(token) {
  if (!authConfig.jwtSecret) throw new Error("JWT_SECRET not configured in environment variables");
  if (!token || typeof token !== "string") throw new ApiError(401, "Invalid token format");

  try {
    return jwt.verify(token, authConfig.jwtSecret);
  } catch (error) {
    if (error.name === "TokenExpiredError") throw new ApiError(401, "Token has expired");
    else if (error.name === "JsonWebTokenError") throw new ApiError(401, "Invalid token");
    else throw new ApiError(401, "Token verification failed");
  }
}

