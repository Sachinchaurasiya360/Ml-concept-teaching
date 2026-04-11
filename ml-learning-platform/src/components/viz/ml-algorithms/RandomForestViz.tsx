"use client";

import { useMemo, useState } from "react";
import {
  generateClassification2D,
  mulberry32,
  CLUSTER_COLORS,
  type Point,
} from "./dataGenerator";
import { makeProjector, VIEWBOX } from "./utils";

export type RandomForestVizProps = {
  data?: Point[];
  numTrees?: number;
};

type Node = {
  feature?: "x" | "y";
  threshold?: number;
  label?: number;
  left?: Node;
  right?: Node;
};

function gini(points: Point[]) {
  if (points.length === 0) return 0;
  const counts = new Map<number, number>();
  for (const p of points)
    counts.set(p.label ?? 0, (counts.get(p.label ?? 0) ?? 0) + 1);
  let g = 1;
  for (const c of counts.values()) {
    const p = c / points.length;
    g -= p * p;
  }
  return g;
}

function majority(points: Point[]) {
  const counts = new Map<number, number>();
  for (const p of points)
    counts.set(p.label ?? 0, (counts.get(p.label ?? 0) ?? 0) + 1);
  let best = 0;
  let bestC = -1;
  for (const [l, c] of counts) {
    if (c > bestC) {
      best = l;
      bestC = c;
    }
  }
  return best;
}

function buildTree(points: Point[], depth: number, maxDepth: number): Node {
  if (depth >= maxDepth || points.length < 2 || gini(points) < 1e-4) {
    return { label: majority(points) };
  }
  let best: {
    feature: "x" | "y";
    threshold: number;
    left: Point[];
    right: Point[];
    gain: number;
  } | null = null;
  const parent = gini(points);
  for (const feature of ["x", "y"] as const) {
    const sorted = [...points].sort((a, b) => a[feature] - b[feature]);
    for (let i = 1; i < sorted.length; i++) {
      const t = (sorted[i - 1][feature] + sorted[i][feature]) / 2;
      const left = sorted.slice(0, i);
      const right = sorted.slice(i);
      const g =
        (left.length / sorted.length) * gini(left) +
        (right.length / sorted.length) * gini(right);
      const gain = parent - g;
      if (!best || gain > best.gain)
        best = { feature, threshold: t, left, right, gain };
    }
  }
  if (!best || best.gain < 1e-4) return { label: majority(points) };
  return {
    feature: best.feature,
    threshold: best.threshold,
    left: buildTree(best.left, depth + 1, maxDepth),
    right: buildTree(best.right, depth + 1, maxDepth),
    label: majority(points),
  };
}

function predictTree(node: Node, p: Point): number {
  if (node.feature === undefined || !node.left || !node.right)
    return node.label ?? 0;
  const val = node.feature === "x" ? p.x : p.y;
  return predictTree(
    val < (node.threshold ?? 0) ? node.left : node.right,
    p
  );
}

function bootstrap(points: Point[], seed: number): Point[] {
  const rand = mulberry32(seed);
  const out: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    out.push(points[Math.floor(rand() * points.length)]);
  }
  return out;
}

