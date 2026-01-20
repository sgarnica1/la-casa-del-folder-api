import { Request, Response } from "express";

export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  }
}
