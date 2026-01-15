import { createApp } from "./core/interface/http/app";
import { DraftController } from "./core/interface/http/controllers/DraftController";
import { AssetController } from "./core/interface/http/controllers/AssetController";
import { OrderController } from "./core/interface/http/controllers/OrderController";
import { HealthController } from "./core/interface/http/controllers/HealthController";
import { CreateDraft } from "./core/application/use-cases/CreateDraft";
import { UploadAsset } from "./core/application/use-cases/UploadAsset";
import { LockDraft } from "./core/application/use-cases/LockDraft";
import { CreateOrder } from "./core/application/use-cases/CreateOrder";
import { PrismaDraftRepository } from "./core/infrastructure/repositories/PrismaDraftRepository";
import { PrismaAssetRepository } from "./core/infrastructure/repositories/PrismaAssetRepository";
import { PrismaOrderRepository } from "./core/infrastructure/repositories/PrismaOrderRepository";
import { config } from "./config";

const draftRepository = new PrismaDraftRepository();
const assetRepository = new PrismaAssetRepository();
const orderRepository = new PrismaOrderRepository();

const createDraft = new CreateDraft({ draftRepository });
const uploadAsset = new UploadAsset({ assetRepository });
const lockDraft = new LockDraft({ draftRepository });
const createOrder = new CreateOrder({ orderRepository, draftRepository });

const draftController = new DraftController(createDraft, lockDraft);
const assetController = new AssetController(uploadAsset);
const orderController = new OrderController(createOrder);
const healthController = new HealthController();

const app = createApp(draftController, assetController, orderController, healthController);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
