// Joi validation schemas for event-related operations

import Joi from "joi";

// Schema for getting events with query parameters
export const getEventsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  level: Joi.string().valid("low", "medium", "high"),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")),
  cameraId: Joi.string().trim()
});

// Schema for event ID parameter
export const eventIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

// Schema for image download parameters
export const imageQuerySchema = Joi.object({
  download: Joi.boolean().default(false),
  format: Joi.string().valid("jpeg", "jpg", "png").default("jpeg")
});

// Schema for events statistics query
export const eventsStatsQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")),
  level: Joi.string().valid("low", "medium", "high")
});
