"use client";

import { useMemo } from "react";
import { activate, fmt, softmaxVec, type ActivationName } from "./utils";

export interface ActivationFunctionVizProps {
  type: ActivationName;
  highlightX?: number;
  xRange?: [number, number];
  width?: number;
  height?: number;
}

/** Plots an activation function on a coordinate plane with sketchy axes. */
export function ActivationFunctionViz({
  type,
  highlightX,
  xRange = [-5, 5],
  width = 380,
  height = 260,
}: ActivationFunctionVizProps) {
  const [xMin, xMax] = xRange;

  // Determine y range from the function family.
  const yRange: [number, number] = useMemo(() => {
    switch (type) {
      case "sigmoid":
        return [-0.2, 1.2];
      case "tanh":
        return [-1.3, 1.3];
      case "relu":
        return [-0.5, Math.max(1.5, xMax)];
      case "softmax":
        return [-0.2, 1.2];
      case "linear":
      default:
        return [Math.min(xMin, -1), Math.max(xMax, 1)];
    }
  }, [type, xMin, xMax]);

  const [yMin, yMax] = yRange;
  const padL = 38;
  const padR = 16;
  const padT = 30;
  const padB = 32;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const xToPx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * innerW;
  const yToPx = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * innerH;

  // Sample the curve.
  const pts = useMemo(() => {
    const N = 160;
    const arr: { x: number; y: number }[] = [];
    if (type === "softmax") {
      // Show the softmax over a simple 2-logit example: [x, 0] -> p(class 0).
      for (let i = 0; i <= N; i++) {
        const x = xMin + (i / N) * (xMax - xMin);
        const p = softmaxVec([x, 0])[0];
        arr.push({ x, y: p });
      }
    } else {
      for (let i = 0; i <= N; i++) {
        const x = xMin + (i / N) * (xMax - xMin);
        arr.push({ x, y: activate(type, x) });
      }
    }
    return arr;
  }, [type, xMin, xMax]);

  const path = useMemo(() => {
    if (pts.length === 0) return "";
    let d = `M ${xToPx(pts[0].x)} ${yToPx(pts[0].y)}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${xToPx(pts[i].x)} ${yToPx(pts[i].y)}`;
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pts, xMin, xMax, yMin, yMax]);

  const highlighted =
    highlightX != null && Number.isFinite(highlightX)
      ? {
          x: highlightX,
          y:
            type === "softmax"
              ? softmaxVec([highlightX, 0])[0]
              : activate(type, highlightX),
        }
      : null;

  // Axis ticks
  const xTicks: number[] = [];
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 1) xTicks.push(x);
  const yTicks: number[] = [];
  const yStep = yMax - yMin <= 3 ? 0.5 : 1;
  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) yTicks.push(y);

  // Axis positions (y=0 line, x=0 line clamped in-plot)
  const y0 = yToPx(Math.max(yMin, Math.min(yMax, 0)));
  const x0 = xToPx(Math.max(xMin, Math.min(xMax, 0)));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label={`${type} activation function`}
    >
      {/* Plot area bg */}
      <rect
        x={padL}
        y={padT}
        width={innerW}
        height={innerH}
        fill="#fff"
        stroke="#2b2a35"
        strokeWidth={2}
        rx={10}
        ry={12}
      />

      {/* grid */}
      {xTicks.map((t) => (
        <line
          key={`gx-${t}`}
          x1={xToPx(t)}
          x2={xToPx(t)}
          y1={padT}
          y2={padT + innerH}
          stroke="#2b2a35"
          strokeOpacity={0.08}
        />
      ))}
      {yTicks.map((t) => (
        <line
          key={`gy-${t}`}
          x1={padL}
          x2={padL + innerW}
          y1={yToPx(t)}
          y2={yToPx(t)}
          stroke="#2b2a35"
          strokeOpacity={0.08}
        />
      ))}

      {/* axes */}
      <line
        x1={padL}
        x2={padL + innerW}
        y1={y0}
        y2={y0}
        stroke="#2b2a35"
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <line
        x1={x0}
        x2={x0}
        y1={padT}
        y2={padT + innerH}
        stroke="#2b2a35"
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />

      {/* tick labels */}
      {xTicks.map((t) => (
        <text
          key={`tx-${t}`}
          x={xToPx(t)}
          y={y0 + 14}
          textAnchor="middle"
          className="font-hand"
          fontSize={11}
          fill="#6b6776"
        >
          {t}
        </text>
      ))}
      {yTicks.map((t) => (
        <text
          key={`ty-${t}`}
          x={padL - 6}
          y={yToPx(t) + 4}
          textAnchor="end"
          className="font-hand"
          fontSize={11}
          fill="#6b6776"
        >
          {fmt(t, 1)}
        </text>
      ))}

      {/* curve */}
      <path
        d={path}
        fill="none"
        stroke="var(--accent-lav)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* highlight */}
      {highlighted ? (
        <g>
          <line
            x1={xToPx(highlighted.x)}
            x2={xToPx(highlighted.x)}
            y1={padT}
            y2={padT + innerH}
            stroke="var(--accent-coral)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <circle
            cx={xToPx(highlighted.x)}
            cy={yToPx(highlighted.y)}
            r={6}
            fill="var(--accent-coral)"
            stroke="#2b2a35"
            strokeWidth={2}
          />
          <g
            transform={`translate(${xToPx(highlighted.x) + 8}, ${yToPx(highlighted.y) - 18})`}
          >
            <rect
              x={0}
              y={-12}
              width={78}
              height={20}
              rx={6}
              fill="#fff"
              stroke="#2b2a35"
              strokeWidth={1.2}
            />
            <text
              x={39}
              y={2}
              textAnchor="middle"
              className="font-hand"
              fontSize={11}
              fill="#2b2a35"
            >
              ({fmt(highlighted.x)}, {fmt(highlighted.y)})
            </text>
          </g>
        </g>
      ) : null}

      {/* function name */}
      <text
        x={padL + 10}
        y={padT + 18}
        className="font-hand"
        fontSize={16}
        fontWeight={700}
        fill="#2b2a35"
      >
        f(x) = {type}
      </text>
    </svg>
  );
}

export default ActivationFunctionViz;
