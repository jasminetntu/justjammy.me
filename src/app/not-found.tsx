import Link from "next/link";

// on-brand 404 — also keeps unknown-route navigations inside the normal
// router flow so the page cross-fade still runs
export default function NotFound() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-script text-[clamp(44px,7vw,80px)] leading-none text-ink">wandered off the path</h1>
      <p className="font-sans max-w-md text-lg text-ink-muted">404: This page doesn&rsquo;t exist.</p>
      <Link
        href="/"
        className="font-sans mt-2 text-[17px] text-pink-deep underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        back to home
      </Link>
    </main>
  );
}
