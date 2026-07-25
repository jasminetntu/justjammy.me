import { BackLink } from "@/components/ui/back-link";
import { FourPointStar } from "@/components/ui/four-point-star";

// full-page "coming soon" placeholder, shown when a section's real content
// isn't ready yet (toggled via comingSoon in src/content/site.ts)
export function ComingSoon({ eyebrow, accent = "#c077a3" }: { eyebrow: string; accent?: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex items-center gap-2.5">
        <FourPointStar size={16} color={accent} />
        <span className="font-serif text-[15px] uppercase italic tracking-[.2em]" style={{ color: accent }}>
          {eyebrow}
        </span>
      </div>
      <h1 className="font-script text-[clamp(46px,8vw,88px)] leading-none text-ink">coming soon</h1>
      <p className="font-serif text-[clamp(15px,1.6vw,19px)] italic text-ink-muted">
        something lovely is blooming here
      </p>
      <div className="mt-1">
        <BackLink href="/" label="back home" />
      </div>
    </main>
  );
}
