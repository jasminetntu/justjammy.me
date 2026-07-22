import { drawRibbon, drawStar } from "@/lib/canvas/draw";
import {
  makeBurst,
  makeShootingStar,
  makeTrailSpark,
  stepSparks,
  type ShootingStar,
  type Spark,
} from "@/lib/canvas/particles";
import { cloneWash, stepWash, WASH_POS, WASH_SETS, washSpeed, type Wash } from "@/lib/canvas/wash";
import { logDebug } from "@/lib/log";
import type { View } from "@/lib/views";

// full-viewport ambient engine: color washes, wispy ribbon, sparkle cursor,
// click bursts, and contact shooting stars. one instance lives for the whole
// session; the current route only changes its wash mood.
export class FxEngine {
  private bg: HTMLCanvasElement | null = null;
  private sp: HTMLCanvasElement | null = null;
  private bgx: CanvasRenderingContext2D | null = null;
  private spx: CanvasRenderingContext2D | null = null;

  private W = 0;
  private H = 0;
  private t0 = 0;
  private raf = 0;
  private ambientTimer: ReturnType<typeof setInterval> | null = null;

  private view: View = "garden";
  private washCur: Wash = cloneWash(WASH_SETS.garden);
  private washTarget: Wash = WASH_SETS.garden;
  private washOverride: Wash | null = null;
  private ribbonAlpha = 1;
  // when the user prefers reduced motion: static washes + ribbon, no parallax,
  // no cursor/ambient sparkles, no shooting stars or click bursts
  private reduced = false;

  private sparks: Spark[] = [];
  private shoots: ShootingStar[] = [];

  readonly pointer = { x: 0, y: 0, nx: 0, ny: 0 };
  private lastTrail: { x: number; y: number } | null = null;

