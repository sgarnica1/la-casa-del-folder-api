import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { NotFoundError, ValidationError, ForbiddenError } from "../../../domain/errors/DomainErrors";
import { preferenceClient } from "../../../infrastructure/mercadopago/client";

export interface CreatePaymentPreferenceDependencies {
  orderRepository: OrderRepository;
}

export interface CreatePaymentPreferenceInput {
  orderId: string;
  userId: string;
}

export interface CreatePaymentPreferenceOutput {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

export class CreatePaymentPreference {
  constructor(private deps: CreatePaymentPreferenceDependencies) { }

  async execute(input: CreatePaymentPreferenceInput): Promise<CreatePaymentPreferenceOutput> {
    if (!input.orderId) {
      throw new ValidationError("Order ID is required");
    }

    const order = await this.deps.orderRepository.findOrderByIdAndUser(input.orderId, input.userId);

    if (!order) {
      throw new NotFoundError("Order", input.orderId);
    }

    if (order.userId !== input.userId) {
      throw new ForbiddenError("Order does not belong to user");
    }

    if (order.paymentStatus === "paid") {
      throw new ValidationError("Order is already paid");
    }

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl || !frontendUrl.startsWith("http")) {
      throw new ValidationError("FRONTEND_URL must be a valid absolute URL");
    }

    const items = order.items.map((item) => ({
      id: item.id,
      title: item.productNameSnapshot,
      description: item.variantNameSnapshot || item.productNameSnapshot,
      quantity: item.quantity,
      unit_price: Number(item.priceSnapshot),
    }));

    const backUrls = {
      success: `${frontendUrl}/payment/success?external_reference=${order.id}`,
      failure: `${frontendUrl}/payment/failure?external_reference=${order.id}`,
      pending: `${frontendUrl}/payment/pending?external_reference=${order.id}`,
    };


    const backUrlsObj = {
      success: backUrls.success,
      failure: backUrls.failure,
      pending: backUrls.pending,
    };

    const preferenceBody: {
      items: typeof items;
      external_reference: string;
      back_urls: typeof backUrlsObj;
      notification_url?: string;
      payer?: {
        email?: string;
      };
      statement_descriptor?: string;
    } = {
      items,
      external_reference: order.id,
      back_urls: backUrlsObj,
      statement_descriptor: "La Casa Del Folder",
    };

    if (process.env.MERCADO_PAGO_WEBHOOK_URL) {
      const webhookUrl = process.env.MERCADO_PAGO_WEBHOOK_URL.trim();
      if (webhookUrl.endsWith('/api/payments/webhook')) {
        preferenceBody.notification_url = webhookUrl;
      } else {
        preferenceBody.notification_url = `${webhookUrl.replace(/\/api\/payments\/webhook\/?$/, '')}/api/payments/webhook`;
      }
    }


    const preferenceRequest = {
      body: preferenceBody,
    };

    try {
      const preference = await preferenceClient.create(preferenceRequest);
      const preferenceData = preference as {
        id: string;
        init_point?: string;
        sandbox_init_point?: string;
        collector_id?: number;
        site_id?: string;
        operation_type?: string;
      };


      if (!preferenceData.id || !preferenceData.init_point) {
        throw new Error("Failed to create payment preference");
      }

      const sandboxInitPoint = preferenceData.sandbox_init_point || preferenceData.init_point;

      return {
        preferenceId: preferenceData.id,
        initPoint: preferenceData.init_point,
        sandboxInitPoint,
      };
    } catch (error: unknown) {
      console.error("[CreatePaymentPreference] Error creating preference:", error);
      if (error && typeof error === 'object' && 'message' in error) {
        console.error("[CreatePaymentPreference] Error details:", {
          message: error.message,
          ...(error as Record<string, unknown>),
        });
      }
      throw error;
    }
  }
}
