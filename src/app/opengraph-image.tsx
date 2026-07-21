import { ImageResponse } from "next/og";

import { site } from "@/content/site";

// share card mirrors the home page: the garden wash (4 radial blobs on cream) +
// the wispy ribbon, with just the script name centered. used for every route
// (Next auto-wires og:image / twitter:image from this file).
export const alt = "Jasmine Tu — software engineer & designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// the garden wash from src/lib/canvas/wash.ts, flattened to css radial-gradients
// (positions × 1200/630, radii × 1200; each blob fades a→a*.4→0 like the canvas).
// listed top-most first to match the canvas paint order.
const WASH = [
  "radial-gradient(480px 480px at 72px 76px, rgba(233,128,176,.12) 0%, rgba(233,128,176,.048) 55%, transparent 100%)",
  "radial-gradient(720px 720px at 120px 580px, rgba(160,190,128,.20) 0%, rgba(160,190,128,.08) 55%, transparent 100%)",
  "radial-gradient(600px 600px at 1080px 315px, rgba(222,150,190,.16) 0%, rgba(222,150,190,.064) 55%, transparent 100%)",
  "radial-gradient(744px 744px at 672px 25px, rgba(233,128,176,.26) 0%, rgba(233,128,176,.104) 55%, transparent 100%)",
].join(",");

// a static snapshot of the animated canvas ribbon (src/lib/canvas/draw.ts:
// drawRibbon) — same sine-wave centerline + tapered width, frozen at time T.
// returns the filled outline path + the gradient endpoints along its length.
function buildRibbon(T: number, W: number, H: number) {
  const N = 70;
  const PH = 2.0;
  const MAXW = 16;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const px = (i / N) * (W + 200) - 100;
    const pr = px / W;
    const py =
      H * 0.5 +
      Math.sin(pr * Math.PI * 1.15 + T * 0.32 + PH) * H * 0.3 +
      Math.sin(pr * Math.PI * 2.3 + T * 0.2) * H * 0.09 +
      Math.sin(px * 0.0032 + T * 0.2) * 12;
    pts.push([px, py]);
  }
  const SCALE = 1.6; // a touch wider than the live canvas so the tints read on the card
  const wAt = (i: number) => {
    const pr = i / N;
    return (
      SCALE * MAXW * Math.pow(Math.sin(pr * Math.PI), 0.62) * (0.62 + 0.38 * Math.sin(pr * 4.3 + T * 0.5 + PH))
    );
  };
  const norm = (i: number): [number, number] => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  let d = "";
  for (let i = 0; i <= N; i++) {
    const [px, py] = pts[i];
    const [nx, ny] = norm(i);
    const w = wAt(i) * 0.5;
    d += `${i === 0 ? "M" : "L"} ${(px + nx * w).toFixed(2)} ${(py + ny * w).toFixed(2)} `;
  }
  for (let i = N; i >= 0; i--) {
    const [px, py] = pts[i];
    const [nx, ny] = norm(i);
    const w = wAt(i) * 0.5;
    d += `L ${(px - nx * w).toFixed(2)} ${(py - ny * w).toFixed(2)} `;
  }
  return { d: `${d}Z`, x1: pts[0][0], y1: pts[0][1], x2: pts[N][0], y2: pts[N][1] };
}

// pull Parisienne as a raw ttf so satori can embed the script name
async function loadGoogleFont(family: string, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`failed to resolve font: ${family}`);
  return (await fetch(src)).arrayBuffer();
}

export default async function OpengraphImage() {
  const name = site.name;
  const parisienne = await loadGoogleFont("Parisienne", name);
  const ribbon = buildRibbon(12.6, size.width, size.height);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f5f0",
          backgroundImage: WASH,
        }}
      >
        {/* the actual ribbon geometry, white→pink→white→green along its length */}
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <linearGradient
              id="ribbon"
              gradientUnits="userSpaceOnUse"
              x1={ribbon.x1}
              y1={ribbon.y1}
              x2={ribbon.x2}
              y2={ribbon.y2}
            >
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.1" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="0.28" stopColor="#ffffff" stopOpacity="0.68" />
              <stop offset="0.43" stopColor="#e493bd" stopOpacity="0.8" />
              <stop offset="0.57" stopColor="#ffffff" stopOpacity="0.68" />
              <stop offset="0.75" stopColor="#b6d38f" stopOpacity="0.8" />
              <stop offset="0.9" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* soft white edge so the tints separate from the like-colored wash */}
          <path d={ribbon.d} fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth={2} />
          <path d={ribbon.d} fill="url(#ribbon)" />
        </svg>

        <div style={{ display: "flex", fontFamily: "Parisienne", fontSize: 172, lineHeight: 1, color: "#6b5343" }}>
          {name}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Parisienne", data: parisienne, style: "normal", weight: 400 }],
    },
  );
}
