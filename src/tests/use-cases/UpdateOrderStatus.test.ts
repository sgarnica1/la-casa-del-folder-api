import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdateOrderStatus } from "../../core/application/use-cases/orders/UpdateOrderStatus";
import { OrderRepository } from "../../core/domain/repositories/OrderRepository";
import { OrderActivityRepository } from "../../core/domain/repositories/OrderActivityRepository";
import { OrderActivityType } from "../../core/domain/entities/OrderActivity";
import { ValidationError, NotFoundError } from "../../core/domain/errors/DomainErrors";

describe("UpdateOrderStatus", () => {
  let updateOrderStatus: UpdateOrderStatus;
  let mockOrderRepository: OrderRepository;
  let mockOrderActivityRepository: OrderActivityRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOrderRepository = {
      findById: vi.fn(),
      updateOrderStatus: vi.fn().mockResolvedValue(undefined),
      updateOrderStatusAndPaymentStatus: vi.fn().mockResolvedValue(undefined),
    } as unknown as OrderRepository;

    mockOrderActivityRepository = {
      create: vi.fn(),
      findByOrderId: vi.fn(),
    } as unknown as OrderActivityRepository;

    updateOrderStatus = new UpdateOrderStatus({
      orderRepository: mockOrderRepository,
      orderActivityRepository: mockOrderActivityRepository,
    });
  });

  it("should update order status to in_production and create activity", async () => {
    const orderId = "123e4567-e89b-12d3-a456-426614174000";
    const activityId = "123e4567-e89b-12d3-a456-426614174001";
    const createdAt = new Date();

    const mockOrder = {
      id: orderId,
      userId: "123e4567-e89b-12d3-a456-426614174010",
      totalAmount: 500,
      paymentStatus: "paid" as const,
      orderStatus: "new" as const,
      shippingAddressJson: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: {
        id: "123e4567-e89b-12d3-a456-426614174010",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      },
      address: null,
      items: [],
    };

    const mockActivity = {
      id: activityId,
      orderId,
      activityType: OrderActivityType.ORDER_IN_PRODUCTION,
      description: "Estado del pedido cambiado a: En Producción",
      metadata: { previousStatus: "new", newStatus: "in_production", previousPaymentStatus: "paid", newPaymentStatus: "paid" },
      createdAt,
    };

    vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder);
    vi.mocked(mockOrderActivityRepository.create).mockResolvedValue(mockActivity);

    const result = await updateOrderStatus.execute({
      orderId,
      orderStatus: "in_production",
    });

    expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    expect(mockOrderRepository.updateOrderStatus).toHaveBeenCalledWith(orderId, "in_production");
    expect(mockOrderActivityRepository.create).toHaveBeenCalledWith({
      orderId,
      activityType: OrderActivityType.ORDER_IN_PRODUCTION,
      description: "Estado del pedido cambiado a: En Producción",
      metadata: {
        previousStatus: "new",
        newStatus: "in_production",
        previousPaymentStatus: "paid",
        newPaymentStatus: "paid",
      },
    });

    expect(result.orderId).toBe(orderId);
    expect(result.orderStatus).toBe("in_production");
  });

  it("should update order status to ready and create activity", async () => {
    const orderId = "123e4567-e89b-12d3-a456-426614174000";
    const activityId = "123e4567-e89b-12d3-a456-426614174001";
    const createdAt = new Date();

    const mockOrder = {
      id: orderId,
      userId: "123e4567-e89b-12d3-a456-426614174010",
      totalAmount: 500,
      paymentStatus: "paid" as const,
      orderStatus: "in_production" as const,
      shippingAddressJson: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: {
        id: "123e4567-e89b-12d3-a456-426614174010",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      },
      address: null,
      items: [],
    };

    const mockActivity = {
      id: activityId,
      orderId,
      activityType: OrderActivityType.ORDER_READY,
      description: "Estado del pedido cambiado a: Listo",
      metadata: { previousStatus: "in_production", newStatus: "ready", previousPaymentStatus: "paid", newPaymentStatus: "paid" },
      createdAt,
    };

    vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder);
    vi.mocked(mockOrderActivityRepository.create).mockResolvedValue(mockActivity);

    const result = await updateOrderStatus.execute({
      orderId,
      orderStatus: "ready",
    });

    expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    expect(mockOrderRepository.updateOrderStatus).toHaveBeenCalledWith(orderId, "ready");
    expect(mockOrderActivityRepository.create).toHaveBeenCalledWith({
      orderId,
      activityType: OrderActivityType.ORDER_READY,
      description: "Estado del pedido cambiado a: Listo",
      metadata: {
        previousStatus: "in_production",
        newStatus: "ready",
        previousPaymentStatus: "paid",
        newPaymentStatus: "paid",
      },
    });

    expect(result.orderId).toBe(orderId);
    expect(result.orderStatus).toBe("ready");
  });

  it("should throw ValidationError when orderId is missing", async () => {
    await expect(
      updateOrderStatus.execute({
        orderId: "",
        orderStatus: "in_production",
      })
    ).rejects.toThrow(ValidationError);

    expect(mockOrderRepository.findById).not.toHaveBeenCalled();
    expect(mockOrderRepository.updateOrderStatus).not.toHaveBeenCalled();
    expect(mockOrderActivityRepository.create).not.toHaveBeenCalled();
  });

  it("should throw ValidationError when orderStatus is missing", async () => {
    await expect(
      updateOrderStatus.execute({
        orderId: "123e4567-e89b-12d3-a456-426614174000",
        orderStatus: undefined as unknown as "in_production",
      })
    ).rejects.toThrow(ValidationError);

    expect(mockOrderRepository.findById).not.toHaveBeenCalled();
    expect(mockOrderRepository.updateOrderStatus).not.toHaveBeenCalled();
    expect(mockOrderActivityRepository.create).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when order does not exist", async () => {
    const orderId = "123e4567-e89b-12d3-a456-426614174000";

    vi.mocked(mockOrderRepository.findById).mockResolvedValue(null);

    await expect(
      updateOrderStatus.execute({
        orderId,
        orderStatus: "in_production",
      })
    ).rejects.toThrow(NotFoundError);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    expect(mockOrderRepository.updateOrderStatus).not.toHaveBeenCalled();
    expect(mockOrderActivityRepository.create).not.toHaveBeenCalled();
  });

  it("should use STATUS_CHANGED activity type when reactivating a cancelled order", async () => {
    const orderId = "123e4567-e89b-12d3-a456-426614174000";
    const activityId = "123e4567-e89b-12d3-a456-426614174001";
    const createdAt = new Date();

    const mockOrder = {
      id: orderId,
      userId: "123e4567-e89b-12d3-a456-426614174010",
      totalAmount: 500,
      paymentStatus: "paid" as const,
      orderStatus: "cancelled" as const,
      shippingAddressJson: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: {
        id: "123e4567-e89b-12d3-a456-426614174010",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      },
      address: null,
      items: [],
    };

    const mockActivity = {
      id: activityId,
      orderId,
      activityType: OrderActivityType.STATUS_CHANGED,
      description: "Estado del pedido cambiado a: Nuevo",
      metadata: { previousStatus: "cancelled", newStatus: "new", previousPaymentStatus: "paid", newPaymentStatus: "paid" },
      createdAt,
    };

    vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder);
    vi.mocked(mockOrderActivityRepository.create).mockResolvedValue(mockActivity);

    const result = await updateOrderStatus.execute({
      orderId,
      orderStatus: "new",
    });

    expect(mockOrderActivityRepository.create).toHaveBeenCalledWith({
      orderId,
      activityType: OrderActivityType.STATUS_CHANGED,
      description: "Estado del pedido cambiado a: Nuevo",
      metadata: {
        previousStatus: "cancelled",
        newStatus: "new",
        previousPaymentStatus: "paid",
        newPaymentStatus: "paid",
      },
    });

    expect(result.orderStatus).toBe("new");
  });
});
