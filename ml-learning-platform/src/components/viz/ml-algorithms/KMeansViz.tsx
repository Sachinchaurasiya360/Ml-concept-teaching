"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, StepForward } from "lucide-react";
import {
  generateClusters,
  mulberry32,
  CLUSTER_COLORS,
  type Point,
} from "./dataGenerator";
import { makeProjector, VIEWBOX } from "./utils";

export type KMeansVizProps = {
  points?: Point[];
  initialK?: number;
};

type Centroid = { x: number; y: number };

function randomCentroids(k: number, seed: number): Centroid[] {
  const rand = mulberry32(seed);
  const out: Centroid[] = [];
  for (let i = 0; i < k; i++) {
    out.push({ x: 15 + rand() * 70, y: 15 + rand() * 70 });
  }
  return out;
}

function assign(points: Point[], centroids: Centroid[]): number[] {
  return points.map((p) => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < centroids.length; i++) {
      const dx = p.x - centroids[i].x;
      const dy = p.y - centroids[i].y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  });
}

function updateCentroids(
  points: Point[],
  assignments: number[],
  k: number,
  fallback: Centroid[]
): Centroid[] {
  const sums = Array.from({ length: k }, () => ({ x: 0, y: 0, n: 0 }));
  points.forEach((p, i) => {
    const a = assignments[i];
    sums[a].x += p.x;
    sums[a].y += p.y;
    sums[a].n += 1;
  });
  return sums.map((s, i) =>
    s.n > 0 ? { x: s.x / s.n, y: s.y / s.n } : fallback[i]
  );
}

export default function KMeansViz({
  points: propPoints,
  initialK = 3,
}: KMeansVizProps) {
  const defaultPoints = useMemo(() => generateClusters(3, 18, 42), []);
  const points = propPoints ?? defaultPoints;

  const [k, setK] = useState(initialK);
  const [seed, setSeed] = useState(1);
  const [centroids, setCentroids] = useState<Centroid[]>(() =>
    randomCentroids(initialK, 1)
  );
  const [assignments, setAssignments] = useState<number[]>(() =>
    assign(points, randomCentroids(initialK, 1))
  );
  const [iteration, setIteration] = useState(0);
  const [converged, setConverged] = useState(false);
  const [playing, setPlaying] = useState(false);

  const proj = makeProjector(VIEWBOX, 6);

  const reset = useCallback(
    (newK: number, newSeed: number) => {
      const c = randomCentroids(newK, newSeed);
      setCentroids(c);
      setAssignments(assign(points, c));
      setIteration(0);
      setConverged(false);
      setPlaying(false);
    },
    [points]
  );

  // Re-initialize when k changes.
  useEffect(() => {
    reset(k, seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);

  const step = useCallback(() => {
    setCentroids((curr) => {
      const newAssignments = assign(points, curr);
      const newCentroids = updateCentroids(points, newAssignments, k, curr);
      let moved = 0;
      for (let i = 0; i < curr.length; i++) {
        const dx = curr[i].x - newCentroids[i].x;
        const dy = curr[i].y - newCentroids[i].y;
        moved += Math.sqrt(dx * dx + dy * dy);
      }
      setAssignments(newAssignments);
      setIteration((it) => it + 1);
      if (moved < 0.5) {
        setConverged(true);
        setPlaying(false);
      }
      return newCentroids;
    });
  }, [points, k]);

  // Auto-play loop
  const playingRef = useRef(playing);
  playingRef.current = playing;
  useEffect(() => {
    if (!playing || converged) return;
    const t = setTimeout(() => {
      if (playingRef.current) step();
    }, 500);
    return () => clearTimeout(t);
  }, [playing, iteration, converged, step]);

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-hand text-2xl">K-Means Clustering</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-sketchy-outline"
            onClick={step}
            disabled={converged}
          >
            <StepForward size={16} />
            Step
          </button>
          <button
            type="button"
            className="btn-sketchy"
            onClick={() => setPlaying((p) => !p)}
            disabled={converged}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className="btn-sketchy-outline"
            onClick={() => {
              const s = seed + 1;
              setSeed(s);
              reset(k, s);
            }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_220px] gap-4">
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="w-full h-auto bg-background border-2 border-foreground rounded-xl"
        >
          {points.map((p, i) => {
            const a = assignments[i] ?? 0;
            return (
              <circle
                key={`p-${i}`}
                cx={proj.px(p.x)}
                cy={proj.py(p.y)}
                r={1.8}
                fill={CLUSTER_COLORS[a]}
                stroke="#2b2a35"
                strokeWidth={0.6}
              />
            );
          })}
          {centroids.map((c, i) => (
            <g key={`c-${i}`}>
              <circle
                cx={proj.px(c.x)}
                cy={proj.py(c.y)}
                r={3.8}
                fill={CLUSTER_COLORS[i]}
                stroke="#2b2a35"
                strokeWidth={1.3}
              />
              <line
                x1={proj.px(c.x) - 2}
                y1={proj.py(c.y)}
                x2={proj.px(c.x) + 2}
                y2={proj.py(c.y)}
                stroke="#2b2a35"
                strokeWidth={0.8}
              />
              <line
                x1={proj.px(c.x)}
                y1={proj.py(c.y) - 2}
                x2={proj.px(c.x)}
                y2={proj.py(c.y) + 2}
                stroke="#2b2a35"
                strokeWidth={0.8}
              />
            </g>
          ))}
        </svg>

        <div className="space-y-3 font-hand">
          <div>
            <label htmlFor="km-k">k = {k}</label>
            <input
              id="km-k"
              type="range"
              min={2}
              max={8}
              value={k}
              onChange={(e) => setK(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="p-2 border-2 border-dashed border-foreground/60 rounded-md text-sm">
            iteration: <span className="font-bold">{iteration}</span>
            <div
              className={`mt-1 ${
                converged ? "text-accent-mint" : "text-muted-foreground"
              }`}
              style={{ color: converged ? "var(--accent-mint)" : undefined }}
            >
              {converged ? "converged!" : "not yet converged"}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            each step reassigns points then recomputes centroids (Lloyd&apos;s
            algorithm).
          </p>
        </div>
      </div>
    </div>
  );
}
