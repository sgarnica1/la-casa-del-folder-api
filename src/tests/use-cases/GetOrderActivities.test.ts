import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetOrderActivities } from "../../core/application/use-cases/orders/GetOrderActivities";
import { OrderActivityRepository } from "../../core/domain/repositories/OrderActivityRepository";
import { OrderActivityType } from "../../core/domain/entities/OrderActivity";
import { ValidationError } from "../../core/domain/errors/DomainErrors";

describe("GetOrderActivities", () => {
  let getOrderActivities: GetOrderActivities;
  let mockOrderActivityRepository: OrderActivityRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOrderActivityRepository = {
      create: vi.fn(),
      findByOrderId: vi.fn(),
    } as unknown as OrderActivityRepository;

    getOrderActivities = new GetOrderActivities({
      orderActivityRepository: mockOrderActivityRepository,
    });
  });

  it("should get order activities successfully", async () => {
    const orderId = "123e4567-e89b-12d3-a456-426614174000";
    const createdAt1 = new Date("2026-02-11T19:46:00Z");
    const createdAt2 = new Date("2026-02-11T19:54:00Z");

    const mockActivities = [
      {
        id: "123e4567-e89b-12d3-a456-426614174001",
        orderId,
        activityType: OrderActivityType.ORDER_PLACED,
        description: "Pedido realizado",
        metadata: { totalAmount: "500.00", itemsCount: 1 },
        createdAt: createdAt1,
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174002",
        orderId,
        activityType: OrderActivityType.ORDER_READY,
        description: "Estado del pedido cambiado a: En Producción",
        metadata: { previousStatus: "new", newStatus: "in_production" },
        createdAt: createdAt2,
      },
    ];

    vi.mocked(mockOrderActivityRepository.findByOrderId).mockResolvedValue(mockActivities);

    const result = await getOrderActivities.execute({ orderId });

    expect(mockOrderActivityRepository.findByOrderId).toHaveBeenCalledWith(orderId);
    expect(result.activities).toEqual(mockActivities);
    expect(result.activities).toHaveLength(2);
  });

  it("should return empty array when no activities exist", async () => {
    const orderId = "123e4567-e89b-12d3-a456-426614174000";

    vi.mocked(mockOrderActivityRepository.findByOrderId).mockResolvedValue([]);

    const result = await getOrderActivities.execute({ orderId });

    expect(mockOrderActivityRepository.findByOrderId).toHaveBeenCalledWith(orderId);
    expect(result.activities).toEqual([]);
    expect(result.activities).toHaveLength(0);
  });

  it("should throw ValidationError when orderId is missing", async () => {
    await expect(
      getOrderActivities.execute({
        orderId: "",
      })
    ).rejects.toThrow(ValidationError);

    expect(mockOrderActivityRepository.findByOrderId).not.toHaveBeenCalled();
  });
});
