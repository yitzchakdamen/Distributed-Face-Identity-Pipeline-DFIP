// user BLL and database operations

import User from "../models/user.js";
import { supabase } from "../db/supabase.js";
import { validate } from "./validationService.js";
import { createUserSchema, emailSchema, usernameSchema, userIdSchema } from "../schemas/userSchemas.js";
import { hashPassword } from "./authService.js";

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

export async function getUserByEmail(email) {
  const validatedEmail = validate(email, emailSchema);

  const { data, error } = await supabase.from("users").select("*").eq("email", validatedEmail).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Database error: ${error.message}`);
  }

  return new User(data);
}

export async function getUserByUsername(username) {
  const validatedUsername = validate(username, usernameSchema);

  const { data, error } = await supabase.from("users").select("*").eq("username", validatedUsername).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Database error: ${error.message}`);
  }

  return new User(data);
}

export async function getUserById(id) {
  const validatedId = validate(id, userIdSchema);

  const { data, error } = await supabase.from("users").select("*").eq("id", validatedId).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Database error: ${error.message}`);
  }

  return new User(data);
}
