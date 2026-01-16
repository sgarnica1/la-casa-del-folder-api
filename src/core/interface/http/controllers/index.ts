import { DraftController } from "./DraftController";
import { AssetController } from "./AssetController";
import { OrderController } from "./OrderController";
import { HealthController } from "./HealthController";
import { LayoutController } from "./LayoutController";

export interface Controllers {
  draftController: DraftController;
  assetController: AssetController;
  orderController: OrderController;
  healthController: HealthController;
  layoutController: LayoutController;
}
