"use client";

import type { ReactNode } from "react";
import { BG, FG } from "./types";

export interface TooltipProps {
  x: number;
  y: number;
  content: ReactNode;
  visible: boolean;
  /** Offset from (x, y) in pixels. */
  offset?: { x: number; y: number };
  /** When true, (x, y) are interpreted as percentages (0-100). */
  percent?: boolean;
}

/**
 * Absolute-positioned sketchy tooltip. Intended to sit inside a
 * `position: relative` container so (x, y) are local coordinates.
 */
export function Tooltip({
  x,
  y,
  content,
  visible,
  offset = { x: 12, y: -8 },
  percent = false,
}: TooltipProps) {
  const left = percent ? `calc(${x}% + ${offset.x}px)` : x + offset.x;
  const top = percent ? `calc(${y}% + ${offset.y}px)` : y + offset.y;
  return (
    <div
      role="tooltip"
      aria-hidden={!visible}
      className="font-hand"
      style={{
        position: "absolute",
        left,
        top,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(4px) scale(0.96)",
        transition: "opacity 120ms ease, transform 120ms ease",
        background: BG,
        color: FG,
        border: `2px solid ${FG}`,
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: 13,
        lineHeight: 1.3,
        whiteSpace: "nowrap",
        boxShadow: "3px 3px 0 rgba(43, 42, 53, 0.18)",
        zIndex: 20,
      }}
    >
      {content}
    </div>
  );
}

export default Tooltip;
