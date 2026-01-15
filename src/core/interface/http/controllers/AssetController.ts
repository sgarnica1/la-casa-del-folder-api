import { Request, Response, NextFunction } from "express";
import { UploadAsset } from "../../../application/use-cases/assets/UploadAsset";

export class AssetController {
  constructor(private uploadAsset: UploadAsset) { }

  async upload(req: Request, res: Response, _next: NextFunction): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
