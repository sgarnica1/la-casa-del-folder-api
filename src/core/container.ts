import { DraftController } from "./interface/http/controllers/DraftController";
import { AssetController } from "./interface/http/controllers/AssetController";
import { OrderController } from "./interface/http/controllers/OrderController";
import { HealthController } from "./interface/http/controllers/HealthController";
import { LayoutController } from "./interface/http/controllers/LayoutController";
import { UserController } from "./interface/http/controllers/UserController";
import { MeDraftController } from "./interface/http/controllers/MeDraftController";
import { MeOrderController } from "./interface/http/controllers/MeOrderController";
import { CartController } from "./interface/http/controllers/CartController";
import { ProductController } from "./interface/http/controllers/ProductController";
import { PaymentController } from "./interface/http/controllers/PaymentController";
import { WebhookController } from "./interface/http/controllers/WebhookController";
import { UserAddressController } from "./interface/http/controllers/UserAddressController";
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
import { GetMyDrafts } from "./application/use-cases/drafts/GetMyDrafts";
import { GetMyDraftById } from "./application/use-cases/drafts/GetMyDraftById";
import { GetMyOrders } from "./application/use-cases/orders/GetMyOrders";
import { GetMyOrderById } from "./application/use-cases/orders/GetMyOrderById";
import { GetLayoutByTemplateId } from "./application/use-cases/layouts/GetLayoutByTemplateId";
import { GetCart } from "./application/use-cases/cart/GetCart";
import { AddCartItem } from "./application/use-cases/cart/AddCartItem";
import { UpdateCartItemQuantity } from "./application/use-cases/cart/UpdateCartItemQuantity";
import { RemoveCartItem } from "./application/use-cases/cart/RemoveCartItem";
import { CheckoutCart } from "./application/use-cases/cart/CheckoutCart";
import { GetProductById } from "./application/use-cases/products/GetProductById";
import { CreatePaymentPreference } from "./application/use-cases/payments/CreatePaymentPreference";
import { ProcessPaymentWebhook } from "./application/use-cases/payments/ProcessPaymentWebhook";
import { VerifyPaymentByPaymentId } from "./application/use-cases/payments/VerifyPaymentByPaymentId";
import { GetUserAddresses } from "./application/use-cases/user-addresses/GetUserAddresses";
import { CreateUserAddress } from "./application/use-cases/user-addresses/CreateUserAddress";
import { PrismaDraftRepository } from "./infrastructure/repositories/PrismaDraftRepository";
import { PrismaAssetRepository } from "./infrastructure/repositories/PrismaAssetRepository";
import { PrismaUploadedImageRepository } from "./infrastructure/repositories/PrismaUploadedImageRepository";
import { PrismaOrderRepository } from "./infrastructure/repositories/PrismaOrderRepository";
import { PrismaProductRepository } from "./infrastructure/repositories/PrismaProductRepository";
import { PrismaProductTemplateRepository } from "./infrastructure/repositories/PrismaProductTemplateRepository";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository";
import { PrismaRoleRepository } from "./infrastructure/repositories/PrismaRoleRepository";
import { PrismaCartRepository } from "./infrastructure/repositories/PrismaCartRepository";
import { PrismaUserAddressRepository } from "./infrastructure/repositories/PrismaUserAddressRepository";
import { PrismaOrderActivityRepository } from "./infrastructure/repositories/PrismaOrderActivityRepository";
import { CreateOrderActivity } from "./application/use-cases/orders/CreateOrderActivity";
import { GetOrderActivities } from "./application/use-cases/orders/GetOrderActivities";
import { UpdateOrderStatus } from "./application/use-cases/orders/UpdateOrderStatus";

class Container {
  private _draftRepository: PrismaDraftRepository | null = null;
  private _assetRepository: PrismaAssetRepository | null = null;
  private _uploadedImageRepository: PrismaUploadedImageRepository | null = null;
  private _orderRepository: PrismaOrderRepository | null = null;
  private _productRepository: PrismaProductRepository | null = null;
  private _productTemplateRepository: PrismaProductTemplateRepository | null = null;
  private _userRepository: PrismaUserRepository | null = null;
  private _roleRepository: PrismaRoleRepository | null = null;
  private _cartRepository: PrismaCartRepository | null = null;
  private _userAddressRepository: PrismaUserAddressRepository | null = null;
  private _orderActivityRepository: PrismaOrderActivityRepository | null = null;

