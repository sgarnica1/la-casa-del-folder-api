import { describe, it, expect, beforeEach, vi } from "vitest";
import { LockDraft } from "../../core/application/use-cases/drafts/LockDraft";
import { DraftRepository } from "../../core/domain/repositories/DraftRepository";
import { Draft, DraftState } from "../../core/domain/entities/Draft";
import { NotFoundError } from "../../core/domain/errors/DomainErrors";

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
    const draftId = "draft-123";
    const now = new Date();

    const mockDraft: Draft = {
      id: draftId,
      userId: "user-123",
      productId: "product-123",
      templateId: "template-123",
      state: DraftState.EDITING,
      createdAt: now,
      updatedAt: now,
    };

    const mockLockedDraft: Draft = {
      ...mockDraft,
      state: DraftState.LOCKED,
      updatedAt: new Date(),
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockDraft);
    vi.mocked(mockDraftRepository.update).mockResolvedValue(mockLockedDraft);

    const result = await lockDraft.execute({ draftId });

    expect(result.state).toBe(DraftState.LOCKED);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    expect(mockDraftRepository.update).toHaveBeenCalledWith(draftId, {
      state: DraftState.LOCKED,
    });
  });

  it("should return draft unchanged if already locked", async () => {
    const draftId = "draft-123";
    const now = new Date();

    const mockLockedDraft: Draft = {
      id: draftId,
      userId: "user-123",
      productId: "product-123",
      templateId: "template-123",
      state: DraftState.LOCKED,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockLockedDraft);

    const result = await lockDraft.execute({ draftId });

    expect(result.state).toBe(DraftState.LOCKED);
    expect(result.id).toBe(draftId);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    expect(mockDraftRepository.update).not.toHaveBeenCalled();
  });

  it("should throw error when trying to lock an ordered draft", async () => {
    const draftId = "draft-123";
    const now = new Date();

    const mockOrderedDraft: Draft = {
      id: draftId,
      userId: "user-123",
      productId: "product-123",
      templateId: "template-123",
      state: DraftState.ORDERED,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockOrderedDraft);

    await expect(lockDraft.execute({ draftId })).rejects.toThrow("Cannot lock an already ordered draft");
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    expect(mockDraftRepository.update).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when draft does not exist", async () => {
    const draftId = "draft-123";

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(null);

    await expect(lockDraft.execute({ draftId })).rejects.toThrow(NotFoundError);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    expect(mockDraftRepository.update).not.toHaveBeenCalled();
  });
});
