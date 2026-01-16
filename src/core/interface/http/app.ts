import express from "express";
import cors from "cors";
import { createRoutes } from "./routes/index.route";
import type { Controllers } from "./controllers";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { config } from "../../../config";

function createApp(controllers: Controllers): express.Application {
  const app = express();

  app.use(
    cors({
      origin:
        config.nodeEnv === "development"
          ? ["http://localhost:5173", "http://localhost:5174"]
          : process.env.FRONTEND_URL || "*",
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  app.use("/api", createRoutes(controllers));

  app.use(errorHandler);

  return app;
}

export function startServer(controllers: Controllers): void {
  const app = createApp(controllers);

  app.listen(config.port, () => {
    console.log(`Server running on port http://localhost:${config.port}`);
  });
}
