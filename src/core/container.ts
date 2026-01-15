import { DraftController } from "./interface/http/controllers/DraftController";
import { AssetController } from "./interface/http/controllers/AssetController";
import { OrderController } from "./interface/http/controllers/OrderController";
import { HealthController } from "./interface/http/controllers/HealthController";
import { LayoutController } from "./interface/http/controllers/LayoutController";
import type { Controllers } from "./interface/http/controllers";
import { CreateDraft } from "./application/use-cases/drafts/CreateDraft";
import { UploadAsset } from "./application/use-cases/assets/UploadAsset";
import { LockDraft } from "./application/use-cases/drafts/LockDraft";
import { CreateOrder } from "./application/use-cases/orders/CreateOrder";
import { PrismaDraftRepository } from "./infrastructure/repositories/PrismaDraftRepository";
import { PrismaAssetRepository } from "./infrastructure/repositories/PrismaAssetRepository";
import { PrismaOrderRepository } from "./infrastructure/repositories/PrismaOrderRepository";
import { PrismaProductRepository } from "./infrastructure/repositories/PrismaProductRepository";
import { PrismaProductTemplateRepository } from "./infrastructure/repositories/PrismaProductTemplateRepository";

class Container {
  private _draftRepository: PrismaDraftRepository | null = null;
  private _assetRepository: PrismaAssetRepository | null = null;
  private _orderRepository: PrismaOrderRepository | null = null;
  private _productRepository: PrismaProductRepository | null = null;
  private _productTemplateRepository: PrismaProductTemplateRepository | null = null;

  private _createDraft: CreateDraft | null = null;
  private _uploadAsset: UploadAsset | null = null;
  private _lockDraft: LockDraft | null = null;
  private _createOrder: CreateOrder | null = null;

  private _draftController: DraftController | null = null;
  private _assetController: AssetController | null = null;
  private _orderController: OrderController | null = null;
  private _healthController: HealthController | null = null;
  private _layoutController: LayoutController | null = null;

  get draftRepository(): PrismaDraftRepository {
    if (!this._draftRepository) {
      this._draftRepository = new PrismaDraftRepository();
    }
    return this._draftRepository;
  }

  get assetRepository(): PrismaAssetRepository {
    if (!this._assetRepository) {
      this._assetRepository = new PrismaAssetRepository();
    }
    return this._assetRepository;
  }

  get orderRepository(): PrismaOrderRepository {
    if (!this._orderRepository) {
      this._orderRepository = new PrismaOrderRepository();
    }
    return this._orderRepository;
  }

  get productRepository(): PrismaProductRepository {
    if (!this._productRepository) {
      this._productRepository = new PrismaProductRepository();
    }
    return this._productRepository;
  }

  get productTemplateRepository(): PrismaProductTemplateRepository {
    if (!this._productTemplateRepository) {
      this._productTemplateRepository = new PrismaProductTemplateRepository();
    }
    return this._productTemplateRepository;
  }

  get createDraft(): CreateDraft {
    if (!this._createDraft) {
      this._createDraft = new CreateDraft({
        draftRepository: this.draftRepository,
        productRepository: this.productRepository,
        productTemplateRepository: this.productTemplateRepository,
      });
    }
    return this._createDraft;
  }

  get uploadAsset(): UploadAsset {
    if (!this._uploadAsset) {
      this._uploadAsset = new UploadAsset({
        assetRepository: this.assetRepository,
      });
    }
    return this._uploadAsset;
  }

  get lockDraft(): LockDraft {
    if (!this._lockDraft) {
      this._lockDraft = new LockDraft({
        draftRepository: this.draftRepository,
      });
    }
    return this._lockDraft;
  }

  get createOrder(): CreateOrder {
    if (!this._createOrder) {
      this._createOrder = new CreateOrder({
        orderRepository: this.orderRepository,
        draftRepository: this.draftRepository,
      });
    }
    return this._createOrder;
  }

  get draftController(): DraftController {
    if (!this._draftController) {
      this._draftController = new DraftController(this.createDraft, this.lockDraft, this.draftRepository);
    }
    return this._draftController;
  }

  get assetController(): AssetController {
    if (!this._assetController) {
      this._assetController = new AssetController();
    }
    return this._assetController;
  }

  get orderController(): OrderController {
    if (!this._orderController) {
      this._orderController = new OrderController(this.createOrder);
    }
    return this._orderController;
  }

  get healthController(): HealthController {
    if (!this._healthController) {
      this._healthController = new HealthController();
    }
    return this._healthController;
  }

  get layoutController(): LayoutController {
    if (!this._layoutController) {
      this._layoutController = new LayoutController(this.productTemplateRepository);
    }
    return this._layoutController;
  }

  get controllers(): Controllers {
    return {
      draftController: this.draftController,
      assetController: this.assetController,
      orderController: this.orderController,
      healthController: this.healthController,
      layoutController: this.layoutController,
    };
  }
}

export const container = new Container();
