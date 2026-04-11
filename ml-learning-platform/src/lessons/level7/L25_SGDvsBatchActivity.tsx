"use client";

import { useMemo, useState } from "react";
import { Layers, Sparkles, SlidersHorizontal } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { GradientDescentViz } from "../../components/viz/ml-algorithms";
import { LossLandscape, mulberry32 } from "../../components/viz/neural-network";
import { LineChart } from "../../components/viz/data-viz";

/* ------------------------------------------------------------------ */
/*  Riku (red panda mascot) dialogue helper                            */
/* ------------------------------------------------------------------ */
function RikuSays({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="card-sketchy p-3 flex gap-3 items-start"
      style={{ background: "#fff8e7" }}
    >
      <span className="text-2xl" aria-hidden>
        🐼
      </span>
      <p className="font-hand text-sm text-foreground leading-snug">
        {children}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared loss functions for the three GD demos                       */
/* ------------------------------------------------------------------ */
// A smooth skewed bowl in [0,100]^2 used by GradientDescentViz.
function baseBowl(w: number, b: number) {
  const dw = (w - 55) / 18;
  const db = (b - 48) / 26;
  return dw * dw + db * db + 0.5 * dw * db;
}

// Deterministic "jitter" keyed on (w, b) so every render produces the same
// noisy landscape -- GradientDescentViz samples gradients via finite diff,
// so we only need to add a smooth-ish wobble for the descent path to zig.
function jitter(w: number, b: number, amp: number) {
  const s = Math.sin(w * 1.3) * Math.cos(b * 1.1) + Math.sin(w * 0.37 + b * 0.52);
  return amp * s;
}

const lossBatch = (w: number, b: number) => baseBowl(w, b);
const lossSGD = (w: number, b: number) => baseBowl(w, b) + jitter(w, b, 0.9);
const lossMini = (w: number, b: number) => baseBowl(w, b) + jitter(w, b, 0.3);

// Bumpy landscape with a shallow local well and a deeper global well.
// LossLandscape uses range [-3.5, 3.5] by default.
function lossLocalGlobal(x: number, y: number) {
  const bowl = 0.05 * (x * x + y * y);
  const localWell = -1.0 * Math.exp(-((x + 1.8) ** 2 + (y - 1.2) ** 2) / 0.6);
  const globalWell = -1.8 * Math.exp(-((x - 1.4) ** 2 + (y + 1.0) ** 2) / 0.8);
  return bowl + localWell + globalWell + 2.0;
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Three Approaches                                          */
/* ------------------------------------------------------------------ */
function ThreeApproachesTab() {
  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Three optimizers, same bowl-shaped loss. Hit <strong>Play</strong> on
        each and compare how their paths differ.
      </p>

      <RikuSays>
        Batch gradient descent: look at all the data, take one careful step.
        Accurate but slow. SGD: look at ONE example, take a step. Chaotic but
        fast. Ends up in the same neighborhood anyway.
      </RikuSays>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div>
          <p
            className="font-hand text-xs text-center font-bold mb-1"
            style={{ color: "var(--accent-sky)" }}
          >
            Full Batch <span className="text-muted-foreground font-normal">(smooth)</span>
          </p>
          <GradientDescentViz
            lossFn={lossBatch}
            initialLearningRate={3}
            startPoint={[15, 85]}
          />
        </div>
        <div>
          <p
            className="font-hand text-xs text-center font-bold mb-1"
            style={{ color: "var(--accent-coral)" }}
          >
            SGD <span className="text-muted-foreground font-normal">(jittery)</span>
          </p>
          <GradientDescentViz
            lossFn={lossSGD}
            initialLearningRate={3}
            startPoint={[15, 85]}
          />
        </div>
        <div>
          <p
            className="font-hand text-xs text-center font-bold mb-1"
            style={{ color: "var(--accent-mint)" }}
          >
            Mini-Batch <span className="text-muted-foreground font-normal">(balanced)</span>
          </p>
          <GradientDescentViz
            lossFn={lossMini}
            initialLearningRate={3}
            startPoint={[15, 85]}
          />
        </div>
      </div>

      <RikuSays>
        Mini-batch is the compromise: a handful of examples per step.
        Everyone&apos;s favorite in real training loops -- batch size 32 or
        64 is basically the default.
      </RikuSays>

      <InfoBox variant="blue" title="Three Strategies">
        <strong>Full Batch:</strong> uses all data per step  smooth but slow.
        <br />
        <strong>SGD:</strong> uses one sample  fast but noisy.
        <br />
        <strong>Mini-Batch:</strong> uses a small group  the best of both worlds.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Noise Helps!                                              */
/* ------------------------------------------------------------------ */
function NoiseHelpsTab() {
  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        This landscape has a shallow local well and a deeper global one.
        Start near the local trap, then run gradient descent to watch it get
        stuck.
      </p>

      <RikuSays>
        SGD&apos;s &quot;bug&quot; (randomness) is actually a feature. The
        jitter can kick you out of a shallow local minimum so you can find
        the real prize down the valley.
      </RikuSays>

      <div className="card-sketchy p-2 notebook-grid flex justify-center">
        <LossLandscape
          lossFn={lossLocalGlobal}
          learningRate={0.12}
          startPoint={[-1.8, 1.2]}
          range={[-3.5, 3.5]}
        />
      </div>

      <RikuSays>
        Watch where plain gradient descent stops -- if you started near the
        shallow well it will probably get trapped there. SGD&apos;s noise
        would bounce it over the ridge into the deeper valley.
      </RikuSays>

      <InfoBox variant="amber" title="Noise as a Feature">
        SGD&apos;s randomness is not a bug  it is a feature! The noisy
        updates help the model escape local minima and explore more of the
        loss landscape, often finding a better global solution.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Batch Size Slider (loss curves)                          */
/* ------------------------------------------------------------------ */
const BATCH_OPTIONS = [1, 4, 16, 64] as const;
const BATCH_LABELS: Record<number, string> = {
  1: "SGD (batch=1)",
  4: "Mini-batch (batch=4)",
  16: "Mini-batch (batch=16)",
  64: "Full Batch (batch=64)",
};

function simulateLossCurve(batchSize: number, steps: number, seed: number) {
  const rand = mulberry32(seed * 97 + batchSize * 31);
  // Exponential decay target with noise amplitude that shrinks as sqrt(batch).
  const noiseAmp = 0.9 / Math.sqrt(batchSize);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const base = 1.5 * Math.exp(-3.2 * t) + 0.08;
    const noise = (rand() - 0.5) * noiseAmp * (1 - 0.5 * t);
    pts.push({ x: i, y: Math.max(0.02, +(base + noise).toFixed(4)) });
  }
  return pts;
}

function BatchSizeTab() {
  const [selected, setSelected] = useState<Set<number>>(
    new Set<number>([1, 16, 64]),
  );

  const series = useMemo(() => {
    const palette: Record<number, string> = {
      1: "var(--accent-coral)",
      4: "var(--accent-peach)",
      16: "var(--accent-mint)",
      64: "var(--accent-sky)",
    };
    return BATCH_OPTIONS.filter((b) => selected.has(b)).map((b) => ({
      name: BATCH_LABELS[b],
      data: simulateLossCurve(b, 80, 7),
      color: palette[b],
    }));
  }, [selected]);

  const toggle = (b: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      // Always keep at least one series on screen.
      if (next.size === 0) next.add(b);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Loss over training steps for different batch sizes. Small batches
        (SGD) are jagged, large batches are smooth, mini-batch sits in
        between.
      </p>

      <RikuSays>
        Look at batch=1 vs batch=64. Both end up in the same neighborhood,
        but SGD takes a jagged scenic route. That&apos;s what noise looks
        like in a loss curve.
      </RikuSays>

      <div className="card-sketchy p-3 flex items-center gap-2 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold mr-1">Show:</span>
        {BATCH_OPTIONS.map((b) => {
          const on = selected.has(b);
          return (
            <button
              key={b}
              type="button"
              onClick={() => toggle(b)}
              className={`px-3 py-1 rounded-lg font-hand text-xs font-bold border-2 border-foreground shadow-[2px_2px_0_#2b2a35] ${
                on ? "bg-accent-yellow" : "bg-background opacity-60"
              }`}
            >
              {BATCH_LABELS[b]}
            </button>
          );
        })}
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <LineChart
          width={560}
          height={320}
          title="Loss vs training step"
          xLabel="Step"
          yLabel="Loss"
          showPoints={false}
          series={series}
        />
      </div>

      <RikuSays>
        Sweet spot: mini-batch gets most of the speed benefit of SGD with
        most of the stability of full batch. That&apos;s why every modern
        deep learning library defaults to it.
      </RikuSays>

      <InfoBox variant="indigo" title="Batch Size Tradeoff">
        Smaller batches = faster updates but noisy. Larger batches = smoother
        updates but each step costs more compute. Mini-batch (8-32) often
        gives the best wall-clock convergence time.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is the main difference between SGD and Full Batch gradient descent?",
    options: [
      "SGD uses all data per step, Batch uses one sample",
      "SGD uses one sample per step, Batch uses all data",
      "They are exactly the same",
      "SGD is always better",
    ],
    correctIndex: 1,
    explanation:
      "SGD (Stochastic Gradient Descent) updates weights using a single sample at a time, while Full Batch uses the entire dataset for each update.",
  },
  {
    question: "Why can SGD's noise be helpful?",
    options: [
      "It makes training slower",
      "It helps escape local minima",
      "It increases the loss",
      "It removes the need for a learning rate",
    ],
    correctIndex: 1,
    explanation:
      "The noise in SGD's updates can help the optimizer bounce out of local minima and potentially find the global minimum.",
  },
  {
    question: "What is a mini-batch?",
    options: [
      "Using all data at once",
      "Using a single data point",
      "Using a small random subset of the data",
      "Using no data at all",
    ],
    correctIndex: 2,
    explanation:
      "Mini-batch gradient descent uses a small random subset of the data for each update, balancing the smoothness of full batch with the speed of SGD.",
  },
  {
    question: "As batch size increases, what happens to the gradient estimate?",
    options: [
      "It becomes noisier",
      "It becomes smoother and more accurate",
      "It stays exactly the same",
      "It becomes random",
    ],
    correctIndex: 1,
    explanation:
      "Larger batches average over more samples, giving a smoother and more accurate estimate of the true gradient, but at higher computational cost per step.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L25_SGDvsBatchActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "three",
        label: "Three Approaches",
        icon: <Layers className="w-4 h-4" />,
        content: <ThreeApproachesTab />,
      },
      {
        id: "noise",
        label: "Noise Helps!",
        icon: <Sparkles className="w-4 h-4" />,
        content: <NoiseHelpsTab />,
      },
      {
        id: "batch-size",
        label: "Batch Size Slider",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <BatchSizeTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="SGD vs Batch Gradient Descent"
      level={7}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Enter the world of computer vision  how computers see images!"
      story={
        <StorySection
          paragraphs={[
            "Aru looked at her mountain of homework problems and sighed.",
            "Aru: \"Do I really have to check ALL my homework answers before I can fix a single mistake?\"",
            "Byte: \"Great question! With Full Batch, yes  you look at everything first, then make one careful correction. But with SGD, you fix your approach after each single problem!\"",
            "Aru: \"SGD sounds faster. But wouldn't I make wild corrections from just one problem?\"",
            "Byte: \"That's the tradeoff! Mini-Batch is the sweet spot  you look at a small group of problems, get a decent idea of your mistakes, and correct. Fast AND stable!\"",
          ]}
          conceptTitle="SGD vs Batch"
          conceptSummary="Full Batch uses all data per update (smooth but slow), SGD uses one sample (fast but noisy), and Mini-Batch uses a small group (balanced). Mini-batch gradient descent is the standard approach in modern deep learning."
        />
      }
    />
  );
}
