import { OrderActivityRepository } from "../../../domain/repositories/OrderActivityRepository";
import { OrderActivity } from "../../../domain/entities/OrderActivity";
import { ValidationError } from "../../../domain/errors/DomainErrors";

export interface GetOrderActivitiesDependencies {
  orderActivityRepository: OrderActivityRepository;
}

export interface GetOrderActivitiesInput {
  orderId: string;
}

export interface GetOrderActivitiesOutput {
  activities: OrderActivity[];
}

export class GetOrderActivities {
  constructor(private deps: GetOrderActivitiesDependencies) {}

  async execute(input: GetOrderActivitiesInput): Promise<GetOrderActivitiesOutput> {
    if (!input.orderId) {
      throw new ValidationError("Order ID is required");
    }

    const activities = await this.deps.orderActivityRepository.findByOrderId(input.orderId);

    return { activities };
  }
}
