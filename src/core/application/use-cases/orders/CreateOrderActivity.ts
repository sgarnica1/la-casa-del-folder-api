import { OrderActivityRepository } from "../../../domain/repositories/OrderActivityRepository";
import { OrderActivity, OrderActivityType } from "../../../domain/entities/OrderActivity";
import { ValidationError } from "../../../domain/errors/DomainErrors";

export interface CreateOrderActivityDependencies {
  orderActivityRepository: OrderActivityRepository;
}

export interface CreateOrderActivityInput {
  orderId: string;
  activityType: OrderActivityType;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface CreateOrderActivityOutput {
  activity: OrderActivity;
}

export class CreateOrderActivity {
  constructor(private deps: CreateOrderActivityDependencies) {}

  async execute(input: CreateOrderActivityInput): Promise<CreateOrderActivityOutput> {
    if (!input.orderId) {
      throw new ValidationError("Order ID is required");
    }

    if (!input.activityType) {
      throw new ValidationError("Activity type is required");
    }

    const activity = await this.deps.orderActivityRepository.create({
      orderId: input.orderId,
      activityType: input.activityType,
      description: input.description ?? null,
      metadata: input.metadata ?? null,
    });

    return { activity };
  }
}
