// Shared helpers for the ML algorithms visualizers.
import type { Point } from "./dataGenerator";

export const VIEWBOX = 100; // all components use a 100x100 logical coordinate space

export function euclidean(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function manhattan(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function distance(a: Point, b: Point, metric: "euclidean" | "manhattan") {
  return metric === "euclidean" ? euclidean(a, b) : manhattan(a, b);
}

// Project logical [0, 100] x to SVG coordinates with a margin.
export function makeProjector(size: number, margin = 8) {
  const usable = size - margin * 2;
  return {
    px: (x: number) => margin + (x / 100) * usable,
    py: (y: number) => size - (margin + (y / 100) * usable), // flip Y (math-up)
    invX: (px: number) => ((px - margin) / usable) * 100,
    invY: (py: number) => ((size - py - margin) / usable) * 100,
  };
}

export function formatNum(n: number, digits = 2) {
  if (!isFinite(n)) return "-";
  return n.toFixed(digits);
}

export function majorityLabel(labels: number[]): number {
  const counts = new Map<number, number>();
  for (const l of labels) counts.set(l, (counts.get(l) ?? 0) + 1);
  let best = labels[0] ?? 0;
  let bestCount = -1;
  for (const [label, c] of counts) {
    if (c > bestCount) {
      best = label;
      bestCount = c;
    }
  }
  return best;
}

// Closed-form ordinary least squares for 2D (x, y).
export function leastSquares(points: Point[]): { slope: number; intercept: number } {
  if (points.length < 2) return { slope: 0, intercept: 50 };
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-9) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function sigmoid(z: number) {
  if (z >= 0) {
    const e = Math.exp(-z);
    return 1 / (1 + e);
  }
  const e = Math.exp(z);
  return e / (1 + e);
}

// Wiggle a path a tiny bit for that hand-drawn feel (unused in most components but handy).
export function jitter(rand: () => number, n: number) {
  return (rand() - 0.5) * n;
}
