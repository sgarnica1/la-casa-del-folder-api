import { z } from "zod";

export const UploadImageInputSchema = z.object({
  userId: z.uuid(),
  file: z.object({
    buffer: z.instanceof(Buffer),
    mimetype: z.string().regex(/^image\//),
  }),
});

export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

export const UploadImageOutputSchema = z.object({
  id: z.uuid(),
  url: z.string().url(),
});

export type UploadImageOutput = z.infer<typeof UploadImageOutputSchema>;
