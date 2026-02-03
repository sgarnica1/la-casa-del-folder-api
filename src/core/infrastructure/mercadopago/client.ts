import { MercadoPagoConfig, Preference } from "mercadopago";
import { config } from "../../../config";

const client = new MercadoPagoConfig({
  accessToken: config.mercadoPago.accessToken,
});

export const preferenceClient = new Preference(client);
