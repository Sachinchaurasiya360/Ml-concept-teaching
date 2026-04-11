"use client";

import { useMemo } from "react";
import { useAxisSystem } from "./AxisSystem";
import { FG, type ChartProps } from "./types";
import { formatTick } from "./scales";

export interface HistogramProps extends ChartProps {
  data: number[];
  bins?: number;
  showMean?: boolean;
  showMedian?: boolean;
  /** Bar fill color. */
  color?: string;
}

/** Frequency histogram with optional mean + median overlays. */
export function Histogram({
  data,
  width = 500,
  height = 300,
  title,
  xLabel = "value",
  yLabel = "frequency",
  bins = 10,
  showMean = false,
  showMedian = false,
  color = "var(--accent-sky)",
}: HistogramProps) {
  const { binEdges, counts, min, max, mean, median } = useMemo(() => {
    const clean = data.filter((v) => Number.isFinite(v));
    if (clean.length === 0) {
      return {
        binEdges: [0, 1],
        counts: [0],
        min: 0,
        max: 1,
        mean: 0,
        median: 0,
      };
    }
    const min = Math.min(...clean);
    const max = Math.max(...clean);
    const safeMax = min === max ? min + 1 : max;
    const nBins = Math.max(1, bins);
    const step = (safeMax - min) / nBins;
    const edges: number[] = [];
    for (let i = 0; i <= nBins; i++) edges.push(min + step * i);
    const counts = new Array(nBins).fill(0);
    for (const v of clean) {
      let idx = Math.floor((v - min) / step);
      if (idx >= nBins) idx = nBins - 1;
      if (idx < 0) idx = 0;
      counts[idx]++;
    }
    const sorted = [...clean].sort((a, b) => a - b);
    const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
    return { binEdges: edges, counts, min, max: safeMax, mean, median };
  }, [data, bins]);

  const maxCount = Math.max(1, ...counts);

  const axis = useAxisSystem({
    xMin: min,
    xMax: max,
    yMin: 0,
    yMax: maxCount * 1.1,
    width,
    height,
    xLabel,
    yLabel,
    title,
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label={title ?? "histogram"}
    >
      {axis.node}

      {counts.map((c, i) => {
        const x0 = axis.xScale(binEdges[i]);
        const x1 = axis.xScale(binEdges[i + 1]);
        const y = axis.yScale(c);
        const zero = axis.yScale(0);
        const w = Math.max(1, x1 - x0 - 2);
        const h = Math.max(0, zero - y);
        return (
          <g key={`bin-${i}`}>
            <rect
              x={x0 + 1}
              y={y}
              width={w}
              height={h}
              rx={2}
              ry={2}
              fill={color}
              stroke={FG}
              strokeWidth={2.5}
            />
          </g>
        );
      })}

      {showMean ? (
        <g>
          <line
            x1={axis.xScale(mean)}
            x2={axis.xScale(mean)}
            y1={axis.plot.y}
            y2={axis.plot.y + axis.plot.height}
            stroke="var(--accent-coral)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <text
            x={axis.xScale(mean) + 4}
            y={axis.plot.y + 14}
            className="font-hand"
            fontSize={12}
            fill="var(--accent-coral)"
          >
            mean {formatTick(mean)}
          </text>
        </g>
      ) : null}

      {showMedian ? (
        <g>
          <line
            x1={axis.xScale(median)}
            x2={axis.xScale(median)}
            y1={axis.plot.y}
            y2={axis.plot.y + axis.plot.height}
            stroke="var(--accent-lav)"
            strokeWidth={2.5}
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
          <text
            x={axis.xScale(median) + 4}
            y={axis.plot.y + 28}
            className="font-hand"
            fontSize={12}
            fill="var(--accent-lav)"
          >
            median {formatTick(median)}
          </text>
        </g>
      ) : null}
    </svg>
  );
}

export default Histogram;
