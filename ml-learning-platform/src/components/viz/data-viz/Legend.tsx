"use client";

import type { LegendItem } from "./types";
import { FG } from "./types";

export interface LegendProps {
  items: LegendItem[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/** Small colored swatches with labels. Purely HTML so it wraps nicely. */
export function Legend({
  items,
  orientation = "horizontal",
  className,
}: LegendProps) {
  if (!items || items.length === 0) return null;
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      className={`${className ?? ""} font-hand`}
      style={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        flexWrap: "wrap",
        gap: isHorizontal ? "12px 16px" : "6px",
        alignItems: isHorizontal ? "center" : "flex-start",
        justifyContent: isHorizontal ? "center" : "flex-start",
        color: FG,
        fontSize: 13,
      }}
    >
      {items.map((item, i) => (
        <div
          key={`${item.label}-${i}`}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <LegendSwatch color={item.color} shape={item.shape ?? "circle"} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function LegendSwatch({
  color,
  shape,
}: {
  color: string;
  shape: NonNullable<LegendItem["shape"]>;
}) {
  return (
    <svg width={22} height={16} aria-hidden>
      {shape === "circle" && (
        <circle
          cx={11}
          cy={8}
          r={6}
          fill={color}
          stroke={FG}
          strokeWidth={2}
        />
      )}
      {shape === "square" && (
        <rect
          x={3}
          y={2}
          width={16}
          height={12}
          rx={2}
          ry={2}
          fill={color}
          stroke={FG}
          strokeWidth={2}
        />
      )}
      {shape === "line" && (
        <line
          x1={2}
          x2={20}
          y1={8}
          y2={8}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default Legend;
