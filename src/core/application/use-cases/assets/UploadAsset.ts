import { AssetRepository } from "../../../domain/repositories/AssetRepository";
import { Asset } from "../../../domain/entities/Asset";

export interface UploadAssetDependencies {
  assetRepository: AssetRepository;
}

export interface UploadAssetInput {
  draftId: string;
  url: string;
}

export class UploadAsset {
  constructor() { }

  async execute(_input: UploadAssetInput): Promise<Asset> {
    throw new Error("Not implemented");
  }
}
