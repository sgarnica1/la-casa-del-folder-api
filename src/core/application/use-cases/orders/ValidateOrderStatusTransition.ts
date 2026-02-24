
export type OrderStatus = "new" | "in_production" | "ready" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface OrderState {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}

export interface StatusTransition {
  targetStatus: OrderStatus;
  requiresNote: boolean;
  requiresPaymentStatus?: PaymentStatus;
  label: string;
}

// Transition rules based on orderStatus
const TRANSITION_RULES: Record<OrderStatus, OrderStatus[]> = {
  in_production: ["cancelled", "ready"],
  ready: ["cancelled", "shipped"],
  shipped: ["cancelled", "delivered"],
  delivered: [], // terminal
  cancelled: ["new", "refunded"],
  refunded: [], // terminal
  // 'new' is handled specially based on paymentStatus
  new: [], // handled separately
};

// States that require a note when transitioning TO them
const REQUIRES_NOTE: OrderStatus[] = ["cancelled", "refunded"];

// Status labels for UI
const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Nuevo",
  in_production: "En Producción",
  ready: "Listo",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export class ValidateOrderStatusTransition {
  /**
   * Check if a transition from current state to target state is allowed
   */
  static isValidTransition(
    currentState: OrderState,
    targetStatus: OrderStatus,
    note?: string | null
  ): { valid: boolean; error?: string } {
    // Check if target status requires a note
    if (REQUIRES_NOTE.includes(targetStatus) && (!note || note.trim().length === 0)) {
      return {
        valid: false,
        error: `Se requiere una nota para cambiar el estado a ${STATUS_LABELS[targetStatus]}`,
      };
    }

    // Handle special case for 'new' status
    if (currentState.orderStatus === "new") {
      if (currentState.paymentStatus === "pending") {
        // ordered (new + pending) → paid (new + paid) OR cancelled
        if (targetStatus === "new" && currentState.paymentStatus === "pending") {
          // This is the ordered → paid transition (stays 'new' but paymentStatus changes to 'paid')
          return { valid: true };
        }
        if (targetStatus === "cancelled") {
          return { valid: true };
        }
        return {
          valid: false,
          error: `No se puede cambiar de "${STATUS_LABELS[currentState.orderStatus]}" (pendiente de pago) a "${STATUS_LABELS[targetStatus]}"`,
        };
      } else if (currentState.paymentStatus === "paid") {
        // paid (new + paid) → cancelled OR in_production
        if (targetStatus === "cancelled") {
          return { valid: true };
        }
        if (targetStatus === "in_production") {
          return { valid: true };
        }
        return {
          valid: false,
          error: `No se puede cambiar de "${STATUS_LABELS[currentState.orderStatus]}" (pagado) a "${STATUS_LABELS[targetStatus]}"`,
        };
      }
    }

    // Handle cancelled → new (paid) transition
    if (currentState.orderStatus === "cancelled" && targetStatus === "new") {
      if (currentState.paymentStatus !== "paid") {
        return {
          valid: false,
          error: "Solo se puede reactivar un pedido cancelado si el pago está confirmado",
        };
      }
      return { valid: true };
    }

    // Check standard transition rules
    const allowedTransitions = TRANSITION_RULES[currentState.orderStatus];
    if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
      return {
        valid: false,
        error: `No se puede cambiar de "${STATUS_LABELS[currentState.orderStatus]}" a "${STATUS_LABELS[targetStatus]}"`,
      };
    }

    return { valid: true };
  }

  /**
   * Get all available transitions for the current order state
   */
  static getAvailableTransitions(currentState: OrderState): StatusTransition[] {
    const transitions: StatusTransition[] = [];

    // Handle special case for 'new' status
    if (currentState.orderStatus === "new") {
      if (currentState.paymentStatus === "pending") {
        // ordered (new + pending) → paid (new + paid) OR cancelled
        transitions.push({
          targetStatus: "new",
          requiresNote: false,
          requiresPaymentStatus: "paid",
          label: "Marcar como Pagado",
        });
        transitions.push({
          targetStatus: "cancelled",
          requiresNote: true,
          label: "Cancelar",
        });
      } else if (currentState.paymentStatus === "paid") {
        // paid (new + paid) → cancelled OR in_production
        transitions.push({
          targetStatus: "cancelled",
          requiresNote: true,
          label: "Cancelar",
        });
        transitions.push({
          targetStatus: "in_production",
          requiresNote: false,
          label: "Enviar a Producción",
        });
      }
      return transitions;
    }

    // Handle cancelled → new (paid) transition
    if (currentState.orderStatus === "cancelled") {
      if (currentState.paymentStatus === "paid") {
        transitions.push({
          targetStatus: "new",
          requiresNote: false,
          label: "Reactivar (Pagado)",
        });
      }
      transitions.push({
        targetStatus: "refunded",
        requiresNote: true,
        label: "Reembolsar",
      });
      return transitions;
    }

    // Handle standard transitions
    const allowedTransitions = TRANSITION_RULES[currentState.orderStatus] || [];
    for (const targetStatus of allowedTransitions) {
      transitions.push({
        targetStatus,
        requiresNote: REQUIRES_NOTE.includes(targetStatus),
        label: STATUS_LABELS[targetStatus],
      });
    }

    return transitions;
  }

  /**
   * Get status label
   */
  static getStatusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status];
  }
}
