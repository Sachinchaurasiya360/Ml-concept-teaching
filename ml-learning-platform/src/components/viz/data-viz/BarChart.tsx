"use client";

import { useEffect, useMemo, useState } from "react";
import { useAxisSystem } from "./AxisSystem";
import { PALETTE, FG, type ChartProps, type BarDatum } from "./types";
import { formatTick } from "./scales";

export interface BarChartProps extends ChartProps {
  data: BarDatum[];
  orientation?: "vertical" | "horizontal";
  animateOnMount?: boolean;
  /** Show the numeric value on/above each bar. */
  showValues?: boolean;
}

/**
 * Animated bar chart with hand-drawn strokes. Supports vertical and
 * horizontal orientations.
 */
export function BarChart({
  data,
  width = 500,
  height = 300,
  title,
  xLabel,
  yLabel,
  orientation = "vertical",
  animateOnMount = true,
  showValues = true,
}: BarChartProps) {
  const [mounted, setMounted] = useState(!animateOnMount);
  useEffect(() => {
    if (!animateOnMount) return;
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [animateOnMount]);

  const isVertical = orientation === "vertical";

  const { values, domainMin, domainMax } = useMemo(() => {
    const vs = data.map((d) => d.value);
    const min = Math.min(0, ...vs);
    const maxRaw = Math.max(0, ...vs);
    const max = maxRaw === 0 ? 1 : maxRaw * 1.1;
    return { values: vs, domainMin: min, domainMax: max };
  }, [data]);

  // Categorical axis is handled manually; we use a numeric axis on one side.
  const axis = useAxisSystem({
    xMin: isVertical ? 0 : domainMin,
    xMax: isVertical ? Math.max(1, data.length) : domainMax,
    yMin: isVertical ? domainMin : 0,
    yMax: isVertical ? domainMax : Math.max(1, data.length),
    width,
    height,
    xLabel,
    yLabel,
    title,
    xTickCount: isVertical ? 0 : 5,
    yTickCount: isVertical ? 5 : 0,
    showGrid: true,
  });

  const plot = axis.plot;
  const n = data.length;
  const slot = isVertical ? plot.width / Math.max(1, n) : plot.height / Math.max(1, n);
  const barThickness = Math.max(4, slot * 0.62);
  const zeroV = isVertical ? axis.yScale(0) : axis.xScale(0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label={title ?? "bar chart"}
    >
      {axis.node}

      {data.map((d, i) => {
        const color = d.color ?? PALETTE[i % PALETTE.length];
        const progress = mounted ? 1 : 0;

        if (isVertical) {
          const cx = plot.x + slot * (i + 0.5);
          const x = cx - barThickness / 2;
          const targetY = axis.yScale(d.value);
          const barH = Math.abs(zeroV - targetY) * progress;
          const y = d.value >= 0 ? zeroV - barH : zeroV;
          return (
            <g key={`bar-${i}`}>
              <rect
                x={x}
                y={y}
                width={barThickness}
                height={barH}
                rx={2}
                ry={2}
                fill={color}
                stroke={FG}
                strokeWidth={2.5}
                style={{ transition: "y 600ms ease, height 600ms ease" }}
              />
              {showValues && mounted ? (
                <text
                  x={cx}
                  y={(d.value >= 0 ? y : y + barH) - 6}
                  textAnchor="middle"
                  className="font-hand"
                  fontSize={12}
                  fill={FG}
                >
                  {formatTick(d.value)}
                </text>
              ) : null}
              <text
                x={cx}
                y={plot.y + plot.height + 18}
                textAnchor="middle"
                className="font-hand"
                fontSize={12}
                fill={FG}
              >
                {d.label}
              </text>
            </g>
          );
        }

        // Horizontal
        const cy = plot.y + slot * (i + 0.5);
        const y = cy - barThickness / 2;
        const targetX = axis.xScale(d.value);
        const barW = Math.abs(targetX - zeroV) * progress;
        const x = d.value >= 0 ? zeroV : zeroV - barW;
        return (
          <g key={`bar-${i}`}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barThickness}
              rx={2}
              ry={2}
              fill={color}
              stroke={FG}
              strokeWidth={2.5}
              style={{ transition: "x 600ms ease, width 600ms ease" }}
            />
            {showValues && mounted ? (
              <text
                x={(d.value >= 0 ? x + barW : x) + 6}
                y={cy + 4}
                textAnchor="start"
                className="font-hand"
                fontSize={12}
                fill={FG}
              >
                {formatTick(d.value)}
              </text>
            ) : null}
            <text
              x={plot.x - 8}
              y={cy + 4}
              textAnchor="end"
              className="font-hand"
              fontSize={12}
              fill={FG}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default BarChart;