export default function RandomForestViz({
  data: propData,
  numTrees: initialNumTrees = 5,
}: RandomForestVizProps) {
  const defaultData = useMemo(() => generateClassification2D(40, 29), []);
  const data = propData ?? defaultData;

  const [numTrees, setNumTrees] = useState(initialNumTrees);
  const [testPoint, setTestPoint] = useState<Point | null>(null);

  const forest = useMemo(() => {
    const trees: Node[] = [];
    for (let i = 0; i < numTrees; i++) {
      const sample = bootstrap(data, 100 + i);
      trees.push(buildTree(sample, 0, 3));
    }
    return trees;
  }, [data, numTrees]);

  const votes = useMemo(() => {
    if (!testPoint) return null;
    const v = forest.map((t) => predictTree(t, testPoint));
    const counts = new Map<number, number>();
    for (const label of v) counts.set(label, (counts.get(label) ?? 0) + 1);
    let best = 0;
    let bestC = -1;
    for (const [l, c] of counts) {
      if (c > bestC) {
        best = l;
        bestC = c;
      }
    }
    return { v, counts, final: best };
  }, [forest, testPoint]);

  const proj = makeProjector(VIEWBOX, 6);

  function sampleRegions(tree: Node): {
    x: number;
    y: number;
    label: number;
  }[] {
    const step = 8;
    const cells: { x: number; y: number; label: number }[] = [];
    for (let gx = 0; gx < 100; gx += step) {
      for (let gy = 0; gy < 100; gy += step) {
        cells.push({
          x: gx,
          y: gy,
          label: predictTree(tree, { x: gx + step / 2, y: gy + step / 2 }),
        });
      }
    }
    return cells;
  }

  function handleBigClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * VIEWBOX;
    const sy = ((e.clientY - rect.top) / rect.height) * VIEWBOX;
    setTestPoint({ x: proj.invX(sx), y: proj.invY(sy) });
  }

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-hand text-2xl">Random Forest</h3>
        <div className="font-hand flex items-center gap-2">
          <label>trees = {numTrees}</label>
          <input
            type="range"
            min={1}
            max={10}
            value={numTrees}
            onChange={(e) => setNumTrees(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_220px] gap-4">
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="w-full h-auto bg-background border-2 border-foreground rounded-xl cursor-crosshair"
          onClick={handleBigClick}
          role="img"
          aria-label="Click to classify a test point through the forest"
        >
          {data.map((p, i) => (
            <circle
              key={`p-${i}`}
              cx={proj.px(p.x)}
              cy={proj.py(p.y)}
              r={1.7}
              fill={CLUSTER_COLORS[p.label ?? 0]}
              stroke="#2b2a35"
              strokeWidth={0.6}
            />
          ))}
          {testPoint && (
            <circle
              cx={proj.px(testPoint.x)}
              cy={proj.py(testPoint.y)}
              r={3}
              fill={CLUSTER_COLORS[votes?.final ?? 0]}
              stroke="#2b2a35"
              strokeWidth={1.2}
            />
          )}
        </svg>

        <div className="font-hand text-sm space-y-2">
          <div className="p-2 border-2 border-dashed border-foreground/60 rounded-md">
            {testPoint && votes ? (
              <>
                <div>
                  final vote:{" "}
                  <span
                    className="font-bold"
                    style={{ color: CLUSTER_COLORS[votes.final] }}
                  >
                    class {votes.final}
                  </span>
                </div>
                <div className="mt-1">
                  breakdown: {Array.from(votes.counts.entries())
                    .map(([l, c]) => `${l}:${c}`)
                    .join(" · ")}
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">
                click the big plot to vote
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mini trees */}
      <div className="mt-4">
        <div className="font-hand text-lg mb-1">Trees in the forest</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {forest.map((tree, i) => {
            const cells = sampleRegions(tree);
            const vote = testPoint ? predictTree(tree, testPoint) : null;
            return (
              <div
                key={`tree-${i}`}
                className="border-2 border-foreground rounded-lg overflow-hidden bg-background"
              >
                <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="w-full">
                  {cells.map((c, j) => (
                    <rect
                      key={`c-${j}`}
                      x={proj.px(c.x)}
                      y={proj.py(c.y + 8)}
                      width={proj.px(c.x + 8) - proj.px(c.x)}
                      height={proj.py(c.y) - proj.py(c.y + 8)}
                      fill={CLUSTER_COLORS[c.label]}
                      fillOpacity={0.35}
                    />
                  ))}
                  {testPoint && (
                    <circle
                      cx={proj.px(testPoint.x)}
                      cy={proj.py(testPoint.y)}
                      r={2.5}
                      fill={CLUSTER_COLORS[vote ?? 0]}
                      stroke="#2b2a35"
                      strokeWidth={0.9}
                    />
                  )}
                </svg>
                <div className="font-hand text-xs text-center py-1 border-t border-foreground/40">
                  tree {i + 1}
                  {vote !== null && (
                    <span
                      className="ml-1 font-bold"
                      style={{ color: CLUSTER_COLORS[vote] }}
                    >
                      → {vote}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
