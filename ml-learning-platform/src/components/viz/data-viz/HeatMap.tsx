"use client";

import { useMemo, useState } from "react";
import { Tooltip } from "./Tooltip";
import { FG, type ChartProps } from "./types";
import { formatTick } from "./scales";

export interface HeatMapProps extends ChartProps {
  data: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  colorScale?: "coral" | "mint" | "lav" | "sky";
  showValues?: boolean;
}

const SCALES: Record<NonNullable<HeatMapProps["colorScale"]>, [string, string]> = {
  coral: ["#fff2f0", "#ff6b6b"],
  mint: ["#eefcfa", "#4ecdc4"],
  lav: ["#f4eefd", "#b18cf2"],
  sky: ["#eef6ff", "#6bb6ff"],
};

/** 2D matrix heatmap. Useful for correlation, confusion, attention matrices. */
export function HeatMap({
  data,
  width = 500,
  height = 300,
  title,
  xLabel,
  yLabel,
  rowLabels,
  colLabels,
  colorScale = "coral",
  showValues = false,
}: HeatMapProps) {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  const rows = data.length;
  const cols = rows > 0 ? data[0]?.length ?? 0 : 0;

  const { min, max } = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    for (const row of data) {
      for (const v of row) {
        if (!Number.isFinite(v)) continue;
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
    }
    if (!Number.isFinite(mn) || !Number.isFinite(mx)) return { min: 0, max: 1 };
    if (mn === mx) return { min: mn, max: mn + 1 };
    return { min: mn, max: mx };
  }, [data]);

  const left = (rowLabels ? 60 : 16) + (yLabel ? 14 : 0);
  const right = 16;
  const top = (title ? 30 : 8) + (colLabels ? 22 : 0);
  const bottom = 24 + (xLabel ? 14 : 0);
  const plotW = Math.max(10, width - left - right);
  const plotH = Math.max(10, height - top - bottom);

  const cellW = cols > 0 ? plotW / cols : 0;
  const cellH = rows > 0 ? plotH / rows : 0;

  const [from, to] = SCALES[colorScale];

  const interp = (v: number): string => {
    const t = (v - min) / (max - min || 1);
    return mixHex(from, to, Math.max(0, Math.min(1, t)));
  };

  if (rows === 0 || cols === 0) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <text
          x={width / 2}
          y={height / 2}
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

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={title ?? "heat map"}
        onMouseLeave={() => setHover(null)}
      >
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

        {colLabels?.map((l, c) => (
          <text
            key={`col-${c}`}
            x={left + cellW * (c + 0.5)}
            y={top - 6}
            textAnchor="middle"
            className="font-hand"
            fontSize={12}
            fill={FG}
          >
            {l}
          </text>
        ))}

        {rowLabels?.map((l, r) => (
          <text
            key={`row-${r}`}
            x={left - 6}
            y={top + cellH * (r + 0.5) + 4}
            textAnchor="end"
            className="font-hand"
            fontSize={12}
            fill={FG}
          >
            {l}
          </text>
        ))}

        {data.map((row, r) =>
          row.map((v, c) => {
            const x = left + c * cellW;
            const y = top + r * cellH;
            return (
              <g key={`c-${r}-${c}`}>
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={Math.max(0, cellW - 2)}
                  height={Math.max(0, cellH - 2)}
                  rx={2}
                  ry={2}
                  fill={interp(v)}
                  stroke={FG}
                  strokeWidth={1.5}
                  onMouseEnter={() => setHover({ r, c })}
                  style={{ cursor: "pointer" }}
                />
                {showValues ? (
                  <text
                    x={x + cellW / 2}
                    y={y + cellH / 2 + 4}
                    textAnchor="middle"
                    className="font-hand"
                    fontSize={11}
                    fill={FG}
                  >
                    {formatTick(v)}
                  </text>
                ) : null}
              </g>
            );
          }),
        )}

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
      </svg>

      {hover ? (
        <Tooltip
          visible
          percent
          x={((left + cellW * (hover.c + 0.5)) / width) * 100}
          y={((top + cellH * (hover.r + 0.5)) / height) * 100}
          content={
            <div>
              <div style={{ fontWeight: 700 }}>
                {rowLabels?.[hover.r] ?? `row ${hover.r}`} ·{" "}
                {colLabels?.[hover.c] ?? `col ${hover.c}`}
              </div>
              <div>{formatTick(data[hover.r][hover.c])}</div>
            </div>
          }
        />
      ) : null}
    </div>
  );
}

/** Mix two hex colors by t in [0, 1]. */
function mixHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

export default HeatMap;
