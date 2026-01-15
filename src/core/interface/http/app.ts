import express from "express";
import { createRoutes } from "./routes";
import { DraftController } from "./controllers/DraftController";
import { AssetController } from "./controllers/AssetController";
import { OrderController } from "./controllers/OrderController";
import { HealthController } from "./controllers/HealthController";

export function createApp(
  draftController: DraftController,
  assetController: AssetController,
  orderController: OrderController,
  healthController: HealthController
): express.Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    "/api",
    createRoutes(draftController, assetController, orderController, healthController)
  );

  return app;
}
