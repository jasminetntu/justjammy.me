"use client";

import { useEffect, useState } from "react";

import { useFx } from "@/components/layout/fx-provider";
import { PagePanel } from "@/components/layout/page-panel";
import { BackLink } from "@/components/ui/back-link";
import { FourPointStar } from "@/components/ui/four-point-star";
import { site } from "@/content/site";
import { ease } from "@/lib/theme";

// the greeting cycles on click; each click also flings a shooting star
const GREETINGS = ["hello", "hi", "chào", "hola"] as const;

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

  // release the click "pop" scale shortly after it fires
  useEffect(() => {
    if (!pop) return;
    const t = setTimeout(() => setPop(false), 200);
    return () => clearTimeout(t);
  }, [pop]);

  const cycleGreeting = () => {
    setGreetIndex((i) => (i + 1) % GREETINGS.length);
    setPop(true);
    launchShoot();
  };

  return (
    <main className="flex min-h-dvh items-center overflow-y-auto px-[clamp(24px,5vw,60px)] py-20">
      <PagePanel className="mx-auto w-full max-w-[940px]">
        <div className="grid grid-cols-1 items-center gap-[clamp(38px,6vw,76px)] md:grid-cols-2">
          {/* the letter */}
          <div className="text-left">
            <div className="mb-3.5">
              <BackLink href="/" label="back" />
            </div>
            <div className="font-serif mb-2.5 text-[16px] uppercase italic tracking-[.34em] text-pink-deep">
              contact
            </div>
            <h1 className="font-script m-0 mb-[.3em] text-[clamp(58px,8vw,92px)] leading-[.92] text-ink">
              say{" "}
              <span
                onClick={cycleGreeting}
                className="inline-block cursor-pointer transition-[color,transform] duration-300 hover:text-pink"
                style={{
                  transform: pop ? "scale(1.12)" : "scale(1)",
                  transitionTimingFunction: ease.soft,
                }}
              >
                {GREETINGS[greetIndex]}
              </span>
            </h1>
            <p className="font-serif m-0 mb-[clamp(26px,3vw,38px)] max-w-[430px] text-[clamp(18px,1.7vw,25px)] italic leading-[1.5] text-ink">
              A role, a project, or just a hello — I&rsquo;d love to hear from you.
            </p>
            <div className="font-serif flex items-center gap-[9px] text-[17px] italic text-ink-muted">
              <FourPointStar size={13} color="#e2a7c4" />
              <span>{site.location}</span>
            </div>
          </div>

          {/* the links */}
          <div className="flex flex-col">
            {LINKS.map((row, i) => (
              <ContactRow key={row.label} row={row} index={i} burst={burst} />
            ))}
          </div>
        </div>
      </PagePanel>
    </main>
  );
}

function ContactRow({
  row,
  index,
  burst,
}: {
  row: LinkRow;
  index: number;
  burst: (x: number, y: number, col: string, n?: number, col2?: string) => void;
}) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  // staggered bloom-in on mount (mirrors the prototype's revealContact)
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!row.copy) return;
    e.preventDefault();
    void navigator.clipboard?.writeText(site.email);
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, "#e2a7c4", 16, "#ffffff");
    setCopied(true);
  };

  return (
    <div
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(14px)",
        transition: `opacity .7s ease ${index * 110}ms, transform .7s ${ease.soft} ${index * 110}ms`,
      }}
    >
      <a
        href={row.href}
        onClick={onClick}
        title={row.copy ? "click to copy" : undefined}
        target={row.external ? "_blank" : undefined}
        rel={row.external ? "noopener noreferrer" : undefined}
        className="group relative flex items-baseline justify-between gap-5 border-b border-[rgba(107,83,67,.14)] px-0.5 py-[19px] no-underline transition-transform duration-500 hover:-translate-y-[3px]"
        style={{ transitionTimingFunction: ease.soft }}
      >
        <span className="font-serif text-[16px] uppercase italic tracking-[.16em] text-pink-deep">
          {row.label}
        </span>
        <span className="text-[clamp(15px,1.3vw,17px)] text-ink-dark">
          {copied ? "copied ✦" : row.value}
        </span>
        {/* underline draws in from the left on hover */}
        <span className="absolute -bottom-px left-0 h-[1.5px] w-full origin-left scale-x-0 bg-pink transition-transform duration-500 group-hover:scale-x-100" />
      </a>
    </div>
  );
}
