import Link from "next/link";

interface BackLinkProps {
  href?: string;
  label?: string;
  className?: string; // sets the section-tinted text color
}

// italic "← back" used at the top of every section
export function BackLink({ href = "/", label = "back", className = "text-ink-faint" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`font-serif inline-flex items-center gap-[7px] text-[14px] italic tracking-[.1em] transition-[transform,opacity] duration-300 hover:-translate-x-1 hover:opacity-70 ${className}`}
    >
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 12H5" />
        <path d="m12 5-7 7 7 7" />
      </svg>
      {label}
    </Link>
  );
}
