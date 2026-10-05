"use client";

import { useRef, useState } from "react";

// hidden crop tool — not linked from anywhere on the site. Lets you pick a
// focal point on any /public image and copy the resulting `focal: { x, y }`
// snippet into the relevant content file (ProjectImage / DesignImage /
// GalleryImage all accept it). Non-destructive: the source file is never
// touched or written to — this only previews object-position. Metadata
// (noindex) lives in the sibling layout.tsx since a Client Component can't
// export `metadata`.
const PRESETS = [
  { label: "square", w: 1, h: 1 },
  { label: "horizontal", w: 260, h: 180 },
  { label: "vertical (4:5)", w: 4, h: 5 },
] as const;

export default function CropToolPage() {
  const [src, setSrc] = useState("");
  const [focal, setFocal] = useState({ x: 50, y: 50 });
  const [aspect, setAspect] = useState<{ w: number; h: number }>({ w: 1, h: 1 });
  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function setFocalFromEvent(e: React.PointerEvent) {
    const box = imgRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setFocal({ x: Math.round(x), y: Math.round(y) });
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    setFocalFromEvent(e);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragging.current) setFocalFromEvent(e);
  }
  function onPointerUp() {
    dragging.current = false;
  }

  const snippet = `focal: { x: ${focal.x}, y: ${focal.y} },`;

  function copySnippet() {
    void navigator.clipboard?.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const previewHeight = Math.round(240 * (aspect.h / aspect.w));

  return (
    <main className="mx-auto max-w-[900px] px-[clamp(20px,4vw,40px)] pb-[120px] pt-28">
      <h1 className="font-script mb-2 text-[36px] text-ink-deep">crop</h1>
      <p className="mb-8 text-[13px] text-ink-muted">
        Pick a focal point for any image, then paste the snippet into its content entry (
        <code>ProjectImage</code>, <code>DesignImage</code>, or <code>GalleryImage</code> all take{" "}
        <code>focal</code>). The source file is never modified — this only previews cropping.
      </p>

      <label className="mb-6 block">
        <span className="mb-1.5 block text-[13px] text-ink-muted">Image path (under /public)</span>
        <input
          type="text"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          placeholder="/images/design/my-piece/art.jpg"
          className="w-full rounded-lg border border-[rgba(154,127,107,.25)] bg-white px-3 py-2 text-[14px] text-ink-dark outline-none focus:border-pink-deep"
        />
      </label>

      {src && (
        <div className="flex flex-wrap items-start gap-10">
          <div>
            <p className="mb-2 text-[12px] text-ink-faint">Click or drag to set the focal point</p>
            <div
              ref={imgRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className="relative w-[320px] cursor-crosshair overflow-hidden rounded-[4px] border border-[rgba(154,127,107,.18)] bg-[rgba(0,0,0,.04)] select-none"
            >
              {/* plain <img> — this tool previews arbitrary pasted paths, so it
                  skips next/image's static optimization pipeline on purpose */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="block w-full select-none" draggable={false} />
              <span
                className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1.5px_rgba(70,48,54,.6)]"
                style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[12px] text-ink-faint">Preview at this aspect ratio</p>
            <div className="mb-3 flex gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setAspect({ w: p.w, h: p.h })}
                  className={`rounded-full border px-3 py-1 text-[12px] font-serif italic transition-colors ${
                    aspect.w === p.w && aspect.h === p.h
                      ? "border-[rgba(154,123,191,.3)] bg-[rgba(154,123,191,.14)] text-[#6f5ba0]"
                      : "border-[rgba(154,127,107,.18)] text-ink-faint hover:text-ink-muted"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div
              className="relative w-[240px] overflow-hidden rounded-[4px] border border-[rgba(154,127,107,.18)] bg-[rgba(0,0,0,.04)]"
              style={{ height: previewHeight }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: `${focal.x}% ${focal.y}%` }}
              />
            </div>

            <div className="mt-5">
              <p className="mb-1.5 text-[12px] text-ink-faint">Paste into the image's entry:</p>
              <div className="flex items-center gap-2">
                <code className="rounded-md bg-[rgba(154,127,107,.1)] px-2.5 py-1.5 text-[13px] text-ink-dark">
                  {snippet}
                </code>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="rounded-full border border-[rgba(154,127,107,.2)] px-3 py-1.5 text-[12px] text-ink-muted hover:text-pink-deep"
                >
                  {copied ? "copied ✦" : "copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
