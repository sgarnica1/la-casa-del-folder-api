import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { CartRepository } from "../../../domain/repositories/CartRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";
import { Payment } from "mercadopago";
import { MercadoPagoConfig } from "mercadopago";
import { config } from "../../../../config";

export interface VerifyPaymentByPaymentIdDependencies {
  orderRepository: OrderRepository;
  draftRepository: DraftRepository;
  cartRepository: CartRepository;
}

export class VerifyPaymentByPaymentId {
  private paymentClient: Payment;

  constructor(private deps: VerifyPaymentByPaymentIdDependencies) {
    const client = new MercadoPagoConfig({
      accessToken: config.mercadoPago.accessToken,
    });
    this.paymentClient = new Payment(client);
  }

  async execute(paymentId: string): Promise<{ orderId: string; paymentStatus: "pending" | "paid" | "failed" }> {
    if (!paymentId) {
      throw new ValidationError("Payment ID is required");
    }

    let payment;
    try {
      payment = await this.paymentClient.get({ id: paymentId });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        throw new NotFoundError("Payment", paymentId);
      }
      throw error;
    }

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
        return { orderId, paymentStatus: order.paymentStatus as "pending" | "paid" | "failed" };
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

        await this.deps.cartRepository.clearCartByOrderId(orderId);
        console.log(`Cart cleared for order ${orderId}`);
      }
    }

    return { orderId, paymentStatus };
  }
}
