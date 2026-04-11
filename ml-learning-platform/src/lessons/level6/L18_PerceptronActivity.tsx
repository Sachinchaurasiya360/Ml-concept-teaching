"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Cpu, GitBranch, AlertTriangle, RotateCcw, Play, Sparkles } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playSuccess, playError } from "../../utils/sounds";
import {
  Perceptron,
  Neuron,
  NeuralNetwork,
  WeightSlider,
  type PerceptronPoint,
} from "../../components/viz/neural-network";

/* ------------------------------------------------------------------ */
/*  Riku, the red panda study buddy                                    */
/* ------------------------------------------------------------------ */

function RikuSays({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="card-sketchy p-3 flex gap-3 items-start"
      style={{ background: "#fff8e7" }}
    >
      <span className="text-2xl" aria-hidden>🐼</span>
      <p className="font-hand text-sm text-foreground leading-snug">
        {children}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Build a Perceptron                                         */
/* ------------------------------------------------------------------ */

function BuildPerceptronTab() {
  const inputSets = useMemo(
    () => [
      [1, 0, 1],
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [],
  );

  const [inputSet, setInputSet] = useState(0);
  const [w1, setW1] = useState(1.0);
  const [w2, setW2] = useState(0.5);
  const [w3, setW3] = useState(-0.5);
  const [bias, setBias] = useState(0);

  const inputs = inputSets[inputSet];
  const weights = [w1, w2, w3];

  return (
    <div className="space-y-5">
      <RikuSays>
        Hi! I&apos;m Riku. Think of me as your very chill AI study buddy  I&apos;ve
        been where you are. A <b>perceptron</b> is the world&apos;s tiniest
        decision maker: it weighs some inputs, adds them up, and asks
        &quot;should I fire?&quot;
      </RikuSays>

      {/* ----- Preset selector ----- */}
      <div className="flex flex-wrap gap-2 justify-center">
        {inputSets.map((s, i) => (
          <button
            key={i}
            onClick={() => { playClick(); setInputSet(i); }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold transition-all border-2 border-foreground ${
              inputSet === i
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            inputs = [{s.join(", ")}]
          </button>
        ))}
      </div>

      {/* ----- The perceptron diagram ----- */}
      <div className="card-sketchy p-4 notebook-grid">
        <Neuron
          inputs={inputs}
          weights={weights}
          bias={bias}
          activation="sigmoid"
          size={480}
          label="weighted sum → sigmoid → output"
        />
      </div>

      {/* ----- Sliders ----- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-sketchy p-3">
          <WeightSlider label="Weight 1 (x1)" value={w1} onChange={setW1} />
        </div>
        <div className="card-sketchy p-3">
          <WeightSlider label="Weight 2 (x2)" value={w2} onChange={setW2} />
        </div>
        <div className="card-sketchy p-3">
          <WeightSlider label="Weight 3 (x3)" value={w3} onChange={setW3} />
        </div>
      </div>
      <div className="card-sketchy p-3 max-w-md mx-auto">
        <WeightSlider
          label="Bias (b)"
          value={bias}
          onChange={setBias}
          min={-2}
          max={2}
        />
      </div>

      <RikuSays>
        Weights are like volume knobs  turn one up and that input gets
        louder in the final decision. Try dragging a weight negative and watch
        its line flip color: now that input ARGUES against firing.
      </RikuSays>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          Swap between input presets and slide the weights around. The Σ inside
          the neuron shows the weighted sum; the mint circle on the right shows
          the sigmoid output  a smooth 0-to-1 version of &quot;fire or not&quot;.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  AND / OR Gates                                             */
/* ------------------------------------------------------------------ */

const TRUTH_TABLE: [number, number][] = [[0, 0], [0, 1], [1, 0], [1, 1]];
const AND_TARGETS = [0, 0, 0, 1];
const OR_TARGETS = [0, 1, 1, 1];

function gateToPoints(targets: number[]): PerceptronPoint[] {
  return TRUTH_TABLE.map(([x, y], i) => ({
    x: x * 2 - 1,
    y: y * 2 - 1,
    label: targets[i] as 0 | 1,
  }));
}

function GatesTab() {
  const [gate, setGate] = useState<"AND" | "OR">("AND");
  const [w1, setW1] = useState(0.1);
  const [w2, setW2] = useState(0.1);
  const [b, setB] = useState(-0.1);
  const [training, setTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [lr, setLr] = useState(0.15);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targets = gate === "AND" ? AND_TARGETS : OR_TARGETS;

  const predict = useCallback(
    (x1: number, x2: number, cw1: number, cw2: number, cb: number) =>
      x1 * cw1 + x2 * cw2 + cb >= 0.5 ? 1 : 0,
    [],
  );

  const predictions = TRUTH_TABLE.map(([x1, x2]) => predict(x1, x2, w1, w2, b));
  const allCorrect = predictions.every((p, i) => p === targets[i]);
  const accuracy = predictions.filter((p, i) => p === targets[i]).length / TRUTH_TABLE.length;

  const trainStep = useCallback(() => {
    setW1((pw1) => {
      let nw1 = pw1;
      let nw2 = w2;
      let nb = b;
      for (let i = 0; i < TRUTH_TABLE.length; i++) {
        const [x1, x2] = TRUTH_TABLE[i];
        const pred = (x1 * nw1 + x2 * nw2 + nb >= 0.5) ? 1 : 0;
        const err = targets[i] - pred;
        nw1 += lr * err * x1;
        nw2 += lr * err * x2;
        nb += lr * err;
      }
      setW2(nw2);
      setB(nb);
      setEpoch((e) => e + 1);
      return nw1;
    });
  }, [w2, b, targets, lr]);

  const handleTrain = useCallback(() => {
    playClick();
    setTraining(true);
    let step = 0;
    const tick = () => {
      if (step >= 25) {
        setTraining(false);
        playSuccess();
        return;
      }
      trainStep();
      step++;
      timerRef.current = setTimeout(tick, 160);
    };
    tick();
  }, [trainStep]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTraining(false);
    setW1(0.1);
    setW2(0.1);
    setB(-0.1);
    setEpoch(0);
    playClick();
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const points = useMemo(() => gateToPoints(targets), [targets]);

  return (
    <div className="space-y-5">
      <RikuSays>
        Alright, trainer time! AND and OR are both <i>linearly separable</i>,
        which is a fancy way of saying: one straight line can split the 1s from
        the 0s. A single perceptron is perfect for this.
      </RikuSays>

      {/* Gate selector */}
      <div className="flex gap-2 justify-center">
        {(["AND", "OR"] as const).map((g) => (
          <button
            key={g}
            onClick={() => { playClick(); setGate(g); handleReset(); }}
            className={`px-5 py-2 rounded-lg font-hand text-base font-bold border-2 border-foreground transition-all ${
              gate === g
                ? "bg-accent-coral text-white shadow-[3px_3px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {g} Gate
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* Truth table */}
        <div className="card-sketchy overflow-hidden">
          <table className="w-full font-hand text-sm">
            <thead>
              <tr className="bg-accent-yellow border-b-2 border-foreground">
                <th className="px-3 py-2">x1</th>
                <th className="px-3 py-2">x2</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Predicted</th>
              </tr>
            </thead>
            <tbody>
              {TRUTH_TABLE.map(([x1, x2], i) => {
                const ok = predictions[i] === targets[i];
                return (
                  <tr key={i} className="border-t-2 border-dashed border-foreground/30">
                    <td className="px-3 py-2 text-center font-bold">{x1}</td>
                    <td className="px-3 py-2 text-center font-bold">{x2}</td>
                    <td className="px-3 py-2 text-center font-bold">{targets[i]}</td>
                    <td className={`px-3 py-2 text-center font-bold ${ok ? "text-emerald-600" : "text-red-500"}`}>
                      {predictions[i]} {ok ? "✓" : "✗"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Live interactive perceptron  remounts when gate changes */}
        <div className="card-sketchy p-3 flex justify-center notebook-grid">
          <Perceptron
            key={gate}
            points={points}
            initialWeights={[1, 1]}
            initialBias={-0.5}
            range={[-2, 2]}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <div className="flex flex-wrap gap-3 justify-center font-hand text-sm">
          <span className="px-2 py-1 rounded border-2 border-foreground bg-background">w1 = <b>{w1.toFixed(2)}</b></span>
          <span className="px-2 py-1 rounded border-2 border-foreground bg-background">w2 = <b>{w2.toFixed(2)}</b></span>
          <span className="px-2 py-1 rounded border-2 border-foreground bg-background">b = <b>{b.toFixed(2)}</b></span>
          <span className="px-2 py-1 rounded border-2 border-foreground bg-accent-lav text-white">epoch <b>{epoch}</b></span>
        </div>
        <div>
          <div className="flex justify-between font-hand text-xs font-bold mb-1">
            <span>Auto-trainer accuracy</span>
            <span>{Math.round(accuracy * 100)}%</span>
          </div>
          <div className="h-4 rounded-full border-2 border-foreground bg-background overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${accuracy * 100}%`,
                background: accuracy === 1 ? "#4ecdc4" : "#ffd93d",
              }}
            />
          </div>
        </div>
        {allCorrect && (
          <div className="text-center font-hand text-base font-bold marker-highlight-mint inline-block mx-auto">
            All correct! Network learned {gate}!
          </div>
        )}
      </div>

      {/* Training controls */}
      <div className="card-sketchy p-3">
        <WeightSlider
          label="Learning Rate"
          value={lr}
          onChange={setLr}
          min={0.05}
          max={0.5}
          step={0.01}
        />
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={handleTrain} disabled={training} className="btn-sketchy text-sm disabled:opacity-50">
          <Play className="w-4 h-4" />
          {training ? "Training" : "Auto-Train"}
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <RikuSays>
        Don&apos;t just memorize the update rule. <i>Feel</i> it: when the
        prediction is wrong, the weights nudge a little toward the right answer.
        Do that enough times and the decision line glides into place.
      </RikuSays>

      <InfoBox variant="green">
        <span className="font-hand text-base">
          Drag the sliders in the perceptron on the right to move the decision
          boundary yourself, or hit Auto-Train to watch the weights adjust
          automatically. Both are the same idea  just different hands on the
          knobs.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  The XOR Problem                                            */
/* ------------------------------------------------------------------ */

const XOR_TARGETS = [0, 1, 1, 0];

function XORTab() {
  const [epoch, setEpoch] = useState(0);
  const [training, setTraining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [w1, setW1] = useState(0.5);
  const [w2, setW2] = useState(0.5);
  const [b, setB] = useState(0.0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const predict = useCallback(
    (x1: number, x2: number) => (x1 * w1 + x2 * w2 + b >= 0.5 ? 1 : 0),
    [w1, w2, b],
  );

  const predictions = TRUTH_TABLE.map(([x1, x2]) => predict(x1, x2));
  const allCorrect = predictions.every((p, i) => p === XOR_TARGETS[i]);
  const accuracy = predictions.filter((p, i) => p === XOR_TARGETS[i]).length / TRUTH_TABLE.length;

  const handleTrain = useCallback(() => {
    playClick();
    setTraining(true);
    setMessage(null);
    let cw1 = w1, cw2 = w2, cb = b;
    let step = 0;
    const tick = () => {
      if (step >= 35) {
        setTraining(false);
        playError();
        setMessage("The perceptron could NOT learn XOR. No single straight line can separate diagonal corners. We need MORE layers!");
        return;
      }
      for (let i = 0; i < TRUTH_TABLE.length; i++) {
        const [x1, x2] = TRUTH_TABLE[i];
        const pred = (x1 * cw1 + x2 * cw2 + cb >= 0.5) ? 1 : 0;
        const err = XOR_TARGETS[i] - pred;
        cw1 += 0.15 * err * x1;
        cw2 += 0.15 * err * x2;
        cb += 0.15 * err;
      }
      setW1(cw1);
      setW2(cw2);
      setB(cb);
      setEpoch((e) => e + 1);
      step++;
      timerRef.current = setTimeout(tick, 110);
    };
    tick();
  }, [w1, w2, b]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTraining(false);
    setW1(0.5); setW2(0.5); setB(0.0);
    setEpoch(0); setMessage(null);
    playClick();
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const xorPoints = useMemo(() => gateToPoints(XOR_TARGETS), []);

  return (
    <div className="space-y-5">
      <div className="text-center font-hand text-2xl font-bold text-foreground">
        XOR Gate: <span className="marker-highlight-coral">The Impossible Mission</span>
      </div>

      <RikuSays>
        XOR says &quot;fire if exactly ONE input is 1.&quot; Grab the sliders and
        try to draw a single straight line that separates the mint dots from the
        coral dots. Spoiler: you can&apos;t. And that&apos;s the whole point.
      </RikuSays>

      <div className="card-sketchy p-3 flex justify-center notebook-grid">
        <Perceptron
          points={xorPoints}
          initialWeights={[1, 1]}
          initialBias={-0.5}
          range={[-2, 2]}
        />
      </div>

      {/* Truth table */}
      <div className="card-sketchy overflow-hidden max-w-md mx-auto">
        <table className="w-full font-hand text-sm">
          <thead>
            <tr className="bg-accent-coral/40 border-b-2 border-foreground">
              <th className="px-3 py-2">x1</th>
              <th className="px-3 py-2">x2</th>
              <th className="px-3 py-2">XOR</th>
              <th className="px-3 py-2">Auto-train</th>
            </tr>
          </thead>
          <tbody>
            {TRUTH_TABLE.map(([x1, x2], i) => {
              const ok = predictions[i] === XOR_TARGETS[i];
              return (
                <tr key={i} className="border-t-2 border-dashed border-foreground/30">
                  <td className="px-3 py-2 text-center font-bold">{x1}</td>
                  <td className="px-3 py-2 text-center font-bold">{x2}</td>
                  <td className="px-3 py-2 text-center font-bold">{XOR_TARGETS[i]}</td>
                  <td className={`px-3 py-2 text-center font-bold ${ok ? "text-emerald-600" : "text-red-500"}`}>
                    {predictions[i]} {ok ? "✓" : "✗"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card-sketchy p-3 max-w-md mx-auto" style={{ background: "#fff8e7" }}>
        <div className="flex flex-wrap gap-2 justify-center font-hand text-xs mb-2">
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">w1=<b>{w1.toFixed(2)}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">w2=<b>{w2.toFixed(2)}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">b=<b>{b.toFixed(2)}</b></span>
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-lav text-white">epoch <b>{epoch}</b></span>
        </div>
        <div className="h-3 rounded-full border-2 border-foreground bg-background overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ width: `${accuracy * 100}%`, background: accuracy === 1 ? "#4ecdc4" : "#ff6b6b" }} />
        </div>
        <div className="text-center font-hand text-xs mt-1">{Math.round(accuracy * 100)}% accuracy</div>
        {allCorrect && <div className="text-center marker-highlight-mint font-bold mt-1">Solved!</div>}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={handleTrain} disabled={training} className="btn-sketchy text-sm disabled:opacity-50" style={{ background: "#ff6b6b", color: "#fff" }}>
          <Sparkles className="w-4 h-4" />
          {training ? "Trying" : "Try to Train XOR"}
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {message && (
        <div className="card-sketchy p-4 text-center font-hand text-base font-bold animate-fadeIn" style={{ background: "#ffe5e5", color: "#b91c1c" }}>
          {message}
        </div>
      )}

      <div className="card-sketchy p-4 notebook-grid">
        <p className="font-hand text-sm text-center text-foreground mb-2">
          The fix: stack neurons into a <b>hidden layer</b>. Suddenly, curved
          boundaries are possible.
        </p>
        <NeuralNetwork
          layers={[2, 2, 1]}
          animateFlow
          showValues
          inputs={[1, 0]}
          width={560}
          height={260}
        />
      </div>

      <RikuSays>
        Here&apos;s the twist: stack two perceptrons into a hidden layer and
        they can bend the decision line into something XOR-shaped. That&apos;s
        literally why deep networks exist. Neural puns intended.
      </RikuSays>

      <InfoBox variant="amber" title="The XOR Problem">
        <span className="font-hand text-base">
          A single perceptron draws ONE straight line. But XOR needs to
          separate DIAGONAL corners  no single line can do that! This is
          exactly why we need neural networks with hidden layers.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does a perceptron do with its inputs?",
    options: [
      "Adds them without modification",
      "Multiplies each by a weight, sums them, and checks a threshold",
      "Picks the largest input",
      "Randomly decides an output",
    ],
    correctIndex: 1,
    explanation:
      "A perceptron multiplies each input by its weight, sums the products plus a bias, and fires if the total meets the threshold.",
  },
  {
    question: "Which logic gate can a single perceptron NOT learn?",
    options: ["AND", "OR", "XOR", "NOT"],
    correctIndex: 2,
    explanation:
      "XOR is not linearly separable -- no single straight line can separate the 1s from the 0s, so a single perceptron fails.",
  },
  {
    question: "What is the role of the bias in a perceptron?",
    options: [
      "It makes the perceptron run faster",
      "It shifts the decision boundary",
      "It removes noise from inputs",
      "It doubles the weights",
    ],
    correctIndex: 1,
    explanation:
      "The bias shifts the decision boundary, allowing the perceptron to fire even when all inputs are zero.",
  },
  {
    question: "What does the decision boundary of a single perceptron look like?",
    options: [
      "A curved line",
      "A straight line",
      "A circle",
      "A zigzag",
    ],
    correctIndex: 1,
    explanation:
      "A single perceptron produces a linear decision boundary -- a straight line (or hyperplane in higher dimensions).",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function L18_PerceptronActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "build",
        label: "Build a Perceptron",
        icon: <Cpu className="w-4 h-4" />,
        content: <BuildPerceptronTab />,
      },
      {
        id: "gates",
        label: "AND / OR Gates",
        icon: <GitBranch className="w-4 h-4" />,
        content: <GatesTab />,
      },
      {
        id: "xor",
        label: "The XOR Problem",
        icon: <AlertTriangle className="w-4 h-4" />,
        content: <XORTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="The Perceptron"
      level={6}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Discover activation functions -- how neurons decide to fire!"
      story={
        <StorySection
          paragraphs={[
            "Aru was staring at a diagram of the human brain, fascinated by the billions of tiny neurons firing signals to each other.",
            "Aru: \"What's the simplest brain cell a computer can have?\"",
            "Byte: \"Great question! It's called a perceptron! Imagine a circle with arrows coming in. It takes inputs, multiplies each by a weight, adds them all up, and if the total is big enough -- it fires! Like a tiny decision maker.\"",
            "Aru: \"So it's like a neuron that says YES or NO?\"",
            "Byte: \"Exactly! And by adjusting the weights, you can teach it to make different decisions. Let's build one!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A perceptron is the simplest neural unit. It takes weighted inputs, sums them with a bias, and compares to a threshold to decide whether to fire (output 1) or not (output 0). It can learn linearly separable problems like AND and OR, but fails on XOR."
        />
      }
    />
  );
}
