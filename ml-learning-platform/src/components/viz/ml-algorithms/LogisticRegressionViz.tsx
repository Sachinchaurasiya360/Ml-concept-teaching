"use client";

import { useMemo, useState } from "react";
import {
  generateClassification2D,
  CLUSTER_COLORS,
  type Point,
} from "./dataGenerator";
import { formatNum, makeProjector, sigmoid, VIEWBOX } from "./utils";

export type LogisticRegressionVizProps = {
  data?: Point[];
};

export default function LogisticRegressionViz({
  data: propData,
}: LogisticRegressionVizProps) {
  const defaultData = useMemo(() => generateClassification2D(40, 13), []);
  const data = propData ?? defaultData;

  // We parameterize: P(y=1) = sigmoid(w1*x + w2*y + b)
  // Use x/100 and y/100 internally so weights stay in a reasonable range.
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(1);
  const [b, setB] = useState(-1);
  const [threshold, setThreshold] = useState(0.5);

  const proj = makeProjector(VIEWBOX, 6);

  const accuracy = useMemo(() => {
    if (data.length === 0) return 0;
    let correct = 0;
    for (const p of data) {
      const z = (w1 * p.x) / 100 + (w2 * p.y) / 100 + b;
      const pred = sigmoid(z) >= threshold ? 1 : 0;
      if (pred === (p.label ?? 0)) correct++;
    }
    return correct / data.length;
  }, [data, w1, w2, b, threshold]);

  // Probability field rendered as a coarse grid.
  const gridCells = useMemo(() => {
    const cells: { x: number; y: number; p: number }[] = [];
    const step = 4;
    for (let gx = 0; gx < 100; gx += step) {
      for (let gy = 0; gy < 100; gy += step) {
        const cx = gx + step / 2;
        const cy = gy + step / 2;
        const z = (w1 * cx) / 100 + (w2 * cy) / 100 + b;
        cells.push({ x: gx, y: gy, p: sigmoid(z) });
      }
    }
    return cells;
  }, [w1, w2, b]);

  // Decision boundary: w1/100 * x + w2/100 * y + b = logit(threshold)
  // => y = (logit(thr) - b - (w1/100)*x) / (w2/100)
  const logitT = Math.log(threshold / (1 - threshold));
  function boundaryY(x: number) {
    if (Math.abs(w2) < 1e-6) return null;
    return ((logitT - b - (w1 * x) / 100) * 100) / w2;
  }

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-hand text-2xl">Logistic Regression</h3>
      </div>

      <div className="grid md:grid-cols-[1fr_240px] gap-4">
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="w-full h-auto bg-background border-2 border-foreground rounded-xl"
        >
          {gridCells.map((c, i) => {
            // Blue (class 1) to coral (class 0).
            const p = c.p;
            const r = Math.round(255 * (1 - p) * 0.4 + 107 * p * 0.4 + 180);
            // Use CSS colors via two layered rects.
            const opacity = Math.abs(p - 0.5) * 1.2;
            const fill =
              p >= 0.5 ? "var(--accent-sky)" : "var(--accent-coral)";
            return (
              <rect
                key={`g-${i}`}
                x={proj.px(c.x)}
                y={proj.py(c.y + 4)}
                width={proj.px(c.x + 4) - proj.px(c.x)}
                height={proj.py(c.y) - proj.py(c.y + 4)}
                fill={fill}
                fillOpacity={Math.min(0.55, opacity)}
                data-r={r}
              />
            );
          })}

          {/* boundary line */}
          {Math.abs(w2) > 1e-6 &&
            (() => {
              const y0 = boundaryY(0);
              const y100 = boundaryY(100);
              if (y0 === null || y100 === null) return null;
              return (
                <line
                  x1={proj.px(0)}
                  y1={proj.py(y0)}
                  x2={proj.px(100)}
                  y2={proj.py(y100)}
                  stroke="#2b2a35"
                  strokeWidth={1.1}
                  strokeDasharray="3 2"
                />
              );
            })()}

          {/* points */}
          {data.map((p, i) => (
            <circle
              key={`p-${i}`}
              cx={proj.px(p.x)}
              cy={proj.py(p.y)}
              r={1.8}
              fill={CLUSTER_COLORS[p.label ?? 0]}
              stroke="#2b2a35"
              strokeWidth={0.7}
            />
          ))}
        </svg>

        <div className="font-hand space-y-2">
          <div>
            <label>w₁ = {formatNum(w1, 2)}</label>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.05}
              value={w1}
              onChange={(e) => setW1(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label>w₂ = {formatNum(w2, 2)}</label>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.05}
              value={w2}
              onChange={(e) => setW2(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label>bias b = {formatNum(b, 2)}</label>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.05}
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label>threshold = {formatNum(threshold, 2)}</label>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.01}
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="p-2 border-2 border-dashed border-foreground/60 rounded-md text-sm">
            accuracy:{" "}
            <span className="font-bold">{formatNum(accuracy * 100, 1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
