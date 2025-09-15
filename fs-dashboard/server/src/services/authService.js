import bcrypt from "bcrypt";
import { authConfig } from "../config/auth.js";
const BCRYPT_SALT_ROUNDS = authConfig.bcryptSaltRounds;
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