  private _createDraft: CreateDraft | null = null;
  private _getDraftById: GetDraftById | null = null;
  private _updateDraft: UpdateDraft | null = null;
  private _uploadImage: UploadImage | null = null;
  private _getImagesByIds: GetImagesByIds | null = null;
  private _lockDraft: LockDraft | null = null;
  private _createOrder: CreateOrder | null = null;
  private _getAllOrders: GetAllOrders | null = null;
  private _getOrderById: GetOrderById | null = null;
  private _getMyDrafts: GetMyDrafts | null = null;
  private _getMyDraftById: GetMyDraftById | null = null;
  private _getMyOrders: GetMyOrders | null = null;
  private _getMyOrderById: GetMyOrderById | null = null;
  private _getLayoutByTemplateId: GetLayoutByTemplateId | null = null;
  private _getCart: GetCart | null = null;
  private _addCartItem: AddCartItem | null = null;
  private _updateCartItemQuantity: UpdateCartItemQuantity | null = null;
  private _removeCartItem: RemoveCartItem | null = null;
  private _checkoutCart: CheckoutCart | null = null;
  private _getProductById: GetProductById | null = null;
  private _createPaymentPreference: CreatePaymentPreference | null = null;
  private _processPaymentWebhook: ProcessPaymentWebhook | null = null;
  private _verifyPaymentByPaymentId: VerifyPaymentByPaymentId | null = null;
  private _getUserAddresses: GetUserAddresses | null = null;
  private _createUserAddress: CreateUserAddress | null = null;
  private _createOrderActivity: CreateOrderActivity | null = null;
  private _getOrderActivities: GetOrderActivities | null = null;
  private _updateOrderStatus: UpdateOrderStatus | null = null;

  private _draftController: DraftController | null = null;
  private _assetController: AssetController | null = null;
  private _orderController: OrderController | null = null;
  private _healthController: HealthController | null = null;
  private _layoutController: LayoutController | null = null;
  private _userController: UserController | null = null;
  private _meDraftController: MeDraftController | null = null;
  private _meOrderController: MeOrderController | null = null;
  private _cartController: CartController | null = null;
  private _productController: ProductController | null = null;
  private _paymentController: PaymentController | null = null;
  private _webhookController: WebhookController | null = null;
  private _userAddressController: UserAddressController | null = null;

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

  get cartRepository(): PrismaCartRepository {
    if (!this._cartRepository) {
      this._cartRepository = new PrismaCartRepository();
    }
    return this._cartRepository;
  }

  get userAddressRepository(): PrismaUserAddressRepository {
    if (!this._userAddressRepository) {
      this._userAddressRepository = new PrismaUserAddressRepository();
    }
    return this._userAddressRepository;
  }

  get orderActivityRepository(): PrismaOrderActivityRepository {
    if (!this._orderActivityRepository) {
      this._orderActivityRepository = new PrismaOrderActivityRepository();
    }
    return this._orderActivityRepository;
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

  get getMyDrafts(): GetMyDrafts {
    if (!this._getMyDrafts) {
      this._getMyDrafts = new GetMyDrafts({
        draftRepository: this.draftRepository,
      });
    }
    return this._getMyDrafts;
  }

  get getMyDraftById(): GetMyDraftById {
    if (!this._getMyDraftById) {
      this._getMyDraftById = new GetMyDraftById({
        draftRepository: this.draftRepository,
      });
    }
    return this._getMyDraftById;
  }

  get getMyOrders(): GetMyOrders {
    if (!this._getMyOrders) {
      this._getMyOrders = new GetMyOrders({
        orderRepository: this.orderRepository,
      });
    }
    return this._getMyOrders;
  }

  get getMyOrderById(): GetMyOrderById {
    if (!this._getMyOrderById) {
      this._getMyOrderById = new GetMyOrderById({
        orderRepository: this.orderRepository,
      });
    }
    return this._getMyOrderById;
  }

  get getLayoutByTemplateId(): GetLayoutByTemplateId {
    if (!this._getLayoutByTemplateId) {
      this._getLayoutByTemplateId = new GetLayoutByTemplateId({
        productTemplateRepository: this.productTemplateRepository,
      });
    }
    return this._getLayoutByTemplateId;
  }

  get getCart(): GetCart {
    if (!this._getCart) {
      this._getCart = new GetCart({
        cartRepository: this.cartRepository,
        productRepository: this.productRepository,
      });
    }
    return this._getCart;
  }

  get addCartItem(): AddCartItem {
    if (!this._addCartItem) {
      this._addCartItem = new AddCartItem({
        cartRepository: this.cartRepository,
        draftRepository: this.draftRepository,
        productRepository: this.productRepository,
      });
    }
    return this._addCartItem;
  }

  get updateCartItemQuantity(): UpdateCartItemQuantity {
    if (!this._updateCartItemQuantity) {
      this._updateCartItemQuantity = new UpdateCartItemQuantity({
        cartRepository: this.cartRepository,
      });
    }
    return this._updateCartItemQuantity;
  }

  get removeCartItem(): RemoveCartItem {
    if (!this._removeCartItem) {
      this._removeCartItem = new RemoveCartItem({
        cartRepository: this.cartRepository,
      });
    }
    return this._removeCartItem;
  }

  get checkoutCart(): CheckoutCart {
    if (!this._checkoutCart) {
      this._checkoutCart = new CheckoutCart({
        cartRepository: this.cartRepository,
        orderRepository: this.orderRepository,
        draftRepository: this.draftRepository,
        productRepository: this.productRepository,
        productTemplateRepository: this.productTemplateRepository,
        userAddressRepository: this.userAddressRepository,
        userRepository: this.userRepository,
        orderActivityRepository: this.orderActivityRepository,
      });
    }
    return this._checkoutCart;
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
        this.getOrderById,
        this.updateOrderStatus,
        this.getOrderActivities
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
      this._userController = new UserController(this.userRepository);
    }
    return this._userController;
  }

