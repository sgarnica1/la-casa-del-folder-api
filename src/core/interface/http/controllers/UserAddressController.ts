import { Response, NextFunction } from "express";
import { GetUserAddresses } from "../../../application/use-cases/user-addresses/GetUserAddresses";
import { CreateUserAddress } from "../../../application/use-cases/user-addresses/CreateUserAddress";
import { ValidationError } from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "../middleware/authMiddleware";

export class UserAddressController {
  constructor(
    private getUserAddresses: GetUserAddresses,
    private createUserAddress: CreateUserAddress
  ) { }

  async getAddresses(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    try {
      const addresses = await this.getUserAddresses.execute(req.userAuth.userId);
      res.status(200).json(addresses);
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get addresses" } });
    }
  }

  async createAddress(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    try {
      const {
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault,
      } = req.body as {
        addressLine1?: string;
        addressLine2?: string | null;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        isDefault?: boolean;
      };

      const address = await this.createUserAddress.execute({
        userId: req.userAuth.userId,
        addressLine1: addressLine1 || "",
        addressLine2: addressLine2 || null,
        city: city || "",
        state: state || "",
        postalCode: postalCode || "",
        country: country || "",
        isDefault: isDefault || false,
      });

      res.status(201).json(address);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message } });
        return;
      }

      console.error("Create address error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to create address" } });
    }
  }
}
