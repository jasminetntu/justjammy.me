import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crop",
  robots: { index: false, follow: false },
};

export default function CropLayout({ children }: { children: React.ReactNode }) {
  return children;
}
