import { z } from "zod";

export const GetLayoutByTemplateIdInputSchema = z.object({
  templateId: z.string(),
});

export type GetLayoutByTemplateIdInput = z.infer<typeof GetLayoutByTemplateIdInputSchema>;

export const GetLayoutByTemplateIdOutputSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  slots: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      required: z.boolean(),
      bounds: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }),
    })
  ),
});

export type GetLayoutByTemplateIdOutput = z.infer<typeof GetLayoutByTemplateIdOutputSchema>;
