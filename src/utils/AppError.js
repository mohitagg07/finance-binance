/**
 * src/utils/AppError.js
 * ─────────────────────
 * Typed error hierarchy. Controllers throw these;
 * the global error handler in app.js formats the JSON response.
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name       = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = "Resource") { super(`${resource} not found.`, 404); }
}

class ConflictError extends AppError {
  constructor(message) { super(message, 409); }
}

class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") { super(message, 403); }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.") { super(message, 401); }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed.", details = []) {
    super(message, 422);
    this.details = details;
  }
}

module.exports = { AppError, NotFoundError, ConflictError, ForbiddenError, UnauthorizedError, ValidationError };
