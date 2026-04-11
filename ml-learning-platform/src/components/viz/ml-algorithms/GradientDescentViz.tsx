"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, StepForward } from "lucide-react";
import { formatNum, makeProjector, VIEWBOX } from "./utils";

export type GradientDescentVizProps = {
  lossFn?: (w: number, b: number) => number;
  initialLearningRate?: number;
  startPoint?: [number, number];
};

// Default loss surface: a skewed quadratic bowl with a single minimum.
// w and b range over [0, 100] in our logical coordinate system.
function defaultLoss(w: number, b: number) {
  const dw = (w - 55) / 18;
  const db = (b - 48) / 26;
  return dw * dw + db * db + 0.5 * dw * db;
}

// Numeric gradient
function grad(fn: (w: number, b: number) => number, w: number, b: number) {
  const h = 0.5;
  const dfw = (fn(w + h, b) - fn(w - h, b)) / (2 * h);
  const dfb = (fn(w, b + h) - fn(w, b - h)) / (2 * h);
  return [dfw, dfb] as const;
}

export default function GradientDescentViz({
  lossFn = defaultLoss,
  initialLearningRate = 4,
  startPoint = [20, 80],
}: GradientDescentVizProps) {
  const [lr, setLr] = useState(initialLearningRate);
  const [pos, setPos] = useState<[number, number]>(startPoint);
  const [trail, setTrail] = useState<[number, number][]>([startPoint]);
  const [playing, setPlaying] = useState(false);

  const proj = makeProjector(VIEWBOX, 6);

  // Pre-compute contour cells once per loss function.
  const contour = useMemo(() => {
    const cells: { x: number; y: number; v: number }[] = [];
    const step = 3;
    let minV = Infinity;
    let maxV = -Infinity;
    for (let gx = 0; gx < 100; gx += step) {
      for (let gy = 0; gy < 100; gy += step) {
        const v = lossFn(gx + step / 2, gy + step / 2);
        cells.push({ x: gx, y: gy, v });
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      }
    }
    return { cells, minV, maxV, step };
  }, [lossFn]);

  const step = useCallback(() => {
    setPos((curr) => {
      const [w, b] = curr;
      const [gw, gb] = grad(lossFn, w, b);
      const nw = Math.max(0, Math.min(100, w - lr * gw));
      const nb = Math.max(0, Math.min(100, b - lr * gb));
      setTrail((t) => [...t.slice(-200), [nw, nb]]);
      return [nw, nb];
    });
  }, [lr, lossFn]);

  const playingRef = useRef(playing);
  playingRef.current = playing;
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => playingRef.current && step(), 120);
    return () => clearTimeout(t);
  }, [playing, trail.length, step]);

  function reset() {
    setPos(startPoint);
    setTrail([startPoint]);
    setPlaying(false);
  }

  const currLoss = lossFn(pos[0], pos[1]);

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-hand text-2xl">Gradient Descent</h3>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-sketchy-outline" onClick={step}>
            <StepForward size={16} />
            Step
          </button>
          <button
            type="button"
            className="btn-sketchy"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? "Pause" : "Play"}
          </button>
          <button type="button" className="btn-sketchy-outline" onClick={reset}>
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_220px] gap-4">
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="w-full h-auto bg-background border-2 border-foreground rounded-xl"
        >
          {contour.cells.map((c, i) => {
            const t =
              (c.v - contour.minV) / Math.max(1e-6, contour.maxV - contour.minV);
            // Low loss = mint, high loss = coral.
            const color =
              t < 0.5 ? "var(--accent-mint)" : "var(--accent-coral)";
            const opacity = 0.15 + t * 0.55;
            return (
              <rect
                key={`c-${i}`}
                x={proj.px(c.x)}
                y={proj.py(c.y + contour.step)}
                width={proj.px(c.x + contour.step) - proj.px(c.x)}
                height={proj.py(c.y) - proj.py(c.y + contour.step)}
                fill={color}
                fillOpacity={opacity}
              />
            );
          })}

          {/* trail */}
          {trail.length > 1 && (
            <polyline
              points={trail
                .map(([w, b]) => `${proj.px(w)},${proj.py(b)}`)
                .join(" ")}
              fill="none"
              stroke="#2b2a35"
              strokeWidth={0.9}
              strokeDasharray="3 2"
            />
          )}
          {trail.map(([w, b], i) => (
            <circle
              key={`t-${i}`}
              cx={proj.px(w)}
              cy={proj.py(b)}
              r={0.8}
              fill="#2b2a35"
            />
          ))}

          <circle
            cx={proj.px(pos[0])}
            cy={proj.py(pos[1])}
            r={2.5}
            fill="var(--accent-yellow)"
            stroke="#2b2a35"
            strokeWidth={1.1}
          />
        </svg>

        <div className="font-hand space-y-3 text-sm">
          <div>
            <label>learning rate = {formatNum(lr, 2)}</label>
            <input
              type="range"
              min={0.1}
              max={10}
              step={0.1}
              value={lr}
              onChange={(e) => setLr(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="p-2 border-2 border-dashed border-foreground/60 rounded-md">
            loss: <span className="font-bold">{formatNum(currLoss, 3)}</span>
            <div className="text-xs text-muted-foreground mt-1">
              steps: {trail.length - 1}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            each step moves the yellow ball opposite the gradient. too high a
            learning rate and it will overshoot!
          </p>
        </div>
      </div>
    </div>
  );
}
