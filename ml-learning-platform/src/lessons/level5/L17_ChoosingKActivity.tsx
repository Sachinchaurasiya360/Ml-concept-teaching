"use client";

import { useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { TrendingDown, SplitSquareHorizontal, Crosshair } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";
import { LineChart, BarChart } from "../../components/viz/data-viz";
import {
  KMeansViz,
  generateClusters,
  type Point,
} from "../../components/viz/ml-algorithms";

/* ------------------------------------------------------------------ */
/*  Riku (red panda) dialogue bubble                                   */
/* ------------------------------------------------------------------ */
function RikuSays({ children }: { children: ReactNode }) {
  return (
    <div className="card-sketchy p-3 flex gap-3 items-start" style={{ background: "#fff8e7" }}>
      <span className="text-2xl" aria-hidden>🐼</span>
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tiny local helpers for WCSS / silhouette                            */
/* ------------------------------------------------------------------ */
interface Centroid { x: number; y: number }

function dist2(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt(dist2(a, b));
}

/** Deterministic k-means (Lloyd's) used only to compute WCSS/silhouette numbers. */
function kmeansLite(
  points: Point[],
  k: number,
  seed: number,
): { centroids: Centroid[]; labels: number[]; wcss: number } {
  // Seeded init: pick k points spaced through the dataset.
  const step = Math.max(1, Math.floor(points.length / k));
  let centroids: Centroid[] = Array.from({ length: k }, (_, i) => {
    const p = points[(i * step + (seed % step)) % points.length];
    return { x: p.x, y: p.y };
  });
  let labels = new Array<number>(points.length).fill(0);

  for (let iter = 0; iter < 25; iter++) {
    // assign
    const newLabels = points.map((p) => {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = dist2(p, centroids[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      return best;
    });

    // update
    const sums = Array.from({ length: k }, () => ({ sx: 0, sy: 0, n: 0 }));
    points.forEach((p, i) => {
      sums[newLabels[i]].sx += p.x;
      sums[newLabels[i]].sy += p.y;
      sums[newLabels[i]].n += 1;
    });
    const next: Centroid[] = sums.map((s, i) =>
      s.n > 0 ? { x: s.sx / s.n, y: s.sy / s.n } : centroids[i],
    );

    const converged = newLabels.every((l, i) => l === labels[i]);
    centroids = next;
    labels = newLabels;
    if (converged && iter > 0) break;
  }

  const wcss = points.reduce((sum, p, i) => sum + dist2(p, centroids[labels[i]]), 0);
  return { centroids, labels, wcss };
}

/** Average silhouette score per cluster (range -1..1). */
function silhouettePerCluster(points: Point[], labels: number[], k: number): number[] {
  const sils: number[] = new Array(points.length).fill(0);
  for (let i = 0; i < points.length; i++) {
    const myC = labels[i];
    let aSum = 0;
    let aN = 0;
    const otherSums = new Array(k).fill(0);
    const otherN = new Array(k).fill(0);
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const d = dist(points[i], points[j]);
      if (labels[j] === myC) {
        aSum += d;
        aN += 1;
      } else {
        otherSums[labels[j]] += d;
        otherN[labels[j]] += 1;
      }
    }
    const a = aN > 0 ? aSum / aN : 0;
    let b = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === myC || otherN[c] === 0) continue;
      const avg = otherSums[c] / otherN[c];
      if (avg < b) b = avg;
    }
    sils[i] = b === Infinity ? 0 : (b - a) / Math.max(a, b);
  }
  // average per cluster
  const sums = new Array(k).fill(0);
  const counts = new Array(k).fill(0);
  sils.forEach((s, i) => {
    sums[labels[i]] += s;
    counts[labels[i]] += 1;
  });
  return sums.map((s, i) => (counts[i] > 0 ? s / counts[i] : 0));
}

/* ------------------------------------------------------------------ */
/*  Shared dataset for the elbow plot + playground                     */
/* ------------------------------------------------------------------ */
const ELBOW_POINTS: Point[] = generateClusters(3, 18, 42);

/* ------------------------------------------------------------------ */
/*  Tab 1 -- The Elbow Method                                          */
/* ------------------------------------------------------------------ */
function ElbowTab() {
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const correctK = 3;

  const elbow = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const k = i + 1;
      const { wcss } = kmeansLite(ELBOW_POINTS, k, k * 17);
      return { x: k, y: wcss, label: `K=${k}` };
    });
  }, []);

  const handleGuess = useCallback(
    (k: number) => {
      if (revealed) return;
      playPop();
      setUserGuess(k);
    },
    [revealed],
  );

  const handleCheck = useCallback(() => {
    if (userGuess === null) return;
    if (userGuess === correctK) playSuccess();
    else playError();
    setRevealed(true);
  }, [userGuess]);

  const handleReset = useCallback(() => {
    playClick();
    setUserGuess(null);
    setRevealed(false);
  }, []);

  return (
    <div className="space-y-4">
      <RikuSays>
        The elbow of the curve is where adding more clusters stops paying off.
        Diminishing returns, for data. If the line flattens out, you have found your K.
      </RikuSays>

      <p className="font-hand text-sm text-center text-foreground">
        We ran K-Means for K=1 to K=8 and measured WCSS (within-cluster sum of squares).
        The elbow is where the curve bends.
      </p>

      <div className="card-sketchy p-3">
        <LineChart
          series={[{ name: "WCSS", data: elbow, color: "var(--accent-coral)" }]}
          smooth
          showArea
          xLabel="K (number of clusters)"
          yLabel="WCSS (inertia)"
          title="Elbow plot"
          height={280}
        />
      </div>

      <div className="flex gap-1.5 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold text-foreground self-center mr-2">
          Your guess for the elbow:
        </span>
        {elbow.map((e) => {
          const k = e.x;
          const isPicked = userGuess === k && !revealed;
          const isCorrect = revealed && k === correctK;
          const isWrong = revealed && userGuess === k && k !== correctK;
          return (
            <button
              key={k}
              onClick={() => handleGuess(k)}
              className={`w-9 h-9 rounded-full font-hand text-sm font-bold border-2 border-foreground transition-all ${
                isCorrect
                  ? "bg-accent-mint shadow-[2px_2px_0_#2b2a35] scale-110"
                  : isWrong
                  ? "bg-accent-coral"
                  : isPicked
                  ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                  : "bg-background hover:bg-accent-yellow/40"
              }`}
            >
              {k}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleCheck}
          disabled={userGuess === null || revealed}
          className="btn-sketchy text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Check My Answer
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          Reset
        </button>
      </div>

      {revealed && (
        <div
          className="card-sketchy p-3 text-center font-hand text-sm"
          style={{ background: userGuess === correctK ? "#e6fff8" : "#fff8e6" }}
        >
          {userGuess === correctK
            ? "Correct! K=3 is the elbow. After that, adding more clusters barely reduces WCSS."
            : "Not quite! The elbow is at K=3. After K=3, the WCSS drop flattens out significantly."}
        </div>
      )}

      <InfoBox variant="blue" title="The Elbow Method">
        Plot WCSS vs K. The "elbow" is where the curve bends sharply. Beyond that point,
        adding more clusters gives diminishing returns. That is your best K.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Good vs Bad Clusters (Silhouette)                         */
/* ------------------------------------------------------------------ */
function QualityTab() {
  const [k, setK] = useState(3);

  const { silhouetteBars, avgSil, wcss } = useMemo(() => {
    const { labels, wcss } = kmeansLite(ELBOW_POINTS, k, 777);
    const per = silhouettePerCluster(ELBOW_POINTS, labels, k);
    const bars = per.map((s, i) => ({
      label: `C${i + 1}`,
      value: Number(s.toFixed(2)),
      color:
        s > 0.5
          ? "var(--accent-mint)"
          : s > 0.25
          ? "var(--accent-yellow)"
          : "var(--accent-coral)",
    }));
    const avg = per.reduce((a, b) => a + b, 0) / per.length;
    return { silhouetteBars: bars, avgSil: avg, wcss };
  }, [k]);

  return (
    <div className="space-y-4">
      <RikuSays>
        Too few clusters and you lump everything together. Too many and every point is
        its own cluster. Classic Goldilocks. Silhouette scores help pick the sweet spot.
      </RikuSays>

      <p className="font-hand text-sm text-center text-foreground">
        Pick K and look at the silhouette score per cluster. Scores near 1 mean tight,
        well-separated clusters. Near 0 means overlap. Below 0 means misclassified.
      </p>

      <div className="flex items-center gap-2 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold text-foreground">K:</span>
        {[2, 3, 4, 5, 6].map((v) => (
          <button
            key={v}
            onClick={() => {
              playClick();
              setK(v);
            }}
            className={`w-9 h-9 rounded-full font-hand text-sm font-bold border-2 border-foreground transition-all ${
              k === v
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="card-sketchy p-3">
          <p className="font-hand text-xs font-bold text-center text-foreground mb-2">
            K-Means animation
          </p>
          <KMeansViz points={ELBOW_POINTS} initialK={k} key={`kmeans-${k}`} />
        </div>

        <div className="card-sketchy p-3 flex flex-col gap-3">
          <BarChart
            data={silhouetteBars}
            title="Silhouette per cluster"
            yLabel="score"
            height={240}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="font-hand text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Avg Silhouette
              </p>
              <p className="font-hand text-xl font-bold text-foreground">
                {avgSil.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="font-hand text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                WCSS
              </p>
              <p className="font-hand text-xl font-bold text-foreground">
                {wcss.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <InfoBox variant="indigo" title="Two Metrics">
        <strong>WCSS (inertia):</strong> total squared distance from each point to its centroid. Lower = tighter.
        <br />
        <strong>Silhouette Score:</strong> measures how well each point fits its cluster vs. neighboring clusters. Ranges from -1 to 1; higher is better.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Your Turn                                                 */
/* ------------------------------------------------------------------ */
interface DatasetOption {
  label: string;
  naturalK: number;
  seed: number;
  pointsPerCluster: number;
}

const DATASETS: DatasetOption[] = [
  { label: "Two Blobs", naturalK: 2, seed: 11, pointsPerCluster: 18 },
  { label: "Three Clusters", naturalK: 3, seed: 42, pointsPerCluster: 18 },
  { label: "Five Groups", naturalK: 5, seed: 91, pointsPerCluster: 14 },
];

function YourTurnTab() {
  const [dsIdx, setDsIdx] = useState(1);
  const [chosenK, setChosenK] = useState(3);

  const data = useMemo(() => {
    const ds = DATASETS[dsIdx];
    return generateClusters(ds.naturalK, ds.pointsPerCluster, ds.seed);
  }, [dsIdx]);

  const elbowSeries = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const k = i + 1;
      const { wcss } = kmeansLite(data, k, k * 13 + dsIdx * 100);
      return { x: k, y: wcss };
    });
  }, [data, dsIdx]);

  const naturalK = DATASETS[dsIdx].naturalK;
  const kDiff = Math.abs(chosenK - naturalK);

  return (
    <div className="space-y-4">
      <RikuSays>
        Pick a dataset, guess the best K, then check the elbow plot. The answer is hiding
        in the shape of the curve.
      </RikuSays>

      {/* Dataset picker */}
      <div className="flex gap-2 justify-center flex-wrap">
        {DATASETS.map((ds, i) => (
          <button
            key={ds.label}
            onClick={() => {
              playClick();
              setDsIdx(i);
            }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              dsIdx === i
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {ds.label}
          </button>
        ))}
      </div>

      {/* K picker */}
      <div className="flex items-center gap-2 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold text-foreground">Your K:</span>
        {[2, 3, 4, 5, 6].map((v) => (
          <button
            key={v}
            onClick={() => {
              playClick();
              setChosenK(v);
            }}
            className={`w-9 h-9 rounded-full font-hand text-sm font-bold border-2 border-foreground transition-all ${
              chosenK === v
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="card-sketchy p-3">
          <p className="font-hand text-xs font-bold text-center text-foreground mb-2">
            {DATASETS[dsIdx].label} -- K-Means with K={chosenK}
          </p>
          <KMeansViz points={data} initialK={chosenK} key={`kmeans-${dsIdx}-${chosenK}`} />
        </div>

        <div className="card-sketchy p-3">
          <LineChart
            series={[
              {
                name: "WCSS",
                data: elbowSeries,
                color: "var(--accent-sky)",
              },
            ]}
            smooth
            xLabel="K"
            yLabel="WCSS"
            title="Elbow plot"
            height={260}
          />
        </div>
      </div>

      <div
        className="card-sketchy p-3 text-center font-hand text-sm"
        style={{
          background: kDiff === 0 ? "#e6fff8" : kDiff === 1 ? "#fff8e6" : "#ffe8e8",
        }}
      >
        {kDiff === 0
          ? `Perfect! K=${chosenK} matches the natural number of clusters!`
          : kDiff === 1
          ? `Close! The optimal K is ${naturalK}. You were off by 1.`
          : `The optimal K is ${naturalK}. Check the elbow of the curve on the right.`}
      </div>

      <InfoBox variant="green" title="Practice Makes Perfect">
        Different datasets have different natural K values. Always check the elbow plot
        before deciding. The right K balances simplicity with accuracy.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is the 'elbow' in the Elbow Method?",
    options: [
      "The point where WCSS reaches zero",
      "The K value where the WCSS drop slows down sharply",
      "The maximum number of clusters possible",
      "The first K value on the chart",
    ],
    correctIndex: 1,
    explanation:
      "The elbow is where the rate of WCSS decrease drops off sharply. Beyond this K, more clusters add little benefit.",
  },
  {
    question: "What does a high silhouette score mean?",
    options: [
      "Clusters overlap a lot",
      "Points are far from their own cluster",
      "Points fit well in their cluster and poorly in others",
      "There are too many clusters",
    ],
    correctIndex: 2,
    explanation:
      "A high silhouette score means each point is close to its own cluster center and far from other clusters. Well-separated groups.",
  },
  {
    question: "If you set K too high, what happens?",
    options: [
      "Clusters capture real structure better",
      "The algorithm fails to run",
      "Natural groups get split unnecessarily",
      "WCSS increases dramatically",
    ],
    correctIndex: 2,
    explanation:
      "Setting K too high splits real groups into smaller, meaningless pieces. The clusters become artificial.",
  },
  {
    question: "Why can't we just pick the K with the lowest WCSS?",
    options: [
      "Because lowest WCSS always means K=1",
      "Because WCSS always decreases as K grows, so K=N would win",
      "Because WCSS is not related to K",
      "Because the algorithm does not compute WCSS",
    ],
    correctIndex: 1,
    explanation:
      "WCSS always drops as K increases. At K=N (every point is its own cluster), WCSS is zero. The elbow method finds where the benefit of more clusters becomes marginal.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L17_ChoosingKActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "elbow",
        label: "The Elbow Method",
        icon: <TrendingDown className="w-4 h-4" />,
        content: <ElbowTab />,
      },
      {
        id: "quality",
        label: "Silhouette Scores",
        icon: <SplitSquareHorizontal className="w-4 h-4" />,
        content: <QualityTab />,
      },
      {
        id: "yourturn",
        label: "Your Turn",
        icon: <Crosshair className="w-4 h-4" />,
        content: <YourTurnTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Choosing K & Evaluating Clusters"
      level={5}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Discover the Perceptron, the building block of neural networks!"
      story={
        <StorySection
          paragraphs={[
            "Aru stared at the clusters Byte had found. Something was bugging her.",
            "Aru: \"But how do I know how many groups to make? What if I pick the wrong number?\"",
            "Byte: \"Great question! We try K=1, 2, 3... and measure how tight the clusters are. When the improvement slows down, that's the elbow! That's the best K.\"",
            "Aru: \"So you literally look for a bend in a graph?\"",
            "Byte: \"Exactly! It's called the Elbow Method. Simple, visual, and surprisingly effective. Let me show you!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="The Elbow Method plots cluster tightness (WCSS) against K. The 'elbow', where the curve bends, indicates the optimal number of clusters. The Silhouette Score further validates cluster quality by measuring separation between groups."
        />
      }
    />
  );
}