  mount(bg: HTMLCanvasElement, sp: HTMLCanvasElement): void {
    this.bg = bg;
    this.sp = sp;
    this.bgx = bg.getContext("2d");
    this.spx = sp.getContext("2d");
    this.pointer.x = window.innerWidth / 2;
    this.pointer.y = window.innerHeight / 2;
    this.t0 = performance.now();

    this.reduced =
      typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.onResize();
    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onMove, { passive: true });
    // ambient drifting sparkles — skipped entirely under reduced motion
    if (!this.reduced) {
      this.ambientTimer = setInterval(() => {
        if (Math.random() < 0.7) {
          this.sparks.push(makeTrailSpark(Math.random() * this.W, Math.random() * this.H * 0.85, null, true));
        }
      }, 900);
    }
    this.raf = requestAnimationFrame(this.loop);
    logDebug("fx.mount", { w: this.W, h: this.H });
  }

  unmount(): void {
    cancelAnimationFrame(this.raf);
    if (this.ambientTimer) clearInterval(this.ambientTimer);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onMove);
    this.bg = this.sp = null;
    this.bgx = this.spx = null;
    logDebug("fx.unmount");
  }

  setView(view: View): void {
    if (view === this.view) return;
    logDebug("fx.view", { from: this.view, to: view });
    this.view = view;
    this.washOverride = null;
    this.washTarget = WASH_SETS[view];
  }

  // scroll-driven mood shifts (experience page) temporarily override the view wash
  setWashOverride(wash: Wash | null): void {
    this.washOverride = wash;
    this.washTarget = wash ?? WASH_SETS[this.view];
  }

  burst(x: number, y: number, col: string, n: number, col2?: string): void {
    if (this.reduced) return;
    this.sparks.push(...makeBurst(x, y, col, n, col2));
  }

  launchShoot(): void {
    if (this.reduced) return;
    this.shoots.push(makeShootingStar(this.W));
  }

  private onResize = (): void => {
    if (!this.bg || !this.sp || !this.bgx || !this.spx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const c of [this.bg, this.sp]) {
      c.width = w * dpr;
      c.height = h * dpr;
    }
    this.bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.spx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = w;
    this.H = h;
  };

  private onMove = (e: PointerEvent): void => {
    const { clientX: px, clientY: py } = e;
    this.pointer.x = px;
    this.pointer.y = py;
    this.pointer.nx = (px / window.innerWidth - 0.5) * 2;
    this.pointer.ny = (py / window.innerHeight - 0.5) * 2;
    if (this.reduced) return;
    // sparkle cursor trail — one spark every ~16px of travel
    if (!this.lastTrail) this.lastTrail = { x: px, y: py };
    if (Math.hypot(px - this.lastTrail.x, py - this.lastTrail.y) > 16) {
      this.lastTrail = { x: px, y: py };
      this.sparks.push(makeTrailSpark(px + (Math.random() * 8 - 4), py + (Math.random() * 8 - 4)));
    }
  };

  private loop = (now: number): void => {
    const x = this.bgx;
    const s = this.spx;
    if (!x || !s) return;
    const t = (now - this.t0) / 1000;
    const { W, H } = this;

    x.clearRect(0, 0, W, H);
    // reduced motion: snap the wash to its target (no lerp) and no parallax drift
    stepWash(this.washCur, this.washTarget, this.reduced ? 1 : washSpeed(this.view));

    // washes drift with cursor parallax
    const ppx = this.reduced ? 0 : this.pointer.nx * 26;
    const ppy = this.reduced ? 0 : this.pointer.ny * 26;
    this.washCur.forEach((c, i) => {
      const p = WASH_POS[i];
      const cx = p.x * W + ppx * (p.y > 0.5 ? -1 : 1);
      const cy = p.y * H + ppy * (p.x > 0.5 ? -1 : 1);
      const rad = p.r * Math.max(W, H);
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3]})`);
      g.addColorStop(0.55, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3] * 0.4})`);
      g.addColorStop(1, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},0)`);
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
    });

    // ribbon fades out where it would fight the content (the full-bleed design wall)
    const ribTgt = this.view === "design" ? 0 : 1;
    this.ribbonAlpha += (ribTgt - this.ribbonAlpha) * 0.04;
    // reduced motion: draw the ribbon frozen (fixed time, no pointer sway)
    if (this.ribbonAlpha > 0.01)
      drawRibbon(x, this.reduced ? 8 : t, W, H, this.ribbonAlpha, this.reduced ? 0 : this.pointer.ny);

    s.clearRect(0, 0, W, H);
    stepSparks(this.sparks);
    for (const p of this.sparks) {
      drawStar(s, p.x, p.y, p.size * p.life, p.rot, p.col, Math.max(0, p.life) * 0.95);
    }

    this.stepShoots(s, t);
    this.raf = requestAnimationFrame(this.loop);
  };

  private stepShoots(s: CanvasRenderingContext2D, t: number): void {
    const { W, H } = this;
    for (let k = this.shoots.length - 1; k >= 0; k--) {
      const sh = this.shoots[k];
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.life -= 0.0065;
      sh.trail.push({ x: sh.x, y: sh.y });
      if (sh.trail.length > 20) sh.trail.shift();
      // sprinkle sparks along the tail
      if (Math.random() < 0.7) {
        this.sparks.push({
          x: sh.x + (Math.random() * 6 - 3),
          y: sh.y + (Math.random() * 6 - 3),
          vx: -sh.vx * 0.04,
          vy: -sh.vy * 0.04 + 0.03,
          life: 1,
          max: 0.7,
          size: 2 + Math.random() * 2.5,
          rot: Math.random() * 6.28,
          col: Math.random() < 0.5 ? "#f0cfe0" : "#ffffff",
        });
      }
      const off = sh.x < -70 || sh.x > W + 70 || sh.y > H + 70;
      if (sh.life <= 0 || off) {
        if (!off) this.burst(sh.x, sh.y, "#e2a7c4", 14, "#ffffff");
        this.shoots.splice(k, 1);
      }
    }
    for (const sh of this.shoots) {
      if (sh.trail.length > 1) {
        s.save();
        for (let i = 1; i < sh.trail.length; i++) {
          const a = sh.trail[i - 1];
          const b = sh.trail[i];
          const f = i / sh.trail.length;
          s.strokeStyle = `rgba(255,255,255,${f * 0.55 * sh.life})`;
          s.lineWidth = f * 3.4;
          s.lineCap = "round";
          s.beginPath();
          s.moveTo(a.x, a.y);
          s.lineTo(b.x, b.y);
          s.stroke();
        }
        s.restore();
      }
      drawStar(s, sh.x, sh.y, 10, t * 4, "#ffffff", 0.98 * Math.min(1, sh.life * 1.6));
    }
  }
}
