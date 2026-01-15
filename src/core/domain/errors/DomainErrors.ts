import { BaseError } from "./BaseError";

export class NotFoundError extends BaseError {
  readonly code = "NOT_FOUND";
  readonly statusCode = 404;

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, { resource, identifier });
  }
}

export class ValidationError extends BaseError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class ConflictError extends BaseError {
  readonly code = "CONFLICT";
  readonly statusCode = 409;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class UnauthorizedError extends BaseError {
  readonly code = "UNAUTHORIZED";
  readonly statusCode = 401;

  constructor(message = "Authentication required") {
    super(message);
  }
}

export class ForbiddenError extends BaseError {
  readonly code = "FORBIDDEN";
  readonly statusCode = 403;

  constructor(message = "Access forbidden") {
    super(message);
  }
}

export class InternalServerError extends BaseError {
  readonly code = "INTERNAL_SERVER_ERROR";
  readonly statusCode = 500;

  constructor(message = "An internal server error occurred", details?: Record<string, unknown>) {
    super(message, details);
  }
}
