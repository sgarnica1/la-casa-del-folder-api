import { z } from "zod";

export const GetImagesByIdsInputSchema = z.object({
  ids: z.array(z.uuid()),
});

export type GetImagesByIdsInput = z.infer<typeof GetImagesByIdsInputSchema>;

export const GetImagesByIdsOutputSchema = z.object({
  id: z.uuid(),
  url: z.string().url(),
});

export type GetImagesByIdsOutput = z.infer<typeof GetImagesByIdsOutputSchema>;
