import crypto from "crypto";
import { config } from "../../../config";

export interface WebhookSignature {
  ts: string;
  v1: string;
}

export function parseSignature(xSignature: string): WebhookSignature | null {
  const parts = xSignature.split(",");
  let ts: string | null = null;
  let v1: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) {
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      if (trimmedKey === "ts") {
        ts = trimmedValue;
      } else if (trimmedKey === "v1") {
        v1 = trimmedValue;
      }
    }
  }

  if (!ts || !v1) {
    return null;
  }

  return { ts, v1 };
}

export function validateWebhookSignature(
  dataId: string,
  requestId: string,
  ts: string,
  receivedHash: string
): boolean {
  const secret = config.mercadoPago.webhookSecret;

  if (!secret) {
    console.warn("MERCADO_PAGO_WEBHOOK_SECRET not configured");
    return false;
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(manifest);
  const calculatedHash = hmac.digest("hex");

  return calculatedHash === receivedHash;
}
