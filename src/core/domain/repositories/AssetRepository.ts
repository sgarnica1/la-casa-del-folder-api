import { Asset } from "../entities/Asset";

export interface AssetRepository {
  create(asset: Omit<Asset, "createdAt">): Promise<Asset>;
  findByDraftId(draftId: string): Promise<Asset[]>;
}
