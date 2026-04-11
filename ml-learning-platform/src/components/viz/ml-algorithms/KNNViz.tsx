"use client";

import { useMemo, useState } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import {
  generateClassification2D,
  CLUSTER_COLORS,
  type Point,
} from "./dataGenerator";
import {
  distance,
  makeProjector,
  majorityLabel,
  VIEWBOX,
} from "./utils";

export type KNNVizProps = {
  points?: Point[];
  initialK?: number;
  initialMetric?: "euclidean" | "manhattan";
};

export default function KNNViz({
  points: propPoints,
  initialK = 3,
  initialMetric = "euclidean",
}: KNNVizProps) {
  const defaultPoints = useMemo(() => generateClassification2D(30, 11), []);
  const points = propPoints ?? defaultPoints;

  const [k, setK] = useState(initialK);
  const [metric, setMetric] = useState<"euclidean" | "manhattan">(initialMetric);
  const [testPoint, setTestPoint] = useState<Point | null>(null);

  const proj = makeProjector(VIEWBOX, 6);

  const labels = useMemo(() => {
    const set = new Set<number>();
    for (const p of points) if (p.label !== undefined) set.add(p.label);
    return Array.from(set).sort();
  }, [points]);

  // Compute K nearest neighbours to the test point.
  const classification = useMemo(() => {
    if (!testPoint) return null;
    const ranked = points
      .map((p, i) => ({ i, p, d: distance(testPoint, p, metric) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, Math.min(k, points.length));
    const neighborLabels = ranked
      .map((r) => r.p.label)
      .filter((l): l is number => l !== undefined);
    const predicted = neighborLabels.length > 0 ? majorityLabel(neighborLabels) : 0;
    const votes = new Map<number, number>();
    for (const l of neighborLabels) votes.set(l, (votes.get(l) ?? 0) + 1);
    return { ranked, predicted, votes };
  }, [testPoint, points, k, metric]);

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * VIEWBOX;
    const sy = ((e.clientY - rect.top) / rect.height) * VIEWBOX;
    setTestPoint({ x: proj.invX(sx), y: proj.invY(sy) });
  }

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-hand text-2xl">K-Nearest Neighbors</h3>
        <div className="flex items-center gap-2">
          <button
            className="btn-sketchy-outline"
            onClick={() => setTestPoint(null)}
            type="button"
          >
            <RotateCcw size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_240px] gap-4">
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="w-full h-auto cursor-crosshair bg-background border-2 border-foreground rounded-xl"
          onClick={handleSvgClick}
          role="img"
          aria-label="Scatter plot with clickable classification area"
        >
          {/* grid */}
          {Array.from({ length: 9 }, (_, i) => (i + 1) * 10).map((t) => (
            <g key={t}>
              <line
                x1={proj.px(t)}
                y1={proj.py(0)}
                x2={proj.px(t)}
                y2={proj.py(100)}
                stroke="#2b2a35"
                strokeOpacity={0.08}
                strokeWidth={0.4}
              />
              <line
                x1={proj.px(0)}
                y1={proj.py(t)}
                x2={proj.px(100)}
                y2={proj.py(t)}
                stroke="#2b2a35"
                strokeOpacity={0.08}
                strokeWidth={0.4}
              />
            </g>
          ))}

          {/* neighbor connection lines */}
          {testPoint &&
            classification &&
            classification.ranked.map((r) => (
              <line
                key={`nb-${r.i}`}
                x1={proj.px(testPoint.x)}
                y1={proj.py(testPoint.y)}
                x2={proj.px(r.p.x)}
                y2={proj.py(r.p.y)}
                stroke="var(--accent-yellow)"
                strokeWidth={1}
                strokeDasharray="2 1.5"
              />
            ))}

          {/* data points */}
          {points.map((p, i) => {
            const isNeighbor = classification?.ranked.some((r) => r.i === i);
            const color = CLUSTER_COLORS[p.label ?? 0];
            return (
              <circle
                key={`p-${i}`}
                cx={proj.px(p.x)}
                cy={proj.py(p.y)}
                r={isNeighbor ? 2.4 : 1.7}
                fill={color}
                stroke="#2b2a35"
                strokeWidth={isNeighbor ? 1.1 : 0.6}
              />
            );
          })}

          {/* test point */}
          {testPoint && (
            <g>
              <circle
                cx={proj.px(testPoint.x)}
                cy={proj.py(testPoint.y)}
                r={3}
                fill={CLUSTER_COLORS[classification?.predicted ?? 0]}
                stroke="#2b2a35"
                strokeWidth={1.4}
              />
              <circle
                cx={proj.px(testPoint.x)}
                cy={proj.py(testPoint.y)}
                r={4.5}
                fill="none"
                stroke="#2b2a35"
                strokeWidth={0.7}
                strokeDasharray="1.5 1"
              />
            </g>
          )}
        </svg>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between font-hand text-lg">
              <span>k = {k}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="p-1 border-2 border-foreground rounded-md bg-background hover:bg-muted"
                  onClick={() => setK((v) => Math.max(1, v - 1))}
                  aria-label="Decrease k"
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  className="p-1 border-2 border-foreground rounded-md bg-background hover:bg-muted"
                  onClick={() => setK((v) => Math.min(15, v + 1))}
                  aria-label="Increase k"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={k}
              onChange={(e) => setK(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="font-hand text-lg mb-1">Distance</div>
            <div className="flex gap-2">
              {(["euclidean", "manhattan"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`font-hand px-3 py-1 border-2 border-foreground rounded-md text-sm ${
                    metric === m ? "bg-accent-yellow" : "bg-background"
                  }`}
                  style={{
                    background:
                      metric === m ? "var(--accent-yellow)" : "#fdfbf6",
                  }}
                  onClick={() => setMetric(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="font-hand text-sm p-2 border-2 border-dashed border-foreground/60 rounded-md">
            {testPoint ? (
              classification ? (
                <>
                  <div>
                    predicted:{" "}
                    <span
                      className="font-bold"
                      style={{
                        color: CLUSTER_COLORS[classification.predicted],
                      }}
                    >
                      class {classification.predicted}
                    </span>
                  </div>
                  <div className="mt-1">
                    votes:{" "}
                    {labels.map((l) => (
                      <span key={l} className="mr-2">
                        {l}:{classification.votes.get(l) ?? 0}
                      </span>
                    ))}
                  </div>
                </>
              ) : null
            ) : (
              <span className="text-muted-foreground">
                click the plot to classify a test point
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
