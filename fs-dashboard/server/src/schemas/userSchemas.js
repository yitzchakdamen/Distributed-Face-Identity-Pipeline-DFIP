// Centralized validation schemas for user data

import Joi from "joi";

const baseSchemas = {
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.alphanum": "Username must contain only alphanumeric characters",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 30 characters",
    "any.required": "Username is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),

  name: Joi.string().trim().max(100).required().messages({
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),

  role: Joi.string().valid("admin", "operator", "viewer").default("viewer").messages({
    "any.only": "Role must be admin, operator, or viewer",
  }),

  userId: Joi.string().uuid().required().messages({
    "string.uuid": "Invalid user ID format",
    "any.required": "User ID is required",
  }),
};

const createUserSchema = Joi.object({
  username: baseSchemas.username,
  password: baseSchemas.password,
  name: baseSchemas.name,
  email: baseSchemas.email,
  role: baseSchemas.role,
});

const loginUserSchema = Joi.object({
  username: Joi.string().required().messages({
    "any.required": "Username is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const userIdSchema = baseSchemas.userId;
const usernameSchema = baseSchemas.username;
const emailSchema = baseSchemas.email;

export { createUserSchema, loginUserSchema, userIdSchema, usernameSchema, emailSchema, baseSchemas };