  get meDraftController(): MeDraftController {
    if (!this._meDraftController) {
      this._meDraftController = new MeDraftController(
        this.getMyDrafts,
        this.getMyDraftById
      );
    }
    return this._meDraftController;
  }

  get meOrderController(): MeOrderController {
    if (!this._meOrderController) {
      this._meOrderController = new MeOrderController(
        this.getMyOrders,
        this.getMyOrderById
      );
    }
    return this._meOrderController;
  }

  get cartController(): CartController {
    if (!this._cartController) {
      this._cartController = new CartController(
        this.getCart,
        this.addCartItem,
        this.updateCartItemQuantity,
        this.removeCartItem,
        this.checkoutCart
      );
    }
    return this._cartController;
  }

  get getProductById(): GetProductById {
    if (!this._getProductById) {
      this._getProductById = new GetProductById({
        productRepository: this.productRepository,
      });
    }
    return this._getProductById;
  }

  get productController(): ProductController {
    if (!this._productController) {
      this._productController = new ProductController(
        this.getProductById
      );
    }
    return this._productController;
  }

  get createPaymentPreference(): CreatePaymentPreference {
    if (!this._createPaymentPreference) {
      this._createPaymentPreference = new CreatePaymentPreference({
        orderRepository: this.orderRepository,
      });
    }
    return this._createPaymentPreference;
  }

  get paymentController(): PaymentController {
    if (!this._paymentController) {
      this._paymentController = new PaymentController(
        this.createPaymentPreference,
        this.verifyPaymentByPaymentId
      );
    }
    return this._paymentController;
  }

  get processPaymentWebhook(): ProcessPaymentWebhook {
    if (!this._processPaymentWebhook) {
      this._processPaymentWebhook = new ProcessPaymentWebhook({
        orderRepository: this.orderRepository,
        draftRepository: this.draftRepository,
        cartRepository: this.cartRepository,
        orderActivityRepository: this.orderActivityRepository,
      });
    }
    return this._processPaymentWebhook;
  }

  get verifyPaymentByPaymentId(): VerifyPaymentByPaymentId {
    if (!this._verifyPaymentByPaymentId) {
      this._verifyPaymentByPaymentId = new VerifyPaymentByPaymentId({
        orderRepository: this.orderRepository,
        draftRepository: this.draftRepository,
        cartRepository: this.cartRepository,
        orderActivityRepository: this.orderActivityRepository,
      });
    }
    return this._verifyPaymentByPaymentId;
  }

  get webhookController(): WebhookController {
    if (!this._webhookController) {
      this._webhookController = new WebhookController(
        this.processPaymentWebhook
      );
    }
    return this._webhookController;
  }

  get getUserAddresses(): GetUserAddresses {
    if (!this._getUserAddresses) {
      this._getUserAddresses = new GetUserAddresses({
        userAddressRepository: this.userAddressRepository,
      });
    }
    return this._getUserAddresses;
  }

  get createUserAddress(): CreateUserAddress {
    if (!this._createUserAddress) {
      this._createUserAddress = new CreateUserAddress({
        userAddressRepository: this.userAddressRepository,
      });
    }
    return this._createUserAddress;
  }

  get createOrderActivity(): CreateOrderActivity {
    if (!this._createOrderActivity) {
      this._createOrderActivity = new CreateOrderActivity({
        orderActivityRepository: this.orderActivityRepository,
      });
    }
    return this._createOrderActivity;
  }

  get getOrderActivities(): GetOrderActivities {
    if (!this._getOrderActivities) {
      this._getOrderActivities = new GetOrderActivities({
        orderActivityRepository: this.orderActivityRepository,
      });
    }
    return this._getOrderActivities;
  }

  get updateOrderStatus(): UpdateOrderStatus {
    if (!this._updateOrderStatus) {
      this._updateOrderStatus = new UpdateOrderStatus({
        orderRepository: this.orderRepository,
        orderActivityRepository: this.orderActivityRepository,
      });
    }
    return this._updateOrderStatus;
  }

  get userAddressController(): UserAddressController {
    if (!this._userAddressController) {
      this._userAddressController = new UserAddressController(
        this.getUserAddresses,
        this.createUserAddress
      );
    }
    return this._userAddressController;
  }

  get controllers(): Controllers {
    return {
      draftController: this.draftController,
      assetController: this.assetController,
      orderController: this.orderController,
      healthController: this.healthController,
      layoutController: this.layoutController,
      userController: this.userController,
      meDraftController: this.meDraftController,
      meOrderController: this.meOrderController,
      cartController: this.cartController,
      productController: this.productController,
      paymentController: this.paymentController,
      webhookController: this.webhookController,
      userAddressController: this.userAddressController,
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
      cartRepository: this.cartRepository,
      userAddressRepository: this.userAddressRepository,
    };
  }
}

export const container = new Container();
