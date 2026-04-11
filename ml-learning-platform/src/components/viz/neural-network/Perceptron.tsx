"use client";

import { useMemo, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { WeightSlider } from "./WeightSlider";
import { clamp, fmt } from "./utils";

export interface PerceptronPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

export interface PerceptronProps {
  points?: PerceptronPoint[];
  initialWeights?: [number, number];
  initialBias?: number;
  /** Bounds of the plot in data coordinates. */
  range?: [number, number];
  width?: number;
  height?: number;
}

const DEFAULT_POINTS: PerceptronPoint[] = [
  { x: -2, y: -1, label: 0 },
  { x: -1.2, y: -2, label: 0 },
  { x: -2.5, y: 1, label: 0 },
  { x: -0.5, y: -1.2, label: 0 },
  { x: 1.5, y: 1.2, label: 1 },
  { x: 2.2, y: 2.5, label: 1 },
  { x: 1, y: 2, label: 1 },
  { x: 2.8, y: 0.8, label: 1 },
];

/** Interactive 2D perceptron with a live decision boundary and sliders. */
export function Perceptron({
  points = DEFAULT_POINTS,
  initialWeights = [1, 1],
  initialBias = 0,
  range = [-4, 4],
  width = 420,
  height = 420,
}: PerceptronProps) {
  const [w1, setW1] = useState(initialWeights[0]);
  const [w2, setW2] = useState(initialWeights[1]);
  const [bias, setBias] = useState(initialBias);
  const [pts, setPts] = useState<PerceptronPoint[]>(points);
  const [addMode, setAddMode] = useState<0 | 1 | null>(null);

  const [lo, hi] = range;
  const pad = 36;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const toPxX = (x: number) => pad + ((x - lo) / (hi - lo)) * innerW;
  const toPxY = (y: number) => pad + (1 - (y - lo) / (hi - lo)) * innerH;

  // Classification helper.
  const classify = (x: number, y: number) =>
    w1 * x + w2 * y + bias >= 0 ? 1 : 0;

  const accuracy = useMemo(() => {
    if (pts.length === 0) return 1;
    let correct = 0;
    for (const p of pts) if (classify(p.x, p.y) === p.label) correct++;
    return correct / pts.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pts, w1, w2, bias]);

  // Decision boundary endpoints within the bounding box.
  const boundary = useMemo(() => {
    // Line: w1*x + w2*y + b = 0
    const eps = 1e-6;
    if (Math.abs(w2) > eps) {
      const y1 = (-w1 * lo - bias) / w2;
      const y2 = (-w1 * hi - bias) / w2;
      return { x1: lo, y1, x2: hi, y2 };
    }
    if (Math.abs(w1) > eps) {
      const x = -bias / w1;
      return { x1: x, y1: lo, x2: x, y2: hi };
    }
    return null;
  }, [w1, w2, bias, lo, hi]);

  // Decision region shading polygon: we fill everywhere classify=1.
  const shadePath = useMemo(() => {
    if (!boundary) return null;
    // Build the half-plane polygon clipped to the box.
    const corners = [
      { x: lo, y: lo },
      { x: hi, y: lo },
      { x: hi, y: hi },
      { x: lo, y: hi },
    ];
    const inside: { x: number; y: number }[] = [];
    // Walk the boundary line across the box; simpler: test each corner + add intersection points.
    // For a simple visualization we take the boundary line and draw a polygon from it to each "class 1" corner.
    const classifyCorner = (p: { x: number; y: number }) => classify(p.x, p.y) === 1;
    // Use ordered box traversal and swap on boundary crossings.
    for (let i = 0; i < corners.length; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % corners.length];
      if (classifyCorner(a)) inside.push(a);
      // Check crossing between a and b.
      const fa = w1 * a.x + w2 * a.y + bias;
      const fb = w1 * b.x + w2 * b.y + bias;
      if ((fa >= 0 && fb < 0) || (fa < 0 && fb >= 0)) {
        const t = fa / (fa - fb);
        inside.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      }
    }
    if (inside.length < 3) return null;
    return inside
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toPxX(p.x)} ${toPxY(p.y)}`)
      .join(" ") + " Z";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundary, w1, w2, bias, lo, hi]);

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (addMode == null) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    // Need viewBox-aware transform.
    const vbX = ((e.clientX - rect.left) / rect.width) * width;
    const vbY = ((e.clientY - rect.top) / rect.height) * height;
    const x = clamp(lo + ((vbX - pad) / innerW) * (hi - lo), lo, hi);
    const y = clamp(lo + (1 - (vbY - pad) / innerH) * (hi - lo), lo, hi);
    setPts((prev) => [...prev, { x, y, label: addMode }]);
  }

  return (
    <div className="w-full max-w-[520px]">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onClick={handleClick}
        style={{ cursor: addMode != null ? "crosshair" : "default" }}
        role="img"
        aria-label="2D perceptron with live decision boundary"
      >
        {/* plot area */}
        <rect
          x={pad}
          y={pad}
          width={innerW}
          height={innerH}
          fill="#fff"
          stroke="#2b2a35"
          strokeWidth={2}
          rx={12}
        />

        {/* grid */}
        {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((t) => (
          <g key={`g-${t}`}>
            <line
              x1={toPxX(t)}
              x2={toPxX(t)}
              y1={pad}
              y2={pad + innerH}
              stroke="#2b2a35"
              strokeOpacity={0.08}
            />
            <line
              x1={pad}
              x2={pad + innerW}
              y1={toPxY(t)}
              y2={toPxY(t)}
              stroke="#2b2a35"
              strokeOpacity={0.08}
            />
          </g>
        ))}

        {/* axes */}
        <line
          x1={pad}
          x2={pad + innerW}
          y1={toPxY(0)}
          y2={toPxY(0)}
          stroke="#2b2a35"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
        <line
          x1={toPxX(0)}
          x2={toPxX(0)}
          y1={pad}
          y2={pad + innerH}
          stroke="#2b2a35"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />

        {/* decision region shading */}
        {shadePath ? (
          <path d={shadePath} fill="var(--accent-mint)" fillOpacity={0.18} />
        ) : null}

        {/* boundary line */}
        {boundary ? (
          <line
            x1={toPxX(boundary.x1)}
            y1={toPxY(boundary.y1)}
            x2={toPxX(boundary.x2)}
            y2={toPxY(boundary.y2)}
            stroke="var(--accent-lav)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ) : null}

        {/* points */}
        {pts.map((p, i) => {
          const predicted = classify(p.x, p.y);
          const correct = predicted === p.label;
          const baseFill =
            p.label === 1 ? "var(--accent-mint)" : "var(--accent-coral)";
          return (
            <g key={`p-${i}`}>
              <circle
                cx={toPxX(p.x)}
                cy={toPxY(p.y)}
                r={9}
                fill={baseFill}
                stroke={correct ? "#2b2a35" : "var(--accent-yellow)"}
                strokeWidth={correct ? 2 : 3.5}
              />
              {!correct ? (
                <circle
                  cx={toPxX(p.x)}
                  cy={toPxY(p.y)}
                  r={14}
                  fill="none"
                  stroke="var(--accent-yellow)"
                  strokeWidth={1.2}
                  strokeDasharray="2 2"
                />
              ) : null}
            </g>
          );
        })}

        {/* accuracy label */}
        <g transform={`translate(${pad + 10}, ${pad + 10})`}>
          <rect
            x={0}
            y={0}
            width={110}
            height={26}
            rx={8}
            fill="#fdfbf6"
            stroke="#2b2a35"
            strokeWidth={1.5}
          />
          <text
            x={8}
            y={17}
            className="font-hand"
            fontSize={14}
            fill="#2b2a35"
          >
            acc: {(accuracy * 100).toFixed(0)}%
          </text>
        </g>
      </svg>

      <div className="mt-3 space-y-2">
        <WeightSlider label="w1" value={w1} onChange={setW1} />
        <WeightSlider label="w2" value={w2} onChange={setW2} />
        <WeightSlider label="bias" value={bias} onChange={setBias} min={-4} max={4} />
      </div>

      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <button
          className="btn-sketchy-outline"
          onClick={() => setAddMode(addMode === 0 ? null : 0)}
          style={
            addMode === 0 ? { background: "var(--accent-coral)" } : undefined
          }
          type="button"
        >
          <Plus size={16} /> Add class 0
        </button>
        <button
          className="btn-sketchy-outline"
          onClick={() => setAddMode(addMode === 1 ? null : 1)}
          style={
            addMode === 1 ? { background: "var(--accent-mint)" } : undefined
          }
          type="button"
        >
          <Plus size={16} /> Add class 1
        </button>
        <button
          className="btn-sketchy-outline"
          onClick={() => {
            setPts(points);
            setW1(initialWeights[0]);
            setW2(initialWeights[1]);
            setBias(initialBias);
            setAddMode(null);
          }}
          type="button"
        >
          <RotateCcw size={16} /> Reset
        </button>
        <span className="font-hand text-[14px] text-muted-foreground ml-auto">
          line: {fmt(w1)}·x + {fmt(w2)}·y + {fmt(bias)} = 0
        </span>
      </div>
    </div>
  );
}

export default Perceptron;
