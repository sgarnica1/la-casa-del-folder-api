import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { GetAllOrdersPaginatedOutput, GetAllOrdersInputSchema } from "./dtos/GetAllOrders.dto";
import { ValidationError } from "../../../domain/errors/DomainErrors";

export interface GetAllOrdersDependencies {
  orderRepository: OrderRepository;
}

export class GetAllOrders {
  constructor(private deps: GetAllOrdersDependencies) { }

  async execute(input: unknown): Promise<GetAllOrdersPaginatedOutput> {
    const validationResult = GetAllOrdersInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid pagination parameters", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;
    const result = await this.deps.orderRepository.findPaginated({
      page: validatedInput.page,
      limit: validatedInput.limit,
    });

    return {
      data: result.data.map((order) => ({
        id: order.id,
        userId: order.userId,
        totalAmount: order.totalAmount.toString(),
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
