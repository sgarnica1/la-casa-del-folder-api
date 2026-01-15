import { Prisma } from "@prisma/client";
import { BaseError } from "../../domain/errors/BaseError";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  InternalServerError,
} from "../../domain/errors/DomainErrors";

export function mapPrismaError(error: unknown): BaseError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0] || "field";
        return new ConflictError(
          `A record with this ${field} already exists`,
          { field, target }
        );
      }

      case "P2003": {
        const fieldName = error.meta?.field_name as string | undefined;
        
        if (fieldName?.includes("user_id")) {
          return new NotFoundError("User", undefined);
        }
        
        if (fieldName?.includes("product_id")) {
          return new NotFoundError("Product", undefined);
        }
        
        if (fieldName?.includes("template_id")) {
          return new NotFoundError("ProductTemplate", undefined);
        }
        
        return new ValidationError(
          `Foreign key constraint violation on ${fieldName || "related record"}`,
          { fieldName }
        );
      }

      case "P2025": {
        return new NotFoundError("Record", undefined);
      }

      case "P2014": {
        return new ValidationError(
          "Invalid ID: the required relation records were not found",
          error.meta
        );
      }

      default:
        return new InternalServerError(
          `Database error: ${error.message}`,
          { code: error.code, meta: error.meta }
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError("Invalid data provided", {
      message: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new InternalServerError("Database connection failed", {
      message: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new InternalServerError("Database engine error", {
      message: error.message,
    });
  }

  if (error instanceof BaseError) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message);
  }

  return new InternalServerError("An unknown error occurred");
}
