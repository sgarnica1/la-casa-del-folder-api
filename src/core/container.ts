import { DraftController } from "./interface/http/controllers/DraftController";
import { AssetController } from "./interface/http/controllers/AssetController";
import { OrderController } from "./interface/http/controllers/OrderController";
import { HealthController } from "./interface/http/controllers/HealthController";
import { LayoutController } from "./interface/http/controllers/LayoutController";
import { UserController } from "./interface/http/controllers/UserController";
import type { Controllers } from "./interface/http/controllers";
import { CreateDraft } from "./application/use-cases/drafts/CreateDraft";
import { GetDraftById } from "./application/use-cases/drafts/GetDraftById";
import { UpdateDraft } from "./application/use-cases/drafts/UpdateDraft";
import { UploadImage } from "./application/use-cases/assets/UploadImage";
import { GetImagesByIds } from "./application/use-cases/assets/GetImagesByIds";
import { LockDraft } from "./application/use-cases/drafts/LockDraft";
import { CreateOrder } from "./application/use-cases/orders/CreateOrder";
import { GetAllOrders } from "./application/use-cases/orders/GetAllOrders";
import { GetOrderById } from "./application/use-cases/orders/GetOrderById";
import { GetLayoutByTemplateId } from "./application/use-cases/layouts/GetLayoutByTemplateId";
import { PrismaDraftRepository } from "./infrastructure/repositories/PrismaDraftRepository";
import { PrismaAssetRepository } from "./infrastructure/repositories/PrismaAssetRepository";
import { PrismaUploadedImageRepository } from "./infrastructure/repositories/PrismaUploadedImageRepository";
import { PrismaOrderRepository } from "./infrastructure/repositories/PrismaOrderRepository";
import { PrismaProductRepository } from "./infrastructure/repositories/PrismaProductRepository";
import { PrismaProductTemplateRepository } from "./infrastructure/repositories/PrismaProductTemplateRepository";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository";
import { PrismaRoleRepository } from "./infrastructure/repositories/PrismaRoleRepository";

class Container {
  private _draftRepository: PrismaDraftRepository | null = null;
  private _assetRepository: PrismaAssetRepository | null = null;
  private _uploadedImageRepository: PrismaUploadedImageRepository | null = null;
  private _orderRepository: PrismaOrderRepository | null = null;
  private _productRepository: PrismaProductRepository | null = null;
  private _productTemplateRepository: PrismaProductTemplateRepository | null = null;
  private _userRepository: PrismaUserRepository | null = null;
  private _roleRepository: PrismaRoleRepository | null = null;

  private _createDraft: CreateDraft | null = null;
  private _getDraftById: GetDraftById | null = null;
  private _updateDraft: UpdateDraft | null = null;
  private _uploadImage: UploadImage | null = null;
  private _getImagesByIds: GetImagesByIds | null = null;
  private _lockDraft: LockDraft | null = null;
  private _createOrder: CreateOrder | null = null;
  private _getAllOrders: GetAllOrders | null = null;
  private _getOrderById: GetOrderById | null = null;
  private _getLayoutByTemplateId: GetLayoutByTemplateId | null = null;

  private _draftController: DraftController | null = null;
  private _assetController: AssetController | null = null;
  private _orderController: OrderController | null = null;
  private _healthController: HealthController | null = null;
  private _layoutController: LayoutController | null = null;
  private _userController: UserController | null = null;

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

  get uploadedImageRepository(): PrismaUploadedImageRepository {
    if (!this._uploadedImageRepository) {
      this._uploadedImageRepository = new PrismaUploadedImageRepository();
    }
    return this._uploadedImageRepository;
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

  get userRepository(): PrismaUserRepository {
    if (!this._userRepository) {
      this._userRepository = new PrismaUserRepository();
    }
    return this._userRepository;
  }

  get roleRepository(): PrismaRoleRepository {
    if (!this._roleRepository) {
      this._roleRepository = new PrismaRoleRepository();
    }
    return this._roleRepository;
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

  get getDraftById(): GetDraftById {
    if (!this._getDraftById) {
      this._getDraftById = new GetDraftById({
        draftRepository: this.draftRepository,
      });
    }
    return this._getDraftById;
  }

  get updateDraft(): UpdateDraft {
    if (!this._updateDraft) {
      this._updateDraft = new UpdateDraft({
        draftRepository: this.draftRepository,
      });
    }
    return this._updateDraft;
  }

  get uploadImage(): UploadImage {
    if (!this._uploadImage) {
      this._uploadImage = new UploadImage({
        uploadedImageRepository: this.uploadedImageRepository,
      });
    }
    return this._uploadImage;
  }

  get getImagesByIds(): GetImagesByIds {
    if (!this._getImagesByIds) {
      this._getImagesByIds = new GetImagesByIds({
        uploadedImageRepository: this.uploadedImageRepository,
      });
    }
    return this._getImagesByIds;
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
        productRepository: this.productRepository,
        productTemplateRepository: this.productTemplateRepository,
      });
    }
    return this._createOrder;
  }

  get getAllOrders(): GetAllOrders {
    if (!this._getAllOrders) {
      this._getAllOrders = new GetAllOrders({
        orderRepository: this.orderRepository,
      });
    }
    return this._getAllOrders;
  }

  get getOrderById(): GetOrderById {
    if (!this._getOrderById) {
      this._getOrderById = new GetOrderById({
        orderRepository: this.orderRepository,
      });
    }
    return this._getOrderById;
  }

  get getLayoutByTemplateId(): GetLayoutByTemplateId {
    if (!this._getLayoutByTemplateId) {
      this._getLayoutByTemplateId = new GetLayoutByTemplateId({
        productTemplateRepository: this.productTemplateRepository,
      });
    }
    return this._getLayoutByTemplateId;
  }

  get draftController(): DraftController {
    if (!this._draftController) {
      this._draftController = new DraftController(
        this.createDraft,
        this.getDraftById,
        this.updateDraft,
        this.lockDraft,
        this.draftRepository
      );
    }
    return this._draftController;
  }

  get assetController(): AssetController {
    if (!this._assetController) {
      this._assetController = new AssetController(
        this.uploadImage,
        this.getImagesByIds
      );
    }
    return this._assetController;
  }

  get orderController(): OrderController {
    if (!this._orderController) {
      this._orderController = new OrderController(
        this.createOrder,
        this.getAllOrders,
        this.getOrderById
      );
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
      this._layoutController = new LayoutController(this.getLayoutByTemplateId);
    }
    return this._layoutController;
  }

  get userController(): UserController {
    if (!this._userController) {
      this._userController = new UserController();
    }
    return this._userController;
  }

  get controllers(): Controllers {
    return {
      draftController: this.draftController,
      assetController: this.assetController,
      orderController: this.orderController,
      healthController: this.healthController,
      layoutController: this.layoutController,
      userController: this.userController,
    };
  }

  get repositories() {
    return {
      userRepository: this.userRepository,
      draftRepository: this.draftRepository,
      orderRepository: this.orderRepository,
      productRepository: this.productRepository,
      productTemplateRepository: this.productTemplateRepository,
      uploadedImageRepository: this.uploadedImageRepository,
      assetRepository: this.assetRepository,
      roleRepository: this.roleRepository,
    };
  }
}

export const container = new Container();
