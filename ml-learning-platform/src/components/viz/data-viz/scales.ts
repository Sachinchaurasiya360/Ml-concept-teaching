"use client";

/** Shared scale + math helpers used across the data-viz toolkit. */

/** Linear scale: maps domain [d0, d1] to range [r0, r1]. */
export function linearScale(
  d0: number,
  d1: number,
  r0: number,
  r1: number,
): (v: number) => number {
  if (d0 === d1) {
    const mid = (r0 + r1) / 2;
    return () => mid;
  }
  const m = (r1 - r0) / (d1 - d0);
  return (v: number) => r0 + (v - d0) * m;
}

/** Compute a "nice" step for axis ticks given approximate target count. */
export function niceStep(range: number, target = 5): number {
  if (range <= 0 || !Number.isFinite(range)) return 1;
  const raw = range / Math.max(1, target);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let step: number;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * mag;
}

/** Generate an array of tick values in [min, max] using a nice step. */
export function niceTicks(min: number, max: number, target = 5): number[] {
  if (min === max) return [min];
  const step = niceStep(max - min, target);
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 1e-9; v += step) {
    // Round-trip to avoid tiny float ugliness.
    ticks.push(Math.round(v / step) * step);
  }
  return ticks;
}

/** Format a number for a tick label. */
export function formatTick(v: number): string {
  if (!Number.isFinite(v)) return "";
  if (Math.abs(v) >= 1000) return v.toLocaleString();
  if (Number.isInteger(v)) return String(v);
  const abs = Math.abs(v);
  if (abs < 0.01) return v.toExponential(1);
  if (abs < 1) return v.toFixed(2);
  return v.toFixed(1);
}

/** Domain extent with a little padding. */
export function extent(values: number[], pad = 0.05): [number, number] {
  if (values.length === 0) return [0, 1];
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    const d = Math.abs(min) < 1e-9 ? 1 : Math.abs(min) * 0.5;
    return [min - d, max + d];
  }
  const span = max - min;
  return [min - span * pad, max + span * pad];
}

/** Simple linear regression: returns slope, intercept, or null when degenerate. */
export function linearRegression(
  xs: number[],
  ys: number[],
): { slope: number; intercept: number } | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
  }
  const mx = sx / n;
  const my = sy / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    num += dx * (ys[i] - my);
    den += dx * dx;
  }
  if (den === 0) return null;
  const slope = num / den;
  return { slope, intercept: my - slope * mx };
}

/** Quantile (linear interpolation) on a sorted copy. */
export function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/** Summary statistics used by BoxPlot/Histogram. */
export function summarize(values: number[]): {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
} {
  if (values.length === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0 };
  }
  const s = [...values].filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  const mean = s.reduce((acc, v) => acc + v, 0) / s.length;
  return {
    min: s[0],
    q1: quantile(s, 0.25),
    median: quantile(s, 0.5),
    q3: quantile(s, 0.75),
    max: s[s.length - 1],
    mean,
  };
}

/**
 * Build a Catmull-Rom smooth SVG path through points (in pixel coords).
 * Falls back to a polyline when fewer than 3 points.
 */
export function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y}`;
  }
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

/** Straight polyline path. */
export function linePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
}

/**
 * A mildly jittered line for hand-drawn feel. Deterministic by seed so it
 * doesn't wobble on re-render.
 */
export function sketchLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed = 1,
  wobble = 1.5,
): string {
  const r = mulberry(seed);
  const mx = (x1 + x2) / 2 + (r() - 0.5) * wobble * 2;
  const my = (y1 + y2) / 2 + (r() - 0.5) * wobble * 2;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

/** Tiny deterministic PRNG (mulberry32). */
export function mulberry(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Clamp helper. */
export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
