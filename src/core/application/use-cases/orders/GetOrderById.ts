import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";
import { GetOrderByIdInputSchema, GetOrderByIdOutput } from "./dtos/GetOrderById.dto";

export interface GetOrderByIdDependencies {
  orderRepository: OrderRepository;
}

export class GetOrderById {
  constructor(private deps: GetOrderByIdDependencies) { }

  async execute(input: unknown): Promise<GetOrderByIdOutput> {
    const validationResult = GetOrderByIdInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;
    const order = await this.deps.orderRepository.findById(validatedInput.orderId);

    if (!order) {
      throw new NotFoundError("Order", validatedInput.orderId);
    }

    return {
      id: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount.toString(),
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      shippingAddressJson: order.shippingAddressJson,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        productNameSnapshot: item.productNameSnapshot,
        variantNameSnapshot: item.variantNameSnapshot,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot.toString(),
        designSnapshotJson: item.designSnapshotJson,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }
}
