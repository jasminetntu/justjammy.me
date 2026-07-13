// spark + shooting-star particle models; pure state, no canvas access

export interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
  max: number; // lifetime scale
  size: number;
  rot: number;
  col: string;
}

export interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  trail: { x: number; y: number }[];
}

export function makeTrailSpark(x: number, y: number, col?: string | null, ambient?: boolean): Spark {
  return {
    x,
    y,
    vx: (Math.random() * 2 - 1) * 0.3,
    vy: ambient ? -0.15 - Math.random() * 0.2 : -0.35 - Math.random() * 0.5,
    life: 1,
    max: ambient ? 1.4 : 0.7,
    size: ambient ? 2 + Math.random() * 3 : 3 + Math.random() * 4,
    rot: Math.random() * 6.28,
    col: col ?? (Math.random() < 0.35 ? "#f3cfe0" : "#ffffff"),
  };
}

export function makeBurst(x: number, y: number, col: string, n: number, col2?: string): Spark[] {
  const out: Spark[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28;
    const sp = 1.2 + Math.random() * 3;
    out.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 0.4,
      life: 1,
      max: 0.7 + Math.random() * 0.5,
      size: 2.5 + Math.random() * 4,
      rot: Math.random() * 6.28,
      col: col2 && Math.random() < 0.5 ? col2 : col,
    });
  }
  return out;
}

// advance physics one frame and drop dead sparks; mutates the array
export function stepSparks(sparks: Spark[]): void {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i];
    p.life -= 0.016 / p.max;
    if (p.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.012; // gentle gravity
    p.rot += 0.03;
  }
}

export function makeShootingStar(viewportW: number): ShootingStar {
  const sp = Math.max(7, viewportW * 0.006);
  const ang = 0.5 + Math.random() * 0.08;
  return {
    x: viewportW * (0.03 + Math.random() * 0.12),
    y: -40,
    vx: Math.cos(ang) * sp,
    vy: Math.sin(ang) * sp,
    life: 1,
    trail: [],
  };
}
