import { Request, Response } from "express";
import { UploadAsset } from "../../../application/use-cases/UploadAsset";

export class AssetController {
  constructor(private uploadAsset: UploadAsset) { }

  async upload(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
