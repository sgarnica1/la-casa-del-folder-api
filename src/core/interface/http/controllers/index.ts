import { DraftController } from "./DraftController";
import { AssetController } from "./AssetController";
import { OrderController } from "./OrderController";
import { HealthController } from "./HealthController";
import { LayoutController } from "./LayoutController";
import { UserController } from "./UserController";
import { MeDraftController } from "./MeDraftController";
import { MeOrderController } from "./MeOrderController";
import { CartController } from "./CartController";
import { ProductController } from "./ProductController";
import { PaymentController } from "./PaymentController";
import { WebhookController } from "./WebhookController";
import { UserAddressController } from "./UserAddressController";

export interface Controllers {
  draftController: DraftController;
  assetController: AssetController;
  orderController: OrderController;
  healthController: HealthController;
  layoutController: LayoutController;
  userController: UserController;
  meDraftController: MeDraftController;
  meOrderController: MeOrderController;
  cartController: CartController;
  productController: ProductController;
  paymentController: PaymentController;
  webhookController: WebhookController;
  userAddressController: UserAddressController;
}
