"use client";

import { Fragment, useEffect, useState } from "react";

import { useFx } from "@/components/layout/fx-provider";
import { PagePanel } from "@/components/layout/page-panel";
import { BackLink } from "@/components/ui/back-link";
import { FourPointStar } from "@/components/ui/four-point-star";
import { site } from "@/content/site";
import { ease } from "@/lib/theme";

// the greeting cycles on click; each click also flings a shooting star
const GREETINGS = ["hello", "hi", "chào", "hola"] as const;

// soft blush → sage wash over cream that fills the whole page (from the contact
// prototype). painted on the page backdrop (body) so the transparent canvas —
// and the ribbon drawn on it — layer over it at full strength.
const PAGE_GRADIENT = [
  "radial-gradient(72% 52% at 26% 4%, rgba(233,128,176,.24), transparent 62%)",
  "radial-gradient(58% 62% at 96% 56%, rgba(160,190,128,.34), transparent 62%)",
  "radial-gradient(62% 60% at 4% 98%, rgba(160,190,128,.20), transparent 62%)",
  "#f9f5f0",
].join(",");

interface LinkRow {
  label: string;
  value: string;
  href: string;
  external?: boolean;
  copy?: boolean; // email → click-to-copy instead of navigating
}

const LINKS: LinkRow[] = [
  { label: "email", value: site.email, href: `mailto:${site.email}`, copy: true },
  { label: "linkedin", value: "in/jasminetntu", href: site.linkedin, external: true },
  { label: "github", value: "@jasminetntu", href: site.github, external: true },
  { label: "resume", value: "download PDF ↓", href: site.resume, external: true },
];

export function ContactLetter() {
  const { burst, launchShoot } = useFx();

  const [greetIndex, setGreetIndex] = useState(0);
  const [pop, setPop] = useState(false);
  const [copied, setCopied] = useState(false);

  // paint the gradient on the page backdrop so the transparent background canvas
  // (and the ribbon drawn on it) layer over it; restored when leaving the page
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = PAGE_GRADIENT;
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  // release the click "pop" scale shortly after it fires
  useEffect(() => {
    if (!pop) return;
    const t = setTimeout(() => setPop(false), 200);
    return () => clearTimeout(t);
  }, [pop]);

  // revert the "copied" label after a moment
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const cycleGreeting = () => {
    setGreetIndex((i) => (i + 1) % GREETINGS.length);
    setPop(true);
    launchShoot();
  };

  const copyEmail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    void navigator.clipboard?.writeText(site.email);
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, "#e2a7c4", 16, "#ffffff");
    setCopied(true);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-y-auto px-[clamp(24px,5vw,60px)] py-20">
      <PagePanel className="w-full max-w-[1120px]">
        <div className="grid grid-cols-1 items-end gap-[clamp(38px,6vw,76px)] md:[grid-template-columns:1.4fr_.6fr]">
          {/* LEFT — the letter */}
          <div className="text-left">
            <div className="mb-[18px]">
              <BackLink href="/" label="back" />
            </div>
            <h1 className="font-script m-0 mb-[18px] text-[clamp(60px,8vw,92px)] leading-[.9] text-ink">
              say{" "}
              <span
                onClick={cycleGreeting}
                data-pop={pop}
                // desktop: hover turns it pink. mobile (no hover): a tap flashes
                // it pink for a beat via the click "pop" state.
                className="inline-block cursor-pointer transition-[color,transform] duration-300 md:hover:text-pink max-md:data-[pop=true]:text-pink"
                style={{
                  transform: pop ? "scale(1.12)" : "scale(1)",
                  transitionTimingFunction: ease.soft,
                }}
              >
                {GREETINGS[greetIndex]}
              </span>
            </h1>
            <p className="font-serif m-0 mb-[26px] text-[clamp(18px,1.7vw,23px)] italic leading-[1.5] text-ink">
              A role, a project, or just a hello — I&rsquo;d love to hear from you.
            </p>

            {/* divider with a star nested in the line */}
            <div className="mb-[26px] flex max-w-[360px] items-center gap-3">
              <div
                className="h-px flex-1"
                style={{ background: "linear-gradient(90deg, rgba(226,167,196,.6), rgba(226,167,196,0))" }}
              />
              <FourPointStar size={13} color="#e2a7c4" />
              <div
                className="h-px flex-[5]"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(226,167,196,0), rgba(226,167,196,.6), rgba(226,167,196,0))",
                }}
              />
            </div>

            {/* status pills */}
            <div className="flex flex-wrap gap-2.5">
              <span
                className="font-serif inline-flex items-center rounded-full px-[15px] py-[7px] text-[15px] italic"
                style={{ background: "rgba(226,167,196,.14)", color: "#9a7f6b" }}
              >
                {site.location}
              </span>
              <span
                className="font-serif inline-flex items-center rounded-full px-[15px] py-[7px] text-[15px] italic"
                style={{ background: "rgba(160,190,128,.16)", color: "#6f8a58" }}
              >
                {site.availability}
              </span>
            </div>
          </div>

          {/* RIGHT — the links, a right-aligned label/value grid */}
          <div className="grid w-max items-baseline gap-x-5 gap-y-[14px] [grid-template-columns:auto_auto] md:ml-auto md:gap-x-[30px]">
            {LINKS.map((row) => (
              <Fragment key={row.label}>
                <span className="font-serif text-left text-[14px] uppercase italic tracking-[.16em] text-pink-deep md:text-right md:text-[16px]">
                  {row.label}
                </span>
                <a
                  href={row.href}
                  onClick={row.copy ? copyEmail : undefined}
                  title={row.copy ? "click to copy" : undefined}
                  target={row.external ? "_blank" : undefined}
                  rel={row.external ? "noopener noreferrer" : undefined}
                  className="group text-left text-[15px] text-ink-dark transition-colors duration-300 hover:text-pink-deep md:text-right md:text-[17px]"
                >
                  <span className="relative inline-block pb-[3px]">
                    {row.copy && copied ? "copied ✦" : row.value}
                    {/* gradient underline draws in from the left on hover */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-[1.5px] origin-left scale-x-0 transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100"
                      style={{
                        background:
                          "linear-gradient(90deg, #efc3d9 0%, #efc3d9 40%, rgba(239,195,217,0) 100%)",
                      }}
                    />
                  </span>
                </a>
              </Fragment>
            ))}
          </div>
        </div>
      </PagePanel>
    </main>
  );
}
