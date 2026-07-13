"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ease, STAR_PATH } from "@/lib/theme";
import { petalOffset } from "@/lib/radial";
import { pathToView, type View } from "@/lib/views";

interface Petal {
  href: string;
  view: View;
  label: string;
  accent: string;
  side: "left" | "bottom";
  icon: React.ReactNode;
}

// lucide icon paths, matched to the prototype
const ICON_PROPS = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const PETALS: Petal[] = [
  {
    href: "/about",
    view: "about",
    label: "about",
    accent: "#c089ac",
    side: "left",
    icon: (
      <svg {...ICON_PROPS} style={{ display: "block" }}>
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
        <path d="M20 3v4" />
        <path d="M22 5h-4" />
        <path d="M4 17v2" />
        <path d="M5 18H3" />
      </svg>
    ),
  },
  {
    href: "/experience",
    view: "experience",
    label: "swe",
    accent: "#7fa06e",
    side: "left",
    icon: (
      <svg {...ICON_PROPS} style={{ display: "block" }}>
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
      </svg>
    ),
  },
  {
    href: "/design",
    view: "design",
    label: "design",
    accent: "#c077a3",
    side: "bottom",
    icon: (
      <svg {...ICON_PROPS} style={{ display: "block" }}>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
  {
    href: "/contact",
    view: "contact",
    label: "contact",
    accent: "#9a7bbf",
    side: "bottom",
    icon: (
      <svg {...ICON_PROPS} style={{ display: "block" }}>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="M15.8 9.2a2.5 2.5 0 0 0-3.5 0l-.4.4-.4-.4a2.5 2.5 0 0 0-3.5 3.5l.4.4 3.5 3.5 3.5-3.5.4-.4a2.5 2.5 0 0 0 0-3.5z" />
      </svg>
    ),
  },
];

// top chrome: J monogram (home) + radial bloom menu. hidden on the garden.
export function SiteHeader() {
  const pathname = usePathname();
  const view = pathToView(pathname);
  const shown = view !== "garden";

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-[clamp(22px,4vw,52px)] py-5"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(-12px)",
        pointerEvents: shown ? "auto" : "none",
        transition: "opacity .7s ease, transform .7s ease",
      }}
    >
      <Link
        href="/"
        aria-label="home"
        className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[rgba(154,127,107,.22)] bg-white/50 shadow-[0_6px_18px_rgba(154,127,107,.12)] transition-[transform,box-shadow] duration-500 hover:-rotate-[4deg] hover:scale-[1.08] hover:shadow-[0_10px_24px_rgba(154,127,107,.2)]"
        style={{ transitionTimingFunction: ease.soft }}
      >
        <span className="font-script -mt-0.5 text-[30px] leading-none text-ink">
          J
        </span>
      </Link>

      {/* keyed by pathname so the bloom closes itself on navigation */}
      <RadialMenu key={pathname} view={view} />
    </header>
  );
}

function RadialMenu({ view }: { view: View }) {
  const [open, setOpen] = useState(false);
  const radialRef = useRef<HTMLDivElement>(null);

  // close when clicking anywhere outside the bloom
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (radialRef.current && !radialRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  return (
    <div ref={radialRef} className="relative h-12 w-12">
      {PETALS.map((petal, i) => {
        const { dx, dy } = petalOffset(i);
        const active = view === petal.view;
        return (
          <Link
            key={petal.view}
            href={petal.href}
            aria-label={petal.label}
            className="group absolute right-0 top-0 z-[1] flex h-11 w-11 items-center justify-center rounded-full"
            style={{
              color: active ? petal.accent : "#9a7f6b",
              opacity: open ? 1 : 0,
              transform: open
                ? `translate(${dx}px,${dy}px) scale(1)`
                : "translate(0,0) scale(.4)",
              pointerEvents: open ? "auto" : "none",
              transition: `transform .5s ${ease.spring}, opacity .35s ease, color .4s ease`,
              transitionDelay: open
                ? `${i * 0.05}s, ${i * 0.05}s, 0s`
                : `${(PETALS.length - 1 - i) * 0.04}s`,
            }}
            onPointerEnter={(e) => (e.currentTarget.style.color = petal.accent)}
            onPointerLeave={(e) =>
              (e.currentTarget.style.color = active ? petal.accent : "#9a7f6b")
            }
          >
            {petal.icon}
            <span
              className={
                petal.side === "left"
                  ? "font-serif pointer-events-none absolute right-full top-1/2 -translate-x-[6px] -translate-y-1/2 whitespace-nowrap text-[13px] italic opacity-0 transition-[opacity,transform] duration-[400ms] group-hover:-translate-x-[9px] group-hover:opacity-100"
                  : "font-serif pointer-events-none absolute left-1/2 top-full -translate-x-1/2 translate-y-[2px] whitespace-nowrap text-[13px] italic opacity-0 transition-[opacity,transform] duration-[400ms] group-hover:translate-y-[5px] group-hover:opacity-100"
              }
            >
              {petal.label}
            </span>
          </Link>
        );
      })}

      <button
        aria-label="menu"
        aria-expanded={open}
        className="absolute right-0 top-0 z-[3] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-transform duration-[550ms] hover:scale-[1.07]"
        style={{ transitionTimingFunction: ease.soft }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <svg
          width={22}
          height={22}
          viewBox="-12 -12 24 24"
          style={{
            display: "block",
            overflow: "visible",
            transform: open
              ? "rotate(225deg) scale(.9)"
              : "rotate(0deg) scale(1)",
            transition: `transform .55s ${ease.soft}`,
          }}
        >
          <path d={STAR_PATH} fill="#9a7f6b" />
        </svg>
      </button>
    </div>
  );
}
