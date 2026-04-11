"use client";

import { useMemo } from "react";
import {
  forwardPass,
  makeRandomWeights,
  neuronPosition,
  sketchyPath,
  weightColor,
  weightStroke,
  type ActivationName,
  fmt,
} from "./utils";

export interface NeuralNetworkProps {
  /** Architecture as an array of layer sizes, e.g. [3, 4, 4, 1]. */
  layers: number[];
  /** Optional explicit weights: weights[layer][neuron][inputIndex]. */
  weights?: number[][][];
  /** Per-layer activation names. */
  activations?: ActivationName[];
  /** Optional inputs used to compute and show activations. */
  inputs?: number[];
  /** Animate a pulsing signal flowing along edges. */
  animateFlow?: boolean;
  /** Show numeric activation values inside each neuron. */
  showValues?: boolean;
  width?: number;
  height?: number;
}

/** Full multi-layer feed-forward network, rendered sketchy-style. */
export function NeuralNetwork({
  layers,
  weights,
  activations,
  inputs,
  animateFlow = true,
  showValues = false,
  width = 640,
  height = 360,
}: NeuralNetworkProps) {
  const safeLayers = layers.length > 0 ? layers : [1];

  const effectiveWeights = useMemo(() => {
    if (weights && weights.length === safeLayers.length - 1) return weights;
    return makeRandomWeights(safeLayers, 11);
  }, [weights, safeLayers]);

  const activationValues = useMemo(() => {
    if (!inputs || inputs.length !== safeLayers[0]) return null;
    return forwardPass(inputs, effectiveWeights, activations);
  }, [inputs, effectiveWeights, activations, safeLayers]);

  // Compute max |w| for stroke normalization.
  const maxAbs = useMemo(() => {
    let m = 0.1;
    for (const l of effectiveWeights)
      for (const row of l)
        for (const w of row) m = Math.max(m, Math.abs(w));
    return m;
  }, [effectiveWeights]);

  const layerCount = safeLayers.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Neural network with architecture ${safeLayers.join("-")}`}
    >
      {/* connections */}
      {effectiveWeights.map((layerW, li) =>
        layerW.map((row, j) =>
          row.map((w, i) => {
            const a = neuronPosition(li, i, layerCount, safeLayers[li], width, height);
            const b = neuronPosition(li + 1, j, layerCount, safeLayers[li + 1], width, height);
            const path = sketchyPath(a.x, a.y, b.x, b.y, li * 100 + j * 10 + i);
            return (
              <path
                key={`l${li}-n${j}-w${i}`}
                d={path}
                fill="none"
                stroke={weightColor(w)}
                strokeOpacity={0.55 + Math.min(0.45, Math.abs(w) / maxAbs)}
                strokeWidth={weightStroke(w, maxAbs)}
                strokeLinecap="round"
                strokeDasharray={animateFlow ? "6 4" : "0"}
                style={
                  animateFlow
                    ? {
                        animation: `signal-flow 1.6s linear ${(li * 0.25 + j * 0.04) % 1.6}s infinite`,
                      }
                    : undefined
                }
              />
            );
          }),
        ),
      )}

      {/* neurons */}
      {safeLayers.map((count, li) =>
        Array.from({ length: count }, (_, ni) => {
          const { x, y } = neuronPosition(li, ni, layerCount, count, width, height);
          const r = 18;
          const fill =
            li === 0
              ? "var(--accent-sky)"
              : li === layerCount - 1
                ? "var(--accent-mint)"
                : "var(--accent-yellow)";
          const value = activationValues?.[li]?.[ni];
          return (
            <g key={`n-${li}-${ni}`}>
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                stroke="#2b2a35"
                strokeWidth={2.5}
              />
              {showValues && value != null ? (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="font-hand"
                  fontSize={12}
                  fontWeight={700}
                  fill="#2b2a35"
                >
                  {fmt(value)}
                </text>
              ) : null}
            </g>
          );
        }),
      )}

      {/* layer labels */}
      {safeLayers.map((_, li) => {
        const { x } = neuronPosition(li, 0, layerCount, safeLayers[li], width, height);
        const labelText =
          li === 0
            ? "input"
            : li === layerCount - 1
              ? "output"
              : `hidden ${li}`;
        return (
          <text
            key={`lbl-${li}`}
            x={x}
            y={height - 14}
            textAnchor="middle"
            className="font-hand"
            fontSize={13}
            fill="#6b6776"
          >
            {labelText}
          </text>
        );
      })}
    </svg>
  );
}

export default NeuralNetwork;
