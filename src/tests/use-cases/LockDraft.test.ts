import { describe, it, expect, beforeEach, vi } from "vitest";
import { LockDraft } from "../../core/application/use-cases/drafts/LockDraft";
import { DraftRepository } from "../../core/domain/repositories/DraftRepository";
import { Draft, DraftStateEnum } from "../../core/domain/entities/Draft";
import { NotFoundError, ConflictError } from "../../core/domain/errors/DomainErrors";

describe("LockDraft", () => {
  let lockDraft: LockDraft;
  let mockDraftRepository: DraftRepository;

  beforeEach(() => {
    mockDraftRepository = {
      create: vi.fn(),
      createWithLayoutItems: vi.fn(),
      findById: vi.fn(),
      findByIdWithLayoutItems: vi.fn(),
      update: vi.fn(),
    } as unknown as DraftRepository;

    lockDraft = new LockDraft({
      draftRepository: mockDraftRepository,
    });
  });

  it("should lock an editing draft successfully", async () => {
    const draftId = "123e4567-e89b-12d3-a456-426614174000";
    const now = new Date();

    const mockDraft: Draft = {
      id: draftId,
      userId: "123e4567-e89b-12d3-a456-426614174001",
      productId: "123e4567-e89b-12d3-a456-426614174002",
      templateId: "123e4567-e89b-12d3-a456-426614174003",
      state: DraftStateEnum.EDITING,
      createdAt: now,
      updatedAt: now,
    };

    const mockLockedDraft: Draft = {
      ...mockDraft,
      state: DraftStateEnum.LOCKED,
      updatedAt: new Date(),
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockDraft);
    vi.mocked(mockDraftRepository.update).mockResolvedValue(mockLockedDraft);

    const result = await lockDraft.execute({ draftId });

    expect(result.state).toBe(DraftStateEnum.LOCKED);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    expect(mockDraftRepository.update).toHaveBeenCalledWith(draftId, {
      state: DraftStateEnum.LOCKED,
    });
  });

  it("should return draft unchanged if already locked", async () => {
    const draftId = "123e4567-e89b-12d3-a456-426614174000";
    const now = new Date();

    const mockLockedDraft: Draft = {
      id: draftId,
      userId: "123e4567-e89b-12d3-a456-426614174001",
      productId: "123e4567-e89b-12d3-a456-426614174002",
      templateId: "123e4567-e89b-12d3-a456-426614174003",
      state: DraftStateEnum.LOCKED,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockLockedDraft);

    const result = await lockDraft.execute({ draftId });

    expect(result.state).toBe(DraftStateEnum.LOCKED);
    expect(result.id).toBe(draftId);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    expect(mockDraftRepository.update).not.toHaveBeenCalled();
  });

  it("should throw error when trying to lock an ordered draft", async () => {
    const draftId = "123e4567-e89b-12d3-a456-426614174000";
    const now = new Date();

    const mockOrderedDraft: Draft = {
      id: draftId,
      userId: "123e4567-e89b-12d3-a456-426614174001",
      productId: "123e4567-e89b-12d3-a456-426614174002",
      templateId: "123e4567-e89b-12d3-a456-426614174003",
      state: DraftStateEnum.ORDERED,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockOrderedDraft);

    await expect(lockDraft.execute({ draftId })).rejects.toThrow(ConflictError);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    expect(mockDraftRepository.update).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when draft does not exist", async () => {
    const draftId = "123e4567-e89b-12d3-a456-426614174000";

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(null);

    await expect(lockDraft.execute({ draftId })).rejects.toThrow(NotFoundError);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    expect(mockDraftRepository.update).not.toHaveBeenCalled();
  });
});
