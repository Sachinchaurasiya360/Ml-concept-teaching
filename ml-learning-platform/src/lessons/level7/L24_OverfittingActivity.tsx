"use client";

import { useMemo, useState } from "react";
import { TrendingUp, BarChart3, Shield } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  DecisionTreeViz,
  LinearRegressionViz,
  generateMoons,
  generateLinearData,
} from "../../components/viz/ml-algorithms";
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
/*  Shared synthetic train/val loss curves                             */
/* ------------------------------------------------------------------ */
// Canonical overfitting curve: train loss keeps falling, val loss hits
// a minimum and then rises as the model memorizes noise.
function buildOverfitCurves(epochs: number) {
  const train: { x: number; y: number }[] = [];
  const val: { x: number; y: number }[] = [];
  for (let e = 1; e <= epochs; e++) {
    const t = e / epochs;
    const trainLoss = 0.9 * Math.exp(-3.2 * t) + 0.04 + 0.01 * Math.sin(e * 0.9);
    // Validation follows a U-curve with a minimum around epoch ~40%
    const bowl = (t - 0.38) * (t - 0.38);
    const valLoss = 0.9 * Math.exp(-2.2 * t) + 0.08 + 1.1 * bowl;
    train.push({ x: e, y: +trainLoss.toFixed(4) });
    val.push({ x: e, y: +valLoss.toFixed(4) });
  }
  return { train, val };
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Fit the Curve (train vs val loss over epochs)            */
/* ------------------------------------------------------------------ */
function FitCurveTab() {
  const { train, val } = useMemo(() => buildOverfitCurves(50), []);

  // Find the epoch where val loss is minimal -- the "sweet spot".
  const bestEpoch = useMemo(() => {
    let best = 0;
    let bestV = Infinity;
    for (let i = 0; i < val.length; i++) {
      if (val[i].y < bestV) {
        bestV = val[i].y;
        best = i;
      }
    }
    return { epoch: val[best].x, trainLoss: train[best].y, valLoss: val[best].y };
  }, [train, val]);

  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        The classic overfitting plot: train loss keeps dropping, but at some
        point validation loss bottoms out and starts climbing.
      </p>

      <RikuSays>
        Overfitting = memorizing the textbook. Your model aces the practice
        test, then faceplants on the real one. Watch the red line bounce back
        up -- that&apos;s the warning sign.
      </RikuSays>

      <div className="card-sketchy p-4 notebook-grid">
        <LineChart
          width={560}
          height={320}
          title="Loss over epochs"
          xLabel="Epoch"
          yLabel="Loss"
          smooth
          showPoints={false}
          series={[
            {
              name: "Train loss",
              data: train,
              color: "var(--accent-sky)",
            },
            {
              name: "Validation loss",
              data: val,
              color: "var(--accent-coral)",
            },
          ]}
        />
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <div className="card-sketchy px-4 py-2 text-center">
          <p className="font-hand text-[11px] font-bold text-muted-foreground">
            Sweet-spot epoch
          </p>
          <p className="font-hand text-base font-bold">{bestEpoch.epoch}</p>
        </div>
        <div className="card-sketchy px-4 py-2 text-center">
          <p className="font-hand text-[11px] font-bold text-muted-foreground">
            Train @ sweet spot
          </p>
          <p className="font-hand text-base font-bold text-blue-600">
            {bestEpoch.trainLoss.toFixed(4)}
          </p>
        </div>
        <div className="card-sketchy px-4 py-2 text-center">
          <p className="font-hand text-[11px] font-bold text-muted-foreground">
            Val @ sweet spot
          </p>
          <p className="font-hand text-base font-bold text-red-600">
            {bestEpoch.valLoss.toFixed(4)}
          </p>
        </div>
      </div>

      <RikuSays>
        Pro tip: stop training when the red line starts climbing. That trick
        has a fancy name -- <em>early stopping</em>.
      </RikuSays>

      <InfoBox variant="blue" title="Underfitting vs Overfitting">
        <strong>Early epochs:</strong> the model is still too simple -- both
        losses are high (underfitting).
        <br />
        <strong>Middle epochs:</strong> both losses drop together -- the model
        is learning the real pattern.
        <br />
        <strong>Late epochs:</strong> train loss keeps falling but validation
        loss rises -- the model is memorizing noise (overfitting).
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Train vs Test Error (tree depth = model complexity)      */
/* ------------------------------------------------------------------ */
function ErrorCurveTab() {
  const data = useMemo(() => generateMoons(60, 21), []);

  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Model complexity in action. Drag the <strong>depth</strong> slider --
        shallow trees underfit, deep trees carve wiggly regions around every
        single training point.
      </p>

      <RikuSays>
        A decision tree with depth 1 is basically a yes/no question. Depth 8
        is a fifty-page questionnaire. Guess which one generalizes better.
      </RikuSays>

      <div className="card-sketchy p-2 notebook-grid">
        <DecisionTreeViz data={data} maxDepth={8} />
      </div>

      <RikuSays>
        See those tiny islands the deep tree draws around single points? That
        is textbook overfitting -- the tree memorized noise instead of the
        shape.
      </RikuSays>

      <InfoBox variant="amber" title="The U-Curve of Complexity">
        Train error always drops as you increase model complexity, but test
        error follows a U-shape. Too shallow = underfit, too deep = overfit,
        somewhere in the middle is the sweet spot where the model captures
        the true pattern without chasing noise.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Regularization (simple line generalizes best)            */
/* ------------------------------------------------------------------ */
function RegularizationTab() {
  const data = useMemo(() => generateLinearData(24, 0.6, 18, 10, 5), []);

  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Regularization is the art of keeping a model simple on purpose. A
        plain straight line with small weights often beats a fancy wiggly one
        on new data.
      </p>

      <RikuSays>
        Regularization says: &quot;please keep the weights small.&quot; Small
        weights can&apos;t make wild wiggles. Small weights = simple model =
        friends with new data.
      </RikuSays>

      <div className="card-sketchy p-2 notebook-grid">
        <LinearRegressionViz data={data} showResiduals showMSE />
      </div>

      <RikuSays>
        Click <strong>Fit</strong> to snap to the least-squares line. That
        line is the simplest story that explains the points -- and simple
        stories travel well.
      </RikuSays>

      <InfoBox variant="green" title="L2 Regularization">
        L2 regularization adds a penalty for large weights. The higher the
        penalty (lambda), the more the model is pushed toward simpler,
        smoother solutions. Too much penalty, though, and the model becomes
        too rigid to capture the real pattern (underfitting).
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is overfitting?",
    options: [
      "The model is too simple",
      "The model memorizes training data but fails on new data",
      "The model trains too slowly",
      "The model has too few parameters",
    ],
    correctIndex: 1,
    explanation:
      "Overfitting occurs when a model memorizes the training data (including noise) instead of learning the general pattern, causing poor performance on unseen data.",
  },
  {
    question: "What does the U-curve of test error tell us?",
    options: [
      "More complexity is always better",
      "There is a sweet spot between too simple and too complex",
      "Test error always decreases",
      "Train error is more important",
    ],
    correctIndex: 1,
    explanation:
      "The U-curve shows that test error first decreases as the model captures real patterns, then increases when it starts memorizing noise. The bottom of the U is the sweet spot.",
  },
  {
    question: "How does regularization prevent overfitting?",
    options: [
      "By adding more training data",
      "By penalizing large weights to keep the model simpler",
      "By increasing the learning rate",
      "By removing test data",
    ],
    correctIndex: 1,
    explanation:
      "Regularization adds a penalty term that discourages large weights, forcing the model to find simpler solutions that generalize better to new data.",
  },
  {
    question: "What happens if regularization (lambda) is too large?",
    options: [
      "Perfect fit",
      "The model overfits more",
      "The model becomes too simple (underfits)",
      "Nothing changes",
    ],
    correctIndex: 2,
    explanation:
      "Too much regularization over-penalizes the weights, making the model too simple and unable to capture the real pattern in the data (underfitting).",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L24_OverfittingActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "fit",
        label: "Fit the Curve",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <FitCurveTab />,
      },
      {
        id: "ucurve",
        label: "Train vs Test Error",
        icon: <BarChart3 className="w-4 h-4" />,
        content: <ErrorCurveTab />,
      },
      {
        id: "regularization",
        label: "Regularization",
        icon: <Shield className="w-4 h-4" />,
        content: <RegularizationTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Overfitting & Regularization"
      level={7}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: SGD vs Batch  different ways to feed data during training!"
      story={
        <StorySection
          paragraphs={[
            "Aru studied for her math exam by memorizing every problem in her textbook, word for word.",
            "Aru: \"I know every single answer! 2 + 3 = 5, problem 4 is 17, problem 5 is 42...\"",
            "Byte: \"But what if the exam has different numbers? Can you solve 3 + 4?\"",
            "Aru: \"Um... that's not in my textbook...\"",
            "Byte: \"That's overfitting! You memorized the training data instead of learning the pattern. Real learning means understanding the rule so you can handle new problems. Let's learn how to prevent this!\"",
          ]}
          conceptTitle="Overfitting"
          conceptSummary="Overfitting happens when a model memorizes the training data (including its noise) instead of learning the general pattern. Regularization helps by penalizing overly complex models, keeping them simple enough to work on new, unseen data."
        />
      }
    />
  );
}
