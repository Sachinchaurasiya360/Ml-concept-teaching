"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { generateLinearData, type Point } from "./dataGenerator";
import { formatNum, leastSquares, makeProjector, VIEWBOX } from "./utils";

export type LinearRegressionVizProps = {
  data?: Point[];
  showResiduals?: boolean;
  showMSE?: boolean;
};

export default function LinearRegressionViz({
  data: propData,
  showResiduals = true,
  showMSE = true,
}: LinearRegressionVizProps) {
  const defaultData = useMemo(() => generateLinearData(22, 0.6, 15, 8, 5), []);
  const data = propData ?? defaultData;

  const [slope, setSlope] = useState(0.2);
  const [intercept, setIntercept] = useState(30);
  const [animating, setAnimating] = useState(false);

  const proj = makeProjector(VIEWBOX, 6);

  const mse = useMemo(() => {
    if (data.length === 0) return 0;
    let sum = 0;
    for (const p of data) {
      const pred = slope * p.x + intercept;
      sum += (p.y - pred) ** 2;
    }
    return sum / data.length;
  }, [data, slope, intercept]);

  const optimal = useMemo(() => leastSquares(data), [data]);

  // Animate current (slope, intercept) toward target values.
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!animating) return;
    const start = performance.now();
    const from = { slope, intercept };
    const to = optimal;
    const duration = 650;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setSlope(from.slope + (to.slope - from.slope) * eased);
      setIntercept(from.intercept + (to.intercept - from.intercept) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAnimating(false);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animating]);

  const y0 = slope * 0 + intercept;
  const y100 = slope * 100 + intercept;

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-hand text-2xl">Linear Regression</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-sketchy"
            onClick={() => setAnimating(true)}
            disabled={animating}
          >
            <Sparkles size={16} />
            Fit
          </button>
          <button
            type="button"
            className="btn-sketchy-outline"
            onClick={() => {
              setAnimating(false);
              setSlope(0.2);
              setIntercept(30);
            }}
          >
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
          {/* axes */}
          <line
            x1={proj.px(0)}
            y1={proj.py(0)}
            x2={proj.px(100)}
            y2={proj.py(0)}
            stroke="#2b2a35"
            strokeWidth={0.6}
          />
          <line
            x1={proj.px(0)}
            y1={proj.py(0)}
            x2={proj.px(0)}
            y2={proj.py(100)}
            stroke="#2b2a35"
            strokeWidth={0.6}
          />

          {/* residuals */}
          {showResiduals &&
            data.map((p, i) => {
              const pred = slope * p.x + intercept;
              return (
                <line
                  key={`r-${i}`}
                  x1={proj.px(p.x)}
                  y1={proj.py(p.y)}
                  x2={proj.px(p.x)}
                  y2={proj.py(pred)}
                  stroke="var(--accent-coral)"
                  strokeWidth={0.6}
                  strokeDasharray="1.5 1"
                />
              );
            })}

          {/* regression line */}
          <line
            x1={proj.px(0)}
            y1={proj.py(y0)}
            x2={proj.px(100)}
            y2={proj.py(y100)}
            stroke="var(--accent-sky)"
            strokeWidth={1.4}
          />

          {/* data points */}
          {data.map((p, i) => (
            <circle
              key={`p-${i}`}
              cx={proj.px(p.x)}
              cy={proj.py(p.y)}
              r={1.7}
              fill="var(--accent-lav)"
              stroke="#2b2a35"
              strokeWidth={0.6}
            />
          ))}
        </svg>

        <div className="font-hand space-y-3">
          <div>
            <label htmlFor="lr-slope">slope (m) = {formatNum(slope, 2)}</label>
            <input
              id="lr-slope"
              type="range"
              min={-2}
              max={2}
              step={0.01}
              value={slope}
              onChange={(e) => setSlope(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="lr-int">
              intercept (b) = {formatNum(intercept, 1)}
            </label>
            <input
              id="lr-int"
              type="range"
              min={-20}
              max={100}
              step={0.5}
              value={intercept}
              onChange={(e) => setIntercept(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          {showMSE && (
            <div className="p-2 border-2 border-dashed border-foreground/60 rounded-md text-sm">
              MSE: <span className="font-bold">{formatNum(mse, 2)}</span>
              <div className="text-xs text-muted-foreground mt-1">
                optimal: m={formatNum(optimal.slope, 2)}, b=
                {formatNum(optimal.intercept, 1)}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            line equation: y = m·x + b. MSE = average squared residual.
          </p>
        </div>
      </div>
    </div>
  );
}
