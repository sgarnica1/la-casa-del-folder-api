import { AssetRepository } from "../../core/domain/repositories/AssetRepository";
import { Asset } from "../../core/domain/entities/Asset";
import { prisma } from "../prisma/client";

export class PrismaAssetRepository implements AssetRepository {
  async create(asset: Omit<Asset, "createdAt">): Promise<Asset> {
    throw new Error("Not implemented");
  }

  async findByDraftId(draftId: string): Promise<Asset[]> {
    throw new Error("Not implemented");
  }
}
