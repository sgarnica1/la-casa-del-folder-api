import { Request, Response } from "express";
import { CreateDraft } from "../../../application/use-cases/CreateDraft";
import { LockDraft } from "../../../application/use-cases/LockDraft";

export class DraftController {
  constructor(
    private createDraft: CreateDraft,
    private lockDraft: LockDraft
  ) { }

  async create(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async lock(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
