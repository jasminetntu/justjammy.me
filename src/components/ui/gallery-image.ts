import type { Focal } from "@/lib/focal";

// shared image shape for the gallery components — any amount, any size
export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  focal?: Focal; // crop focal point — set via /dev/crop
}

// cycle of hand-tilted rotation angles for the polaroid look, reused across
// any number of images (indexes wrap via modulo)
export const POLAROID_TILTS = [3, -2.5, 2, -3, 2.5, -2] as const;
