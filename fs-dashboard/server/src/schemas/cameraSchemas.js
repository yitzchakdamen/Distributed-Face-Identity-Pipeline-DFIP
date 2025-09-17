import Joi from "joi";

// Camera creation schema
export const createCameraSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().trim().messages({
    "string.empty": "Camera name is required",
    "string.min": "Camera name must be at least 1 character",
    "string.max": "Camera name must not exceed 100 characters",
    "any.required": "Camera name is required",
  }),

  camera_id: Joi.string()
    .min(1)
    .max(50)
    .required()
    .trim()
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .messages({
      "string.empty": "Camera ID is required",
      "string.min": "Camera ID must be at least 1 character",
      "string.max": "Camera ID must not exceed 50 characters",
      "string.pattern.base": "Camera ID can only contain letters, numbers, underscores, and hyphens",
      "any.required": "Camera ID is required",
    }),

  connection_string: Joi.string().min(1).max(500).required().trim().messages({
    "string.empty": "Connection string is required",
    "string.min": "Connection string must be at least 1 character",
    "string.max": "Connection string must not exceed 500 characters",
    "any.required": "Connection string is required",
  }),
});

// Camera update schema (all fields optional)
export const updateCameraSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().messages({
    "string.empty": "Camera name cannot be empty",
    "string.min": "Camera name must be at least 1 character",
    "string.max": "Camera name must not exceed 100 characters",
  }),

  camera_id: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .messages({
      "string.empty": "Camera ID cannot be empty",
      "string.min": "Camera ID must be at least 1 character",
      "string.max": "Camera ID must not exceed 50 characters",
      "string.pattern.base": "Camera ID can only contain letters, numbers, underscores, and hyphens",
    }),

  connection_string: Joi.string().min(1).max(500).trim().messages({
    "string.empty": "Connection string cannot be empty",
    "string.min": "Connection string must be at least 1 character",
    "string.max": "Connection string must not exceed 500 characters",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Camera assignment schema
export const assignCameraSchema = Joi.object({
  user_id: Joi.string().uuid().required().messages({
    "string.guid": "User ID must be a valid UUID",
    "any.required": "User ID is required",
  }),
});

// Camera ID parameter schema
export const cameraIdSchema = Joi.object({
  camera_id: Joi.string().uuid().required().messages({
    "string.guid": "Camera ID must be a valid UUID",
    "any.required": "Camera ID is required",
  }),
});

// Query parameters schema for camera listing
export const getCamerasQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit must not exceed 100",
  }),

  search: Joi.string().max(100).trim().allow("").messages({
    "string.max": "Search term must not exceed 100 characters",
  }),
});
