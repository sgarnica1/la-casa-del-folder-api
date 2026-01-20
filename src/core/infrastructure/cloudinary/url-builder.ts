import { cloudinary } from './client';

export interface ImageTransform {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
}

export function buildImageUrl(
  publicId: string,
  transform?: ImageTransform,
  options?: {
    fetchFormat?: 'auto' | 'jpg' | 'png' | 'webp';
    quality?: 'auto' | number;
  }
): string {
  const cloudinaryOptions: Record<string, unknown> = {
    fetch_format: options?.fetchFormat || 'auto',
    quality: options?.quality || 'auto',
  };

  if (transform) {
    if (transform.width) cloudinaryOptions.width = transform.width;
    if (transform.height) cloudinaryOptions.height = transform.height;
    if (transform.crop) cloudinaryOptions.crop = transform.crop;
    if (transform.gravity) cloudinaryOptions.gravity = transform.gravity;

    if (transform.x !== undefined || transform.y !== undefined) {
      cloudinaryOptions.x = transform.x || 0;
      cloudinaryOptions.y = transform.y || 0;
    }

    if (transform.scale !== undefined) {
      cloudinaryOptions.zoom = transform.scale;
    }

    if (transform.rotation !== undefined) {
      cloudinaryOptions.angle = transform.rotation;
    }
  }

  return cloudinary.url(publicId, cloudinaryOptions);
}
