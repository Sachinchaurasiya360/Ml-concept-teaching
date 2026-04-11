"use client";

import { useMemo, useState } from "react";
import { useAxisSystem } from "./AxisSystem";
import { Legend } from "./Legend";
import { Tooltip } from "./Tooltip";
import { PALETTE, FG, type ChartProps, type DataPoint } from "./types";
import { extent, linearRegression } from "./scales";

export interface ScatterPlotProps extends ChartProps {
  data: DataPoint[];
  categoryColors?: Record<string, string>;
  showTrendLine?: boolean;
  /** Point radius in pixels. Default 6. */
  pointRadius?: number;
}

/**
 * Interactive scatter plot with hover tooltips, categories, and an
 * optional simple linear trend line.
 */
export function ScatterPlot({
  data,
  width = 500,
  height = 300,
  title,
  xLabel,
  yLabel,
  categoryColors,
  showTrendLine = false,
  pointRadius = 6,
}: ScatterPlotProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    const xs = data.map((d) => d.x);
    const ys = data.map((d) => d.y);
    const [xMin, xMax] = extent(xs);
    const [yMin, yMax] = extent(ys);
    return { xMin, xMax, yMin, yMax };
  }, [data]);

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

  const cats = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [data]);

  const colorForCat = (cat?: string, idx = 0): string => {
    if (!cat) return PALETTE[idx % PALETTE.length];
    if (categoryColors && categoryColors[cat]) return categoryColors[cat];
    const i = cats.indexOf(cat);
    return PALETTE[(i >= 0 ? i : idx) % PALETTE.length];
  };

  const trend = useMemo(() => {
    if (!showTrendLine || data.length < 2) return null;
    return linearRegression(
      data.map((d) => d.x),
      data.map((d) => d.y),
    );
  }, [showTrendLine, data]);

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={title ?? "scatter plot"}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {axis.node}

        {trend ? (
          <line
            x1={axis.xScale(xMin)}
            x2={axis.xScale(xMax)}
            y1={axis.yScale(trend.slope * xMin + trend.intercept)}
            y2={axis.yScale(trend.slope * xMax + trend.intercept)}
            stroke="var(--accent-lav)"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
        ) : null}

        {data.map((d, i) => {
          const cx = axis.xScale(d.x);
          const cy = axis.yScale(d.y);
          const fill = d.color ?? colorForCat(d.category, i);
          const isHover = hoverIdx === i;
          return (
            <circle
              key={`pt-${i}`}
              cx={cx}
              cy={cy}
              r={isHover ? pointRadius + 2 : pointRadius}
              fill={fill}
              stroke={FG}
              strokeWidth={2.5}
              style={{ cursor: "pointer", transition: "r 120ms ease" }}
              onMouseEnter={() => setHoverIdx(i)}
            />
          );
        })}
      </svg>

      {cats.length > 1 ? (
        <div style={{ marginTop: 6 }}>
          <Legend
            items={cats.map((c, i) => ({
              label: c,
              color: colorForCat(c, i),
              shape: "circle",
            }))}
          />
        </div>
      ) : null}

      {hovered && hoverIdx !== null ? (
        <Tooltip
          visible
          percent
          x={(axis.xScale(hovered.x) / width) * 100}
          y={(axis.yScale(hovered.y) / height) * 100}
          content={
            <div>
              {hovered.label ? (
                <div style={{ fontWeight: 700 }}>{hovered.label}</div>
              ) : null}
              <div>x: {hovered.x}</div>
              <div>y: {hovered.y}</div>
              {hovered.category ? <div>{hovered.category}</div> : null}
            </div>
          }
        />
      ) : null}
    </div>
  );
}

export default ScatterPlot;
