export interface UploadedImage {
  id: string;
  userId: string;
  cloudinaryPublicId: string;
  originalUrl: string;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}