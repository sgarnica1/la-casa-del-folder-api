import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { createRoutes } from "./routes/index.route";
import type { Controllers } from "./controllers";
import type { Repositories } from "../../domain/repositories";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { config } from "../../../config";

function createApp(controllers: Controllers, repositories: Repositories): express.Application {
  const app = express();

  const allowedOrigins =
    config.nodeEnv === "development"
      ? ["http://localhost:5173", "http://localhost:5174"]
      : process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL]
        : [];

  if (allowedOrigins.length === 0 && config.nodeEnv === "production") {
    console.warn("WARNING: No FRONTEND_URL set in production. CORS may not work correctly.");
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
        } else if (allowedOrigins.includes(origin)) {
          callback(null, origin);
        } else if (allowedOrigins.length === 0 && config.nodeEnv !== "production") {
          callback(null, true);
        } else {
          console.error(`CORS rejected origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-signature", "x-request-id"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    if (req.path === "/api/payments/webhook") {
      return next();
    }
    return clerkMiddleware()(req, res, next);
  });

  app.use(requestLogger);

  app.use("/api", createRoutes(controllers, repositories));

  app.use(errorHandler);

  return app;
}

export function startServer(controllers: Controllers, repositories: Repositories): void {
  const app = createApp(controllers, repositories);

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`Server running on port http://0.0.0.0:${config.port}`);
  });
}
