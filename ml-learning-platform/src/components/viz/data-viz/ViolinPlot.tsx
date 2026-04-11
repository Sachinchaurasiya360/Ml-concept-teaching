"use client";

import { useMemo } from "react";
import { useAxisSystem } from "./AxisSystem";
import { PALETTE, FG, type ChartProps } from "./types";
import { smoothPath, summarize } from "./scales";

export interface ViolinPlotProps extends ChartProps {
  data: number[] | number[][];
  labels?: string[];
  /** Number of density samples along the value axis. */
  resolution?: number;
  /** Kernel bandwidth multiplier. */
  bandwidth?: number;
}

type Group = {
  values: number[];
  label: string;
  median: number;
  q1: number;
  q3: number;
};

/**
 * Mirrored density curve per group using a simple Gaussian KDE. Multiple
 * groups render side-by-side when 2D data is passed.
 */
export function ViolinPlot({
  data,
  width = 500,
  height = 300,
  title,
  xLabel,
  yLabel = "value",
  labels,
  resolution = 48,
  bandwidth = 1,
}: ViolinPlotProps) {
  const groups = useMemo<Group[]>(() => {
    const arr: number[][] =
      Array.isArray(data) && Array.isArray((data as number[][])[0])
        ? (data as number[][])
        : [data as number[]];
    return arr.map((g, i) => {
      const clean = g.filter((v) => Number.isFinite(v));
      const s = summarize(clean);
      return {
        values: clean,
        label: labels?.[i] ?? `G${i + 1}`,
        median: s.median,
        q1: s.q1,
        q3: s.q3,
      };
    });
  }, [data, labels]);

  const { yMin, yMax } = useMemo(() => {
    const all: number[] = [];
    groups.forEach((g) => g.values.forEach((v) => all.push(v)));
    if (all.length === 0) return { yMin: 0, yMax: 1 };
    const mn = Math.min(...all);
    const mx = Math.max(...all);
    if (mn === mx) return { yMin: mn - 1, yMax: mx + 1 };
    const pad = (mx - mn) * 0.08;
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
  const maxHalf = Math.min(slot * 0.42, 70);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label={title ?? "violin plot"}
    >
      {axis.node}

      {groups.map((g, gi) => {
        const cx = axis.plot.x + slot * (gi + 0.5);
        const color = PALETTE[gi % PALETTE.length];

        if (g.values.length === 0) {
          return (
            <text
              key={`g-${gi}`}
              x={cx}
              y={axis.plot.y + axis.plot.height + 18}
              textAnchor="middle"
              className="font-hand"
              fontSize={12}
              fill={FG}
            >
              {g.label}
            </text>
          );
        }

        const { densities, maxD } = kde(g.values, yMin, yMax, resolution, bandwidth);

        const points = densities.map((p) => ({
          y: axis.yScale(p.v),
          d: p.d,
        }));

        const right = points.map((p) => ({
          x: cx + (p.d / (maxD || 1)) * maxHalf,
          y: p.y,
        }));
        const left = [...points]
          .reverse()
          .map((p) => ({ x: cx - (p.d / (maxD || 1)) * maxHalf, y: p.y }));

        const outline = [...right, ...left];
        const d = smoothPath(outline) + " Z";

        const yQ1 = axis.yScale(g.q1);
        const yQ3 = axis.yScale(g.q3);
        const yMed = axis.yScale(g.median);

        return (
          <g key={`v-${gi}`}>
            <path
              d={d}
              fill={color}
              fillOpacity={0.6}
              stroke={FG}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            <line
              x1={cx}
              x2={cx}
              y1={yQ1}
              y2={yQ3}
              stroke={FG}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle cx={cx} cy={yMed} r={3.5} fill="#fff" stroke={FG} strokeWidth={2} />
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

/** Simple Gaussian kernel density estimate sampled across [min, max]. */
function kde(
  values: number[],
  min: number,
  max: number,
  steps: number,
  bwMult: number,
): { densities: { v: number; d: number }[]; maxD: number } {
  const n = values.length;
  if (n === 0) return { densities: [], maxD: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / Math.max(1, n - 1);
  const std = Math.sqrt(variance) || 1;
  // Silverman's rule of thumb.
  const bw = 1.06 * std * Math.pow(n, -1 / 5) * bwMult || 1;

  const densities: { v: number; d: number }[] = [];
  let maxD = 0;
  for (let i = 0; i <= steps; i++) {
    const v = min + ((max - min) * i) / steps;
    let sum = 0;
    for (const x of values) {
      const u = (v - x) / bw;
      sum += Math.exp(-0.5 * u * u);
    }
    const d = sum / (n * bw * Math.sqrt(2 * Math.PI));
    if (d > maxD) maxD = d;
    densities.push({ v, d });
  }
  return { densities, maxD };
}

export default ViolinPlot;
