"use client";

import { useId } from "react";
import { clamp, fmt, weightColor } from "./utils";

export interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** Sketchy horizontal slider for a weight/bias. Positive = mint, negative = coral. */
export function WeightSlider({
  label,
  value,
  onChange,
  min = -2,
  max = 2,
  step = 0.1,
}: WeightSliderProps) {
  const id = useId();
  const v = clamp(value, min, max);
  const span = max - min || 1;
  // Half-bar anchored at zero (or min when min >= 0).
  const zero = min < 0 && max > 0 ? 0 : min;
  const zeroPct = ((zero - min) / span) * 100;
  const valuePct = ((v - min) / span) * 100;
  const barStart = Math.min(zeroPct, valuePct);
  const barEnd = Math.max(zeroPct, valuePct);
  const color = v >= zero ? "var(--accent-mint)" : "var(--accent-coral)";

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1">
        <label
          htmlFor={id}
          className="font-hand text-[15px] text-foreground"
        >
          {label}
        </label>
        <span
          className="font-hand text-[15px] font-bold"
          style={{ color: weightColor(v) }}
        >
          {fmt(v)}
        </span>
      </div>
      <div className="relative h-6">
        {/* Track background */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded-full"
          style={{
            background: "#f3efe6",
            border: "1.5px solid #2b2a35",
            borderRadius: "12px 16px 10px 14px / 14px 10px 16px 12px",
          }}
        />
        {/* Filled magnitude bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 pointer-events-none"
          style={{
            left: `${barStart}%`,
            width: `${Math.max(0, barEnd - barStart)}%`,
            background: color,
            borderTop: "1.5px solid #2b2a35",
            borderBottom: "1.5px solid #2b2a35",
          }}
        />
        {/* Zero tick if bipolar */}
        {min < 0 && max > 0 ? (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-[2px]"
            style={{ left: `${zeroPct}%`, background: "#2b2a35" }}
          />
        ) : null}
        {/* Native slider for a11y + interaction */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={label}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full pointer-events-none"
          style={{
            left: `${valuePct}%`,
            background: "#fdfbf6",
            border: "2.5px solid #2b2a35",
            boxShadow: "2px 2px 0 #2b2a35",
          }}
        />
      </div>
    </div>
  );
}

export default WeightSlider;
