import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateOrderActivity } from "../../core/application/use-cases/orders/CreateOrderActivity";
import { OrderActivityRepository } from "../../core/domain/repositories/OrderActivityRepository";
import { OrderActivityType } from "../../core/domain/entities/OrderActivity";
import { ValidationError } from "../../core/domain/errors/DomainErrors";

describe("CreateOrderActivity", () => {
  let createOrderActivity: CreateOrderActivity;
  let mockOrderActivityRepository: OrderActivityRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOrderActivityRepository = {
      create: vi.fn(),
      findByOrderId: vi.fn(),
    } as unknown as OrderActivityRepository;

    createOrderActivity = new CreateOrderActivity({
      orderActivityRepository: mockOrderActivityRepository,
    });
  });

  it("should create order activity successfully", async () => {
    const orderId = "123e4567-e89b-12d3-a456-426614174000";
    const activityId = "123e4567-e89b-12d3-a456-426614174001";
    const createdAt = new Date();

    const mockActivity = {
      id: activityId,
      orderId,
      activityType: OrderActivityType.ORDER_PLACED,
      description: "Pedido realizado",
      metadata: { totalAmount: "500.00", itemsCount: 1 },
      createdAt,
    };

    vi.mocked(mockOrderActivityRepository.create).mockResolvedValue(mockActivity);

    const result = await createOrderActivity.execute({
      orderId,
      activityType: OrderActivityType.ORDER_PLACED,
      description: "Pedido realizado",
      metadata: { totalAmount: "500.00", itemsCount: 1 },
    });

    expect(mockOrderActivityRepository.create).toHaveBeenCalledWith({
      orderId,
      activityType: OrderActivityType.ORDER_PLACED,
      description: "Pedido realizado",
      metadata: { totalAmount: "500.00", itemsCount: 1 },
    });

    expect(result.activity).toEqual(mockActivity);
  });

  it("should create order activity with null description and metadata", async () => {
    const orderId = "123e4567-e89b-12d3-a456-426614174000";
    const activityId = "123e4567-e89b-12d3-a456-426614174001";
    const createdAt = new Date();

    const mockActivity = {
      id: activityId,
      orderId,
      activityType: OrderActivityType.STATUS_CHANGED,
      description: null,
      metadata: null,
      createdAt,
    };

    vi.mocked(mockOrderActivityRepository.create).mockResolvedValue(mockActivity);

    const result = await createOrderActivity.execute({
      orderId,
      activityType: OrderActivityType.STATUS_CHANGED,
    });

    expect(mockOrderActivityRepository.create).toHaveBeenCalledWith({
      orderId,
      activityType: OrderActivityType.STATUS_CHANGED,
      description: null,
      metadata: null,
    });

    expect(result.activity).toEqual(mockActivity);
  });

  it("should throw ValidationError when orderId is missing", async () => {
    await expect(
      createOrderActivity.execute({
        orderId: "",
        activityType: OrderActivityType.ORDER_PLACED,
      })
    ).rejects.toThrow(ValidationError);

    expect(mockOrderActivityRepository.create).not.toHaveBeenCalled();
  });

  it("should throw ValidationError when activityType is missing", async () => {
    await expect(
      createOrderActivity.execute({
        orderId: "123e4567-e89b-12d3-a456-426614174000",
        activityType: undefined as unknown as OrderActivityType,
      })
    ).rejects.toThrow(ValidationError);

    expect(mockOrderActivityRepository.create).not.toHaveBeenCalled();
  });
});
