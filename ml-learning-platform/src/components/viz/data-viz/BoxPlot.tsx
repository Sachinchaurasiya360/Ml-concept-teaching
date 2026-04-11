"use client";

import { useMemo } from "react";
import { useAxisSystem } from "./AxisSystem";
import { PALETTE, FG, type ChartProps } from "./types";
import { summarize } from "./scales";

export interface BoxPlotProps extends ChartProps {
  data: number[] | number[][];
  labels?: string[];
}

type BoxStats = {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
  label: string;
};

/** Box-and-whisker plot with outlier detection (1.5 * IQR rule). */
export function BoxPlot({
  data,
  width = 500,
  height = 300,
  title,
  xLabel,
  yLabel = "value",
  labels,
}: BoxPlotProps) {
  const groups = useMemo<BoxStats[]>(() => {
    const arr: number[][] =
      Array.isArray(data) && Array.isArray((data as number[][])[0])
        ? (data as number[][])
        : [data as number[]];

    return arr.map((g, i) => {
      const clean = g.filter((v) => Number.isFinite(v));
      const s = summarize(clean);
      const iqr = s.q3 - s.q1;
      const lo = s.q1 - 1.5 * iqr;
      const hi = s.q3 + 1.5 * iqr;
      const outliers = clean.filter((v) => v < lo || v > hi);
      const nonOut = clean.filter((v) => v >= lo && v <= hi);
      const min =
        nonOut.length > 0 ? Math.min(...nonOut) : s.min;
      const max =
        nonOut.length > 0 ? Math.max(...nonOut) : s.max;
      return {
        min,
        q1: s.q1,
        median: s.median,
        q3: s.q3,
        max,
        outliers,
        label: labels?.[i] ?? `Group ${i + 1}`,
      };
    });
  }, [data, labels]);

  const { yMin, yMax } = useMemo(() => {
    const all: number[] = [];
    groups.forEach((g) => {
      all.push(g.min, g.max, ...g.outliers);
    });
    if (all.length === 0) return { yMin: 0, yMax: 1 };
    const mn = Math.min(...all);
    const mx = Math.max(...all);
    const pad = (mx - mn) * 0.08 || 1;
    return { yMin: mn - pad, yMax: mx + pad };
  }, [groups]);

  const axis = useAxisSystem({
    xMin: 0,
    xMax: Math.max(1, groups.length),
    yMin,
    yMax,
    width,
    height,
    xLabel,
    yLabel,
    title,
    xTickCount: 0,
  });

  const slot = axis.plot.width / Math.max(1, groups.length);
  const boxW = Math.min(56, slot * 0.55);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label={title ?? "box plot"}
    >
      {axis.node}

      {groups.map((g, i) => {
        const cx = axis.plot.x + slot * (i + 0.5);
        const color = PALETTE[i % PALETTE.length];
        const yQ1 = axis.yScale(g.q1);
        const yQ3 = axis.yScale(g.q3);
        const yMed = axis.yScale(g.median);
        const yLo = axis.yScale(g.min);
        const yHi = axis.yScale(g.max);
        return (
          <g key={`box-${i}`}>
            {/* Whiskers */}
            <line
              x1={cx}
              x2={cx}
              y1={yLo}
              y2={yQ1}
              stroke={FG}
              strokeWidth={2}
            />
            <line
              x1={cx}
              x2={cx}
              y1={yQ3}
              y2={yHi}
              stroke={FG}
              strokeWidth={2}
            />
            <line
              x1={cx - boxW / 3}
              x2={cx + boxW / 3}
              y1={yLo}
              y2={yLo}
              stroke={FG}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <line
              x1={cx - boxW / 3}
              x2={cx + boxW / 3}
              y1={yHi}
              y2={yHi}
              stroke={FG}
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* Box */}
            <rect
              x={cx - boxW / 2}
              y={Math.min(yQ1, yQ3)}
              width={boxW}
              height={Math.abs(yQ1 - yQ3)}
              fill={color}
              stroke={FG}
              strokeWidth={2.5}
              rx={2}
              ry={2}
            />
            {/* Median */}
            <line
              x1={cx - boxW / 2}
              x2={cx + boxW / 2}
              y1={yMed}
              y2={yMed}
              stroke={FG}
              strokeWidth={3}
              strokeLinecap="round"
            />

            {/* Outliers */}
            {g.outliers.map((v, oi) => (
              <circle
                key={`out-${i}-${oi}`}
                cx={cx}
                cy={axis.yScale(v)}
                r={3.5}
                fill="#fff"
                stroke={FG}
                strokeWidth={2}
              />
            ))}

            {/* Label */}
            <text
              x={cx}
              y={axis.plot.y + axis.plot.height + 18}
              textAnchor="middle"
              className="font-hand"
              fontSize={12}
              fill={FG}
            >
              {g.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default BoxPlot;
