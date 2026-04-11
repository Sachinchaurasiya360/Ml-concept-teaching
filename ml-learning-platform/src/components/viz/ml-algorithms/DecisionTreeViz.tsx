"use client";

import { useMemo, useState } from "react";
import {
  generateClassification2D,
  CLUSTER_COLORS,
  type Point,
} from "./dataGenerator";
import { makeProjector, VIEWBOX } from "./utils";

export type DecisionTreeVizProps = {
  data?: Point[];
  maxDepth?: number;
};

type TreeNode = {
  id: number;
  depth: number;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  points: Point[];
  label?: number;
  // split
  feature?: "x" | "y";
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
};

let nodeId = 0;
function nextId() {
  return nodeId++;
}

function gini(points: Point[]): number {
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

function majority(points: Point[]): number {
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

function bestSplit(points: Point[]) {
  if (points.length < 2) return null;
  let best: {
    feature: "x" | "y";
    threshold: number;
    left: Point[];
    right: Point[];
    gain: number;
  } | null = null;
  const parentG = gini(points);
  for (const feature of ["x", "y"] as const) {
    const sorted = [...points].sort((a, b) => a[feature] - b[feature]);
    for (let i = 1; i < sorted.length; i++) {
      const t = (sorted[i - 1][feature] + sorted[i][feature]) / 2;
      const left = sorted.slice(0, i);
      const right = sorted.slice(i);
      const g =
        (left.length / sorted.length) * gini(left) +
        (right.length / sorted.length) * gini(right);
      const gain = parentG - g;
      if (!best || gain > best.gain) {
        best = { feature, threshold: t, left, right, gain };
      }
    }
  }
  return best && best.gain > 1e-4 ? best : null;
}

function buildTree(
  points: Point[],
  bounds: TreeNode["bounds"],
  depth: number,
  maxDepth: number
): TreeNode {
  const node: TreeNode = {
    id: nextId(),
    depth,
    bounds,
    points,
    label: majority(points),
  };
  if (depth >= maxDepth || points.length < 2 || gini(points) < 1e-4) return node;
  const split = bestSplit(points);
  if (!split) return node;
  node.feature = split.feature;
  node.threshold = split.threshold;
  const leftBounds = { ...bounds };
  const rightBounds = { ...bounds };
  if (split.feature === "x") {
    leftBounds.maxX = split.threshold;
    rightBounds.minX = split.threshold;
  } else {
    leftBounds.maxY = split.threshold;
    rightBounds.minY = split.threshold;
  }
  node.left = buildTree(split.left, leftBounds, depth + 1, maxDepth);
  node.right = buildTree(split.right, rightBounds, depth + 1, maxDepth);
  return node;
}

function collectLeaves(node: TreeNode, out: TreeNode[] = []) {
  if (!node.left && !node.right) {
    out.push(node);
    return out;
  }
  if (node.left) collectLeaves(node.left, out);
  if (node.right) collectLeaves(node.right, out);
  return out;
}

type Layout = { node: TreeNode; x: number; y: number };
function layoutTree(root: TreeNode): Layout[] {
  const layouts: Layout[] = [];
  const leaves = collectLeaves(root);
  const leafX = new Map<number, number>();
  leaves.forEach((leaf, i) => {
    leafX.set(leaf.id, (i + 0.5) / leaves.length);
  });

  function walk(node: TreeNode, depth: number): number {
    let x: number;
    if (!node.left && !node.right) {
      x = leafX.get(node.id) ?? 0.5;
    } else {
      const lx = node.left ? walk(node.left, depth + 1) : 0.5;
      const rx = node.right ? walk(node.right, depth + 1) : 0.5;
      x = (lx + rx) / 2;
    }
    layouts.push({ node, x, y: depth });
    return x;
  }
  walk(root, 0);
  return layouts;
}

export default function DecisionTreeViz({
  data: propData,
  maxDepth = 4,
}: DecisionTreeVizProps) {
  const defaultData = useMemo(() => generateClassification2D(40, 17), []);
  const data = propData ?? defaultData;

  const [depth, setDepth] = useState(Math.min(3, maxDepth));

  const tree = useMemo(() => {
    nodeId = 0;
    return buildTree(
      data,
      { minX: 0, maxX: 100, minY: 0, maxY: 100 },
      0,
      depth
    );
  }, [data, depth]);

  const leaves = useMemo(() => collectLeaves(tree), [tree]);
  const layouts = useMemo(() => layoutTree(tree), [tree]);
  const maxLayoutDepth = Math.max(1, ...layouts.map((l) => l.y));

  const proj = makeProjector(VIEWBOX, 6);

  return (
    <div className="card-sketchy p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="font-hand text-2xl">Decision Tree</h3>
        <div className="flex items-center gap-2 font-hand">
          <label htmlFor="dt-depth">depth: {depth}</label>
          <input
            id="dt-depth"
            type="range"
            min={1}
            max={maxDepth}
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* SCATTER + REGIONS */}
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="w-full h-auto bg-background border-2 border-foreground rounded-xl"
        >
          {leaves.map((leaf) => {
            const color = CLUSTER_COLORS[leaf.label ?? 0];
            const x = proj.px(leaf.bounds.minX);
            const w = proj.px(leaf.bounds.maxX) - proj.px(leaf.bounds.minX);
            // y axis is flipped, so maxY becomes top
            const y = proj.py(leaf.bounds.maxY);
            const h = proj.py(leaf.bounds.minY) - proj.py(leaf.bounds.maxY);
            return (
              <rect
                key={`leaf-${leaf.id}`}
                x={x}
                y={y}
                width={w}
                height={h}
                fill={color}
                fillOpacity={0.22}
                stroke={color}
                strokeOpacity={0.65}
                strokeWidth={0.6}
                strokeDasharray="2 1.5"
              />
            );
          })}

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
        </svg>

        {/* TREE DIAGRAM */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-auto bg-background border-2 border-foreground rounded-xl"
        >
          {layouts.map(({ node, x, y }) => {
            const px = 5 + x * 90;
            const py = 8 + (y / (maxLayoutDepth || 1)) * 80;
            const children: Layout[] = [];
            if (node.left)
              children.push(layouts.find((l) => l.node === node.left)!);
            if (node.right)
              children.push(layouts.find((l) => l.node === node.right)!);
            return (
              <g key={`tnode-${node.id}`}>
                {children.map((child) => {
                  const cx = 5 + child.x * 90;
                  const cy = 8 + (child.y / (maxLayoutDepth || 1)) * 80;
                  return (
                    <line
                      key={`edge-${node.id}-${child.node.id}`}
                      x1={px}
                      y1={py}
                      x2={cx}
                      y2={cy}
                      stroke="#2b2a35"
                      strokeWidth={0.6}
                      strokeDasharray="2 1.5"
                    />
                  );
                })}
              </g>
            );
          })}
          {layouts.map(({ node, x, y }) => {
            const px = 5 + x * 90;
            const py = 8 + (y / (maxLayoutDepth || 1)) * 80;
            const isLeaf = !node.left && !node.right;
            return (
              <g key={`tn-${node.id}`}>
                <circle
                  cx={px}
                  cy={py}
                  r={3.2}
                  fill={
                    isLeaf
                      ? CLUSTER_COLORS[node.label ?? 0]
                      : "#fdfbf6"
                  }
                  stroke="#2b2a35"
                  strokeWidth={0.8}
                />
                {!isLeaf && node.feature && node.threshold !== undefined && (
                  <text
                    x={px}
                    y={py - 4.2}
                    fontFamily="Kalam, cursive"
                    fontSize={2.6}
                    textAnchor="middle"
                    fill="#2b2a35"
                  >
                    {node.feature} &lt; {node.threshold.toFixed(0)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="font-hand text-sm text-muted-foreground mt-2">
        Greedy splits by Gini impurity. Each leaf gets the majority label.
      </p>
    </div>
  );
}
