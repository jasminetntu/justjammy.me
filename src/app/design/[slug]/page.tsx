import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PieceDetail } from "@/components/sections/piece-detail";
import { getPiece, pieces } from "@/content/design";

interface Params {
  params: Promise<{ slug: string }>;
}

// prerender a static page per design piece
export function generateStaticParams() {
  return pieces.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const piece = getPiece(slug);
  if (!piece) return {};
  return {
    title: piece.title,
    description: piece.blurb,
  };
}

export default async function PiecePage({ params }: Params) {
  const { slug } = await params;
  const piece = getPiece(slug);
  if (!piece) notFound();

  return <PieceDetail piece={piece} />;
}
