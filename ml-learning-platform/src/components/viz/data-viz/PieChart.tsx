"use client";

import { useEffect, useMemo, useState } from "react";
import { Legend } from "./Legend";
import { PALETTE, FG, type ChartProps, type PieDatum } from "./types";

export interface PieChartProps extends ChartProps {
  data: PieDatum[];
  /** Inner radius (0 for full pie, >0 for donut). */
  innerRadius?: number;
  /** Animate slice sweep-in on mount. */
  animateOnMount?: boolean;
  /** Show percent labels on slices. */
  showLabels?: boolean;
}

/** Animated pie/donut chart with built-in legend. */
export function PieChart({
  data,
  width = 400,
  height = 400,
  title,
  innerRadius = 0,
  animateOnMount = true,
  showLabels = true,
}: PieChartProps) {
  const [progress, setProgress] = useState(animateOnMount ? 0 : 1);

  useEffect(() => {
    if (!animateOnMount) return;
    let raf: number;
    const start = performance.now();
    const duration = 800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // ease out
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animateOnMount, data]);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + Math.max(0, d.value), 0),
    [data],
  );

  const cx = width / 2;
  const cy = height / 2 + (title ? 10 : 0);
  const r = Math.min(width, height) / 2 - 40;
  const ir = Math.max(0, Math.min(r - 6, innerRadius));

  if (total <= 0 || data.length === 0) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          className="font-hand"
          fontSize={14}
          fill={FG}
        >
          no data
        </text>
      </svg>
    );
  }

  let angle = -Math.PI / 2; // start at top
  const slices = data.map((d, i) => {
    const frac = Math.max(0, d.value) / total;
    const sweep = frac * Math.PI * 2;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return {
      start,
      end,
      frac,
      color: d.color ?? PALETTE[i % PALETTE.length],
      label: d.label,
      value: d.value,
    };
  });

  const endProgress = progress; // 0..1
  const visibleEnd = -Math.PI / 2 + endProgress * Math.PI * 2;

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={title ?? "pie chart"}
      >
        {title ? (
          <text
            x={cx}
            y={20}
            textAnchor="middle"
            className="font-hand"
            fontSize={16}
            fontWeight={700}
            fill={FG}
          >
            {title}
          </text>
        ) : null}

        {slices.map((s, i) => {
          // Clip slice to the current animation end.
          const start = s.start;
          const end = Math.min(s.end, visibleEnd);
          if (end <= start) return null;
          return (
            <g key={`slice-${i}`}>
              <path
                d={slicePath(cx, cy, r, ir, start, end)}
                fill={s.color}
                stroke={FG}
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
              {showLabels && end === s.end && s.frac > 0.04 ? (
                (() => {
                  const mid = (start + end) / 2;
                  const lr = (r + ir) / 2;
                  const lx = cx + Math.cos(mid) * lr;
                  const ly = cy + Math.sin(mid) * lr;
                  return (
                    <text
                      x={lx}
                      y={ly + 4}
                      textAnchor="middle"
                      className="font-hand"
                      fontSize={12}
                      fontWeight={700}
                      fill={FG}
                    >
                      {Math.round(s.frac * 100)}%
                    </text>
                  );
                })()
              ) : null}
            </g>
          );
        })}
      </svg>

      <div style={{ marginTop: 6 }}>
        <Legend
          items={slices.map((s) => ({
            label: s.label,
            color: s.color,
            shape: "square",
          }))}
        />
      </div>
    </div>
  );
}

function slicePath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  a0: number,
  a1: number,
): string {
  const x0 = cx + Math.cos(a0) * rOuter;
  const y0 = cy + Math.sin(a0) * rOuter;
  const x1 = cx + Math.cos(a1) * rOuter;
  const y1 = cy + Math.sin(a1) * rOuter;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  if (rInner <= 0) {
    return `M ${cx} ${cy} L ${x0} ${y0} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1} Z`;
  }
  const ix0 = cx + Math.cos(a0) * rInner;
  const iy0 = cy + Math.sin(a0) * rInner;
  const ix1 = cx + Math.cos(a1) * rInner;
  const iy1 = cy + Math.sin(a1) * rInner;
  return `M ${x0} ${y0} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${rInner} ${rInner} 0 ${large} 0 ${ix0} ${iy0} Z`;
}

export default PieChart;
