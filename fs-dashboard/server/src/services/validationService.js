// Centralized validation logic using Joi schemas

const validationOptions = {
  abortEarly: false, // Show all validation errors
  stripUnknown: true, // Remove unknown fields for security
  convert: true, // Convert types when possible
  allowUnknown: false, // Don't allow unknown properties
};

/**
 * Generic validation function
 *
 * @param {any} data - Data to validate
 * @param {Object} schema - Joi schema to validate against
 * @returns {any} - Validated and cleaned data
 * @throws {ValidationError} - Joi validation error with all issues
 */
function validate(data, schema) {
  const { error, value } = schema.validate(data, validationOptions);
  if (error) throw error;

  return value;
}

export { validate };
