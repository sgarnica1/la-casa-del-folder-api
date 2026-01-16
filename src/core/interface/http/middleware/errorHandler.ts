import { Request, Response, NextFunction } from "express";
import { BaseError } from "../../../domain/errors/BaseError";
import { mapPrismaError } from "../../../infrastructure/errors/PrismaErrorMapper";
import { config } from "../../../../config";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let domainError: BaseError;

  if (error instanceof BaseError) {
    domainError = error;
  } else {
    domainError = mapPrismaError(error);
  }

  const statusCode = domainError.statusCode || 500;
  const isDevelopment = config.nodeEnv === "development";

  const response: {
    error: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
      stack?: string;
    };
  } = {
    error: {
      code: domainError.code,
      message: domainError.message,
      ...(domainError.details && { details: domainError.details }),
      ...(isDevelopment && domainError.stack && { stack: domainError.stack }),
    },
  };

  if (statusCode >= 500 && !isDevelopment) {
    console.error("Internal server error:", {
      error: domainError,
      stack: domainError.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json(response);
}
