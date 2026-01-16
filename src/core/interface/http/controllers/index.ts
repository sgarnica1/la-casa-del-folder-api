import { DraftController } from "./DraftController";
import { AssetController } from "./AssetController";
import { OrderController } from "./OrderController";
import { HealthController } from "./HealthController";
import { LayoutController } from "./LayoutController";
import { UserController } from "./UserController";

export interface Controllers {
  draftController: DraftController;
  assetController: AssetController;
  orderController: OrderController;
  healthController: HealthController;
  layoutController: LayoutController;
  userController: UserController;
}
