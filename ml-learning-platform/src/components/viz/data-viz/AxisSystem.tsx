"use client";

import { useMemo } from "react";
import { FG } from "./types";
import {
  formatTick,
  linearScale,
  niceTicks,
  sketchLine,
} from "./scales";

export interface AxisSystemProps {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width: number;
  height: number;
  xLabel?: string;
  yLabel?: string;
  padding?: number;
  showGrid?: boolean;
  /** Optional tick count hints. */
  xTickCount?: number;
  yTickCount?: number;
  /** Title shown above the chart. */
  title?: string;
}

export interface AxisRender {
  /** The JSX to drop inside an <svg>. */
  node: React.ReactNode;
  /** Map an x domain value to pixels. */
  xScale: (v: number) => number;
  /** Map a y domain value to pixels. */
  yScale: (v: number) => number;
  /** Inner plot rectangle. */
  plot: { x: number; y: number; width: number; height: number };
}

/**
 * Build an axis system. This is returned as a hook-like helper so the
 * parent chart can render data inside the same SVG. Use the `AxisSystem`
 * component below for a purely-declarative version.
 */
export function useAxisSystem(props: AxisSystemProps): AxisRender {
  const {
    xMin,
    xMax,
    yMin,
    yMax,
    width,
    height,
    xLabel,
    yLabel,
    padding = 44,
    showGrid = true,
    xTickCount = 5,
    yTickCount = 5,
    title,
  } = props;

  return useMemo(() => {
    const left = padding + (yLabel ? 14 : 0);
    const right = 16;
    const top = title ? 28 : 16;
    const bottom = padding + (xLabel ? 14 : 0);

    const plotW = Math.max(10, width - left - right);
    const plotH = Math.max(10, height - top - bottom);
    const plot = { x: left, y: top, width: plotW, height: plotH };

    const xScale = linearScale(xMin, xMax, left, left + plotW);
    const yScale = linearScale(yMin, yMax, top + plotH, top);

    const xTicks = niceTicks(xMin, xMax, xTickCount);
    const yTicks = niceTicks(yMin, yMax, yTickCount);

    const node = (
      <g>
        {title ? (
          <text
            x={width / 2}
            y={18}
            textAnchor="middle"
            className="font-hand"
            fontSize={16}
            fontWeight={700}
            fill={FG}
          >
            {title}
          </text>
        ) : null}

        {/* Grid lines */}
        {showGrid && (
          <g opacity={0.2}>
            {xTicks.map((t, i) => {
              const x = xScale(t);
              if (x < left - 0.5 || x > left + plotW + 0.5) return null;
              return (
                <line
                  key={`gx-${i}`}
                  x1={x}
                  x2={x}
                  y1={top}
                  y2={top + plotH}
                  stroke={FG}
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
              );
            })}
            {yTicks.map((t, i) => {
              const y = yScale(t);
              if (y < top - 0.5 || y > top + plotH + 0.5) return null;
              return (
                <line
                  key={`gy-${i}`}
                  x1={left}
                  x2={left + plotW}
                  y1={y}
                  y2={y}
                  stroke={FG}
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
              );
            })}
          </g>
        )}

        {/* Axes (hand-drawn slight wobble) */}
        <path
          d={sketchLine(left, top + plotH, left + plotW, top + plotH, 11, 1.2)}
          fill="none"
          stroke={FG}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <path
          d={sketchLine(left, top, left, top + plotH, 17, 1.2)}
          fill="none"
          stroke={FG}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* X ticks + labels */}
        {xTicks.map((t, i) => {
          const x = xScale(t);
          if (x < left - 0.5 || x > left + plotW + 0.5) return null;
          return (
            <g key={`tx-${i}`}>
              <line
                x1={x}
                x2={x}
                y1={top + plotH}
                y2={top + plotH + 5}
                stroke={FG}
                strokeWidth={2}
              />
              <text
                x={x}
                y={top + plotH + 18}
                textAnchor="middle"
                className="font-hand"
                fontSize={12}
                fill={FG}
              >
                {formatTick(t)}
              </text>
            </g>
          );
        })}

        {/* Y ticks + labels */}
        {yTicks.map((t, i) => {
          const y = yScale(t);
          if (y < top - 0.5 || y > top + plotH + 0.5) return null;
          return (
            <g key={`ty-${i}`}>
              <line
                x1={left - 5}
                x2={left}
                y1={y}
                y2={y}
                stroke={FG}
                strokeWidth={2}
              />
              <text
                x={left - 8}
                y={y + 4}
                textAnchor="end"
                className="font-hand"
                fontSize={12}
                fill={FG}
              >
                {formatTick(t)}
              </text>
            </g>
          );
        })}

        {xLabel ? (
          <text
            x={left + plotW / 2}
            y={height - 6}
            textAnchor="middle"
            className="font-hand"
            fontSize={13}
            fill={FG}
          >
            {xLabel}
          </text>
        ) : null}

        {yLabel ? (
          <text
            x={14}
            y={top + plotH / 2}
            textAnchor="middle"
            className="font-hand"
            fontSize={13}
            fill={FG}
            transform={`rotate(-90 14 ${top + plotH / 2})`}
          >
            {yLabel}
          </text>
        ) : null}
      </g>
    );

    return { node, xScale, yScale, plot };
  }, [
    xMin,
    xMax,
    yMin,
    yMax,
    width,
    height,
    xLabel,
    yLabel,
    padding,
    showGrid,
    xTickCount,
    yTickCount,
    title,
  ]);
}

/**
 * Declarative axis system. Renders its own SVG. Use `useAxisSystem` when
 * you need to compose axes and data inside a single SVG.
 */
export function AxisSystem(props: AxisSystemProps) {
  const { width, height } = props;
  const { node } = useAxisSystem(props);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="chart axes"
    >
      {node}
    </svg>
  );
}

export default AxisSystem;
