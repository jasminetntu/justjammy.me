// canvas draw helpers for the shared background engine

export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number,
  col: string,
  alpha: number,
): void {
  if (r <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  const ir = r * 0.2;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    const rr = i % 2 === 0 ? r : ir;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const RIBBON = { ph: 2.0, maxW: 16, a: 0.5 };
const N = 70;

// single wispy white→pink→green ribbon drifting across the page
export function drawRibbon(
  ctx: CanvasRenderingContext2D,
  t: number,
  W: number,
  H: number,
  alpha: number,
  pointerNy: number,
): void {
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const px = (i / N) * (W + 200) - 100;
    const pr = px / W;
    const py =
      H * 0.5 +
      Math.sin(pr * Math.PI * 1.15 + t * 0.32 + RIBBON.ph) * H * 0.3 +
      Math.sin(pr * Math.PI * 2.3 + t * 0.2) * H * 0.09 +
      Math.sin(px * 0.0032 + t * 0.2) * 12 +
      pointerNy * 14;
    pts.push([px, py]);
  }
  const wAt = (i: number) => {
    const pr = i / N;
    return RIBBON.maxW * Math.pow(Math.sin(pr * Math.PI), 0.62) * (0.62 + 0.38 * Math.sin(pr * 4.3 + t * 0.5 + RIBBON.ph));
  };
  const norm = (i: number): [number, number] => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const [px, py] = pts[i];
    const [nx, ny] = norm(i);
    const w = wAt(i) * 0.5;
    if (i === 0) ctx.moveTo(px + nx * w, py + ny * w);
    else ctx.lineTo(px + nx * w, py + ny * w);
  }
  for (let i = N; i >= 0; i--) {
    const [px, py] = pts[i];
    const [nx, ny] = norm(i);
    const w = wAt(i) * 0.5;
    ctx.lineTo(px - nx * w, py - ny * w);
  }
  const g = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[N][0], pts[N][1]);
  const pink = "232,160,196";
  const green = "196,214,163";
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.1, `rgba(255,255,255,${RIBBON.a * 0.85 * alpha})`);
  g.addColorStop(0.28, `rgba(255,255,255,${RIBBON.a * alpha})`);
  g.addColorStop(0.43, `rgba(${pink},${RIBBON.a * 0.95 * alpha})`);
  g.addColorStop(0.57, `rgba(255,255,255,${RIBBON.a * alpha})`);
  g.addColorStop(0.75, `rgba(${green},${RIBBON.a * 0.95 * alpha})`);
  g.addColorStop(0.9, `rgba(255,255,255,${RIBBON.a * 0.7 * alpha})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(255,255,255,.5)";
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.restore();
}
