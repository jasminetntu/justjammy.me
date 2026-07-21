import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk, Parisienne } from "next/font/google";
import "./globals.css";

import { BackgroundCanvas } from "@/components/layout/background-canvas";
import { FxProvider } from "@/components/layout/fx-provider";
import { PageTransition } from "@/components/layout/page-transition";
import { SiteHeader } from "@/components/layout/site-header";
import { site } from "@/content/site";

const parisienne = Parisienne({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-parisienne",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

const hanken = Hanken_Grotesk({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  // child pages set just their name (e.g. "About"); Next appends the suffix.
  // pages that need a standalone title can use `title: { absolute: "…" }`.
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${parisienne.variable} ${cormorant.variable} ${hanken.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream font-sans text-ink">
        <FxProvider>
          <BackgroundCanvas />
          <SiteHeader />
          <div className="relative z-10">
            <PageTransition>{children}</PageTransition>
          </div>
        </FxProvider>
      </body>
    </html>
  );
}
