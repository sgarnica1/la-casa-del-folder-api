import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";
import { Payment } from "mercadopago";
import { MercadoPagoConfig } from "mercadopago";
import { config } from "../../../../config";

export interface ProcessPaymentWebhookDependencies {
  orderRepository: OrderRepository;
  draftRepository: DraftRepository;
}

export interface PaymentWebhookNotification {
  id: string;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

export class ProcessPaymentWebhook {
  private paymentClient: Payment;

  constructor(private deps: ProcessPaymentWebhookDependencies) {
    const client = new MercadoPagoConfig({
      accessToken: config.mercadoPago.accessToken,
    });
    this.paymentClient = new Payment(client);
  }

  async execute(notification: PaymentWebhookNotification): Promise<void> {
    if (notification.type !== "payment") {
      throw new ValidationError(`Unsupported notification type: ${notification.type}`);
    }

    const paymentId = notification.data.id;
    if (!paymentId) {
      throw new ValidationError("Payment ID is missing from notification");
    }

    const payment = await this.paymentClient.get({ id: paymentId });

    if (!payment.external_reference) {
      throw new ValidationError("External reference (order ID) is missing from payment");
    }

    const orderId = payment.external_reference;
    const order = await this.deps.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    let paymentStatus: "pending" | "paid" | "failed";

    switch (payment.status) {
      case "approved":
        paymentStatus = "paid";
        break;
      case "rejected":
      case "cancelled":
      case "refunded":
      case "charged_back":
        paymentStatus = "failed";
        break;
      case "pending":
      case "in_process":
      case "in_mediation":
        paymentStatus = "pending";
        break;
      default:
        console.warn(`Unknown payment status: ${payment.status}, keeping current order status`);
        return;
    }

    if (order.paymentStatus !== paymentStatus) {
      await this.deps.orderRepository.updatePaymentStatus(orderId, paymentStatus);
      console.log(`Order ${orderId} payment status updated to ${paymentStatus}`);

      if (paymentStatus === "paid") {
        const draftIds = await this.deps.orderRepository.getDraftIdsFromOrder(orderId);
        console.log(`Marking ${draftIds.length} drafts as ordered for order ${orderId}`);
        for (const draftId of draftIds) {
          await this.deps.draftRepository.markAsOrdered(draftId);
        }
        console.log(`All drafts marked as ordered for order ${orderId}`);
      }
    }
  }
}
