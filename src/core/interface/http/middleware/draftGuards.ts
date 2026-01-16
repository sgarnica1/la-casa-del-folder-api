import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { ProductTemplateRepository } from "../../../domain/repositories/ProductTemplateRepository";

/**
 * VALIDATION: Checks if draft is complete and ready for locking/ordering
 * 
 * A draft is complete if:
 * - All required template slots have images assigned
 * - No missing layout items for required slots
 */
export async function validateDraftCompleteness(
  draftId: string,
  templateId: string,
  draftRepository: DraftRepository,
  templateRepository: ProductTemplateRepository
): Promise<{ isComplete: boolean; missingSlots: string[] }> {
  const draftWithItems = await draftRepository.findByIdWithLayoutItemsAndImages(draftId);

  if (!draftWithItems) {
    throw new Error("Draft not found");
  }

  const templateItems = await templateRepository.findLayoutItemsByTemplateId(templateId);
  const requiredSlots = templateItems.filter((item) => item.editable);

  const draftSlotIndices = new Set(
    draftWithItems.layoutItems.map((item) => item.layoutIndex)
  );

  const slotsWithImages = new Set(
    draftWithItems.layoutItems
      .filter((item) => item.imageId !== null)
      .map((item) => item.layoutIndex)
  );

  const missingSlots: string[] = [];

  for (const requiredSlot of requiredSlots) {
    if (!draftSlotIndices.has(requiredSlot.layoutIndex)) {
      missingSlots.push(`slot-${requiredSlot.layoutIndex}`);
      continue;
    }

    if (!slotsWithImages.has(requiredSlot.layoutIndex)) {
      missingSlots.push(`slot-${requiredSlot.layoutIndex}`);
    }
  }

  return {
    isComplete: missingSlots.length === 0,
    missingSlots,
  };
}
