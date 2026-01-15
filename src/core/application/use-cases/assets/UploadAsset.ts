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
  constructor(private deps: UploadAssetDependencies) { }

  async execute(input: UploadAssetInput): Promise<Asset> {
    throw new Error("Not implemented");
  }
}
