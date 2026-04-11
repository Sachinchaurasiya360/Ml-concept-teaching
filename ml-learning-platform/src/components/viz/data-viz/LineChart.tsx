"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAxisSystem } from "./AxisSystem";
import { Legend } from "./Legend";
import { PALETTE, FG, type ChartProps, type Series } from "./types";
import { extent, linePath, smoothPath } from "./scales";

export interface LineChartProps extends ChartProps {
  series: Series[];
  smooth?: boolean;
  showArea?: boolean;
  /** Show dots at each data point. */
  showPoints?: boolean;
  /** Animate line drawing on mount. */
  animateOnMount?: boolean;
}

/** Multi-series line chart with optional smoothing, area, and draw-in animation. */
export function LineChart({
  series,
  width = 500,
  height = 300,
  title,
  xLabel,
  yLabel,
  smooth = false,
  showArea = false,
  showPoints = true,
  animateOnMount = true,
}: LineChartProps) {
  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    series.forEach((s) =>
      s.data.forEach((d) => {
        xs.push(d.x);
        ys.push(d.y);
      }),
    );
    const [xMin, xMax] = extent(xs, 0.02);
    const [yMin, yMax] = extent(ys, 0.08);
    return { xMin, xMax, yMin, yMax };
  }, [series]);

  const axis = useAxisSystem({
    xMin,
    xMax,
    yMin,
    yMax,
    width,
    height,
    xLabel,
    yLabel,
    title,
  });

  // For stroke-dasharray animation we need path lengths.
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [lengths, setLengths] = useState<number[]>([]);
  const [drawn, setDrawn] = useState(!animateOnMount);

  useEffect(() => {
    const ls = pathRefs.current.map((p) => (p ? p.getTotalLength() : 0));
    setLengths(ls);
    if (!animateOnMount) {
      setDrawn(true);
      return;
    }
    setDrawn(false);
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [series, animateOnMount]);

  const zeroY = axis.yScale(Math.max(yMin, 0));

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={title ?? "line chart"}
      >
        {axis.node}

        {series.map((s, si) => {
          const color = s.color ?? PALETTE[si % PALETTE.length];
          const sorted = [...s.data].sort((a, b) => a.x - b.x);
          const pts = sorted.map((d) => ({
            x: axis.xScale(d.x),
            y: axis.yScale(d.y),
          }));
          if (pts.length === 0) return null;
          const d = smooth ? smoothPath(pts) : linePath(pts);
          const areaD =
            pts.length > 0
              ? `${d} L ${pts[pts.length - 1].x} ${zeroY} L ${pts[0].x} ${zeroY} Z`
              : "";

          const len = lengths[si] ?? 1000;
          const dashStyle =
            animateOnMount
              ? {
                  strokeDasharray: len,
                  strokeDashoffset: drawn ? 0 : len,
                  transition: "stroke-dashoffset 900ms ease",
                }
              : undefined;

          return (
            <g key={`s-${si}`}>
              {showArea ? (
                <path
                  d={areaD}
                  fill={color}
                  opacity={0.18}
                  stroke="none"
                  style={{
                    opacity: drawn ? 0.18 : 0,
                    transition: "opacity 900ms ease",
                  }}
                />
              ) : null}
              <path
                ref={(el) => {
                  pathRefs.current[si] = el;
                }}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={dashStyle}
              />
              {showPoints
                ? pts.map((p, i) => (
                    <circle
                      key={`pt-${si}-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={3.5}
                      fill={color}
                      stroke={FG}
                      strokeWidth={2}
                      style={{
                        opacity: drawn ? 1 : 0,
                        transition: `opacity 200ms ease ${i * 20 + 400}ms`,
                      }}
                    />
                  ))
                : null}
            </g>
          );
        })}
      </svg>

      {series.length > 1 ? (
        <div style={{ marginTop: 6 }}>
          <Legend
            items={series.map((s, i) => ({
              label: s.name,
              color: s.color ?? PALETTE[i % PALETTE.length],
              shape: "line",
            }))}
          />
        </div>
      ) : null}
    </div>
  );
}

export default LineChart;
