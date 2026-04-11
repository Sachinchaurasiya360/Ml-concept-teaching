"use client";

import { useEffect, useState } from "react";
import { FG } from "./types";
import { clamp } from "./scales";

export interface ProgressBarProps {
  value: number; // 0..1
  label?: string;
  color?: string;
  height?: number;
  animated?: boolean;
  /** Show the percent label at the end of the bar. */
  showPercent?: boolean;
}

/** Sketchy progress bar with optional animated fill. */
export function ProgressBar({
  value,
  label,
  color = "var(--accent-mint)",
  height = 18,
  animated = true,
  showPercent = true,
}: ProgressBarProps) {
  const target = clamp(Number.isFinite(value) ? value : 0, 0, 1);
  const [display, setDisplay] = useState(animated ? 0 : target);

  useEffect(() => {
    if (!animated) {
      setDisplay(target);
      return;
    }
    let raf: number;
    const start = performance.now();
    const from = display;
    const duration = 700;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, animated]);

  return (
    <div
      className="font-hand"
      style={{
        width: "100%",
        color: FG,
        fontSize: 13,
      }}
    >
      {label || showPercent ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 4,
          }}
        >
          {label ? <span>{label}</span> : <span />}
          {showPercent ? (
            <span style={{ fontWeight: 700 }}>
              {Math.round(display * 100)}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        style={{
          position: "relative",
          width: "100%",
          height,
          background: "#fdfbf6",
          border: `2.5px solid ${FG}`,
          borderRadius: 6,
          boxShadow: "3px 3px 0 rgba(43, 42, 53, 0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${display * 100}%`,
            height: "100%",
            background: color,
            borderRight: display > 0 && display < 1 ? `2.5px solid ${FG}` : "none",
            transition: animated ? "width 120ms linear" : undefined,
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
