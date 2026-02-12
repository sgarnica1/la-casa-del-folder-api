export enum OrderActivityType {
  ORDER_PLACED = "ORDER_PLACED",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  ORDER_READY = "ORDER_READY",
  ORDER_SHIPPED = "ORDER_SHIPPED",
  ORDER_DELIVERED = "ORDER_DELIVERED",
  STATUS_CHANGED = "STATUS_CHANGED",
}

export interface OrderActivity {
  id: string;
  orderId: string;
  activityType: OrderActivityType;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
