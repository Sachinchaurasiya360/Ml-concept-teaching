"use client";

import type { ReactNode } from "react";

export type DataPoint = {
  x: number;
  y: number;
  label?: string;
  color?: string;
  category?: string;
};

export type Series = {
  name: string;
  data: DataPoint[];
  color?: string;
};

export type ChartProps = {
  width?: number;
  height?: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
};

export type LegendItem = {
  label: string;
  color: string;
  shape?: "circle" | "square" | "line";
};

export type TooltipContent = ReactNode;

export type BarDatum = {
  label: string;
  value: number;
  color?: string;
};

export type PieDatum = {
  label: string;
  value: number;
  color?: string;
};

/** Palette of sketchy notebook CSS custom properties used across viz. */
export const PALETTE = [
  "var(--accent-coral)",
  "var(--accent-mint)",
  "var(--accent-yellow)",
  "var(--accent-lav)",
  "var(--accent-sky)",
  "var(--accent-peach)",
] as const;

export const FG = "#2b2a35";
export const BG = "#fdfbf6";
