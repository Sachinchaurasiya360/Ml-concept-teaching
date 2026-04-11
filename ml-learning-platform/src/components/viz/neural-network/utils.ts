// Shared math + layout helpers for the neural network viz components.
import { mulberry32 } from "./mulberry32";

export type ActivationName = "sigmoid" | "relu" | "tanh" | "linear" | "softmax";

/** Apply a scalar activation function. Softmax is treated as linear here
 *  because it only makes sense across a whole layer; use softmaxVec for that. */
export function activate(name: ActivationName, x: number): number {
  if (!Number.isFinite(x)) return 0;
  switch (name) {
    case "sigmoid":
      // Numerically stable sigmoid.
      if (x >= 0) {
        const z = Math.exp(-x);
        return 1 / (1 + z);
      }
      const z = Math.exp(x);
      return z / (1 + z);
    case "relu":
      return Math.max(0, x);
    case "tanh":
      return Math.tanh(x);
    case "softmax":
    case "linear":
    default:
      return x;
  }
}

/** Derivative of the activation function, evaluated at the pre-activation x. */
export function activateDerivative(name: ActivationName, x: number): number {
  switch (name) {
    case "sigmoid": {
      const s = activate("sigmoid", x);
      return s * (1 - s);
    }
    case "relu":
      return x > 0 ? 1 : 0;
    case "tanh": {
      const t = Math.tanh(x);
      return 1 - t * t;
    }
    case "softmax":
    case "linear":
    default:
      return 1;
  }
}

/** Softmax across a vector. */
export function softmaxVec(xs: number[]): number[] {
  if (xs.length === 0) return [];
  const max = Math.max(...xs);
  const exps = xs.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
}

/** Weighted sum + bias (dot product). */
export function weightedSum(inputs: number[], weights: number[], bias = 0): number {
  const n = Math.min(inputs.length, weights.length);
  let s = bias;
  for (let i = 0; i < n; i++) s += inputs[i] * weights[i];
  return s;
}

/** Round to N decimal places for stable display. */
export function round(x: number, digits = 2): number {
  if (!Number.isFinite(x)) return 0;
  const p = Math.pow(10, digits);
  return Math.round(x * p) / p;
}

/** Format a number for display in SVG labels. */
export function fmt(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return "–";
  const r = round(x, digits);
  // Avoid "-0.00"
  if (Object.is(r, -0)) return (0).toFixed(digits);
  return r.toFixed(digits);
}

/** Clamp a value to a range. */
export function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

/** Compute the (x, y) position for a neuron in a layered layout. */
export function neuronPosition(
  layerIndex: number,
  neuronIndex: number,
  layerCount: number,
  layerSize: number,
  width: number,
  height: number,
  padding = 60,
): { x: number; y: number } {
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const xStep = layerCount > 1 ? innerW / (layerCount - 1) : 0;
  const x = padding + layerIndex * xStep;
  if (layerSize === 1) {
    return { x, y: height / 2 };
  }
  const yStep = innerH / (layerSize - 1);
  const y = padding + neuronIndex * yStep;
  return { x, y };
}

/** Color for a weight: mint for positive, coral for negative. */
export function weightColor(w: number): string {
  return w >= 0 ? "var(--accent-mint)" : "var(--accent-coral)";
}

/** Thickness for a weight line based on magnitude. */
export function weightStroke(w: number, maxAbs = 2): number {
  const mag = Math.min(1, Math.abs(w) / maxAbs);
  return 0.8 + mag * 3.2;
}

/** Build a reproducible set of random weights for a given architecture. */
export function makeRandomWeights(layers: number[], seed = 7): number[][][] {
  const rand = mulberry32(seed);
  const out: number[][][] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    const prev = layers[l];
    const curr = layers[l + 1];
    const layerW: number[][] = [];
    for (let j = 0; j < curr; j++) {
      const row: number[] = [];
      for (let i = 0; i < prev; i++) {
        row.push(round((rand() - 0.5) * 2.4, 2));
      }
      layerW.push(row);
    }
    out.push(layerW);
  }
  return out;
}

/** Perform a full forward pass. Returns activations for every layer including inputs. */
export function forwardPass(
  inputs: number[],
  weights: number[][][],
  activations?: ActivationName[],
): number[][] {
  const acts: number[][] = [inputs.slice()];
  for (let l = 0; l < weights.length; l++) {
    const layerW = weights[l];
    const prev = acts[l];
    const actName: ActivationName = activations?.[l] ?? "sigmoid";
    const next: number[] = [];
    for (let j = 0; j < layerW.length; j++) {
      const row = layerW[j];
      let s = 0;
      for (let i = 0; i < row.length && i < prev.length; i++) {
        s += prev[i] * row[i];
      }
      next.push(activate(actName, s));
    }
    acts.push(next);
  }
  return acts;
}

/** Simple hand-drawn looking jitter for sketchy paths. */
export function jitter(seed: number, amount = 1.5): number {
  const r = mulberry32(seed)();
  return (r - 0.5) * amount * 2;
}

/** Build a slightly-jittery cubic path between two points for a "hand drawn" feel. */
export function sketchyPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed = 1,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const j1 = jitter(seed, 6);
  const j2 = jitter(seed + 17, 6);
  const cx1 = x1 + dx * 0.33 + j1;
  const cy1 = y1 + dy * 0.33 + j2;
  const cx2 = x1 + dx * 0.66 - j2;
  const cy2 = y1 + dy * 0.66 - j1;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}
