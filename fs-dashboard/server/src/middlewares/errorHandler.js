import { serverConfig } from "../config/server.js";

const ENVIRONMENT = serverConfig.environment;

/**
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;

    /* Captures the stack trace of the error for debugging
            targetObject: The object that will receive the stack trace.
            constructorOpt (Optional): The function that created the targetObject.
    */
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error wrapper
 * Catches async errors and passes them to error handler
 */
const catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Global error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`${new Date().toISOString()} - ERROR:`, {
    message: error.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Joi validation error
  if (err.isJoi) {
    const message = err.details.map((detail) => detail.message).join(", ");
    error = new ApiError(400, message);
  }

  // Mongo errors here in the future...

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Internal server error",
    ...(ENVIRONMENT === "development" && { stack: err.stack }),
  });
};

export { ApiError, catchAsync, globalErrorHandler };
