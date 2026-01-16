import { AssetRepository } from "../../domain/repositories/AssetRepository";
import { Asset } from "../../domain/entities/Asset";

export class PrismaAssetRepository implements AssetRepository {
  async create(_asset: Omit<Asset, "createdAt">): Promise<Asset> {
    throw new Error("Not implemented");
  }

  async findByDraftId(_draftId: string): Promise<Asset[]> {
    throw new Error("Not implemented");
  }
}
