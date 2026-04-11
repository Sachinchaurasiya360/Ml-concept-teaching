"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Network, Layers, Target, Play, RotateCcw, Shuffle, Zap, Plus, Minus } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";
import {
  NeuralNetwork,
  ForwardPassAnimation,
  Neuron,
  mulberry32,
} from "../../components/viz/neural-network";

/* ------------------------------------------------------------------ */
/*  Riku the red panda mascot                                          */
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
/*  Tab 1  Network Architecture                                       */
/* ------------------------------------------------------------------ */

const MIN_INPUTS = 1, MAX_INPUTS = 4;
const MIN_HIDDEN = 1, MAX_HIDDEN = 8;
const MIN_OUTPUTS = 1, MAX_OUTPUTS = 3;

function ArchitectureTab() {
  const [inputCount, setInputCount] = useState(3);
  const [hiddenCount, setHiddenCount] = useState(4);
  const [outputCount, setOutputCount] = useState(1);
  const [inputs, setInputs] = useState<number[]>([0.6, 0.4, 0.8]);
  const [showValues, setShowValues] = useState(true);
  const [animateFlow, setAnimateFlow] = useState(true);

  // Keep `inputs` length in sync with inputCount
  useEffect(() => {
    setInputs((prev) => {
      if (prev.length === inputCount) return prev;
      if (prev.length < inputCount) {
        return [...prev, ...Array.from({ length: inputCount - prev.length }, () => 0.5)];
      }
      return prev.slice(0, inputCount);
    });
  }, [inputCount]);

  const layers = useMemo(
    () => [inputCount, hiddenCount, outputCount],
    [inputCount, hiddenCount, outputCount],
  );

  const addInput = () => {
    if (inputCount >= MAX_INPUTS) return;
    playPop();
    setInputCount((c) => c + 1);
  };
  const removeInput = () => {
    if (inputCount <= MIN_INPUTS) return;
    playPop();
    setInputCount((c) => c - 1);
  };
  const addHidden = () => {
    if (hiddenCount >= MAX_HIDDEN) return;
    playPop();
    setHiddenCount((c) => c + 1);
  };
  const removeHidden = () => {
    if (hiddenCount <= MIN_HIDDEN) return;
    playPop();
    setHiddenCount((c) => c - 1);
  };
  const addOutput = () => {
    if (outputCount >= MAX_OUTPUTS) return;
    playPop();
    setOutputCount((c) => c + 1);
  };
  const removeOutput = () => {
    if (outputCount <= MIN_OUTPUTS) return;
    playPop();
    setOutputCount((c) => c - 1);
  };

  return (
    <div className="space-y-5">
      <RikuSays>
        A neural network is just a lot of neurons holding hands. That&apos;s it. That&apos;s the whole trick.
      </RikuSays>

      {/* ---------- Toolbar ---------- */}
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-4">
        <label className="flex items-center gap-1.5 font-hand text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} />
          Show values
        </label>
        <label className="flex items-center gap-1.5 font-hand text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={animateFlow} onChange={(e) => setAnimateFlow(e.target.checked)} />
          Pulse signals
        </label>
      </div>

      {/* ---------- Add / Remove neurons ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-sketchy p-3 flex items-center justify-between" style={{ background: "#fff8e7" }}>
          <span className="font-hand text-sm font-bold">Input neurons</span>
          <div className="flex items-center gap-2">
            <button
              onClick={removeInput}
              disabled={inputCount <= MIN_INPUTS}
              className="w-8 h-8 rounded-lg border-2 border-foreground bg-background hover:bg-accent-coral hover:text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="Remove input"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded border-2 border-foreground bg-accent-yellow font-hand font-bold min-w-[2.2rem] text-center">{inputCount}</span>
            <button
              onClick={addInput}
              disabled={inputCount >= MAX_INPUTS}
              className="w-8 h-8 rounded-lg border-2 border-foreground bg-background hover:bg-accent-mint font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="Add input"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="card-sketchy p-3 flex items-center justify-between" style={{ background: "#fff8e7" }}>
          <span className="font-hand text-sm font-bold">Hidden neurons</span>
          <div className="flex items-center gap-2">
            <button
              onClick={removeHidden}
              disabled={hiddenCount <= MIN_HIDDEN}
              className="w-8 h-8 rounded-lg border-2 border-foreground bg-background hover:bg-accent-coral hover:text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="Remove hidden neuron"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded border-2 border-foreground bg-accent-yellow font-hand font-bold min-w-[2.2rem] text-center">{hiddenCount}</span>
            <button
              onClick={addHidden}
              disabled={hiddenCount >= MAX_HIDDEN}
              className="w-8 h-8 rounded-lg border-2 border-foreground bg-background hover:bg-accent-mint font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="Add hidden neuron"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="card-sketchy p-3 flex items-center justify-between" style={{ background: "#fff8e7" }}>
          <span className="font-hand text-sm font-bold">Output neurons</span>
          <div className="flex items-center gap-2">
            <button
              onClick={removeOutput}
              disabled={outputCount <= MIN_OUTPUTS}
              className="w-8 h-8 rounded-lg border-2 border-foreground bg-background hover:bg-accent-coral hover:text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="Remove output"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded border-2 border-foreground bg-accent-yellow font-hand font-bold min-w-[2.2rem] text-center">{outputCount}</span>
            <button
              onClick={addOutput}
              disabled={outputCount >= MAX_OUTPUTS}
              className="w-8 h-8 rounded-lg border-2 border-foreground bg-background hover:bg-accent-mint font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              title="Add output"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- The network ---------- */}
      <div className="card-sketchy p-4 notebook-grid">
        <NeuralNetwork
          layers={layers}
          inputs={inputs}
          animateFlow={animateFlow}
          showValues={showValues}
        />
      </div>

      {/* ---------- Input sliders ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {inputs.map((v, i) => (
          <div key={i} className="card-sketchy p-3 space-y-1.5">
            <label className="font-hand text-sm font-bold flex justify-between">
              <span>x{i + 1}</span>
              <span className="px-2 py-0.5 rounded border-2 border-foreground text-xs bg-accent-sky text-white">{v.toFixed(2)}</span>
            </label>
            <input
              type="range" min={0} max={1} step={0.01} value={v}
              onChange={(e) => {
                playPop();
                const next = inputs.slice();
                next[i] = parseFloat(e.target.value);
                setInputs(next);
              }}
              className="w-full" style={{ accentColor: "#6bb6ff" }}
            />
          </div>
        ))}
      </div>

      <RikuSays>
        Mint lines are friendly (positive weights), coral lines are grumpy (negative weights). Thicker = stronger opinion. Slide the inputs and watch the whole net re-think its answer in real time.
      </RikuSays>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          Each line is a connection  thicker = stronger weight, coral = negative. Watch the pulses race from inputs through hidden neurons to the output. Drag the input sliders and the whole network reacts live!
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Single Neuron Zoom-in + Layer by Layer                      */
/* ------------------------------------------------------------------ */

function LayerByLayerTab() {
  const [inputs, setInputs] = useState([0.7, 0.3, 0.5]);

  // Deterministic weights for the walkthrough so it's stable across renders.
  const rng = useMemo(() => mulberry32(99), []);
  const weights = useMemo(() => {
    // [3 → 3 → 1]
    const wL1 = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => rng() * 2 - 1),
    );
    const wL2 = [Array.from({ length: 3 }, () => rng() * 2 - 1)];
    return [wL1, wL2];
  }, [rng]);

  // For the single-neuron zoom, we use the first hidden neuron's weights.
  const firstNeuronWeights = weights[0][0];
  const firstNeuronBias = 0.1;

  return (
    <div className="space-y-5">
      <RikuSays>
        Zoom in first. One neuron is a little math burrito: multiply each input by a weight, add them up with a bias, squish through sigmoid, done.
      </RikuSays>

      {/* Input sliders */}
      <div className="grid grid-cols-3 gap-3">
        {inputs.map((v, i) => (
          <div key={i} className="card-sketchy p-3 space-y-1.5">
            <label className="font-hand text-sm font-bold flex justify-between">
              <span>x{i + 1}</span>
              <span className="px-2 py-0.5 rounded border-2 border-foreground text-xs bg-accent-sky text-white">{v.toFixed(2)}</span>
            </label>
            <input
              type="range" min={0} max={1} step={0.01} value={v}
              onChange={(e) => {
                playPop();
                const next = inputs.slice();
                next[i] = parseFloat(e.target.value);
                setInputs(next);
              }}
              className="w-full" style={{ accentColor: "#6bb6ff" }}
            />
          </div>
        ))}
      </div>

      {/* Single neuron zoom */}
      <div className="card-sketchy p-4 notebook-grid">
        <div className="font-hand text-sm font-bold text-center mb-2">
          <span className="marker-highlight-yellow">Single neuron</span> up close
        </div>
        <div className="flex justify-center">
          <Neuron
            inputs={inputs}
            weights={firstNeuronWeights}
            bias={firstNeuronBias}
            activation="sigmoid"
            label="h1 (first hidden neuron)"
          />
        </div>
      </div>

      <RikuSays>
        Now click Play. Each layer lights up in turn  that&apos;s a forward pass. It&apos;s like passing a note through class: row by row, until it reaches the teacher.
      </RikuSays>

      {/* Whole-network step walkthrough */}
      <div className="card-sketchy p-4 notebook-grid">
        <div className="font-hand text-sm font-bold text-center mb-2">
          <span className="marker-highlight-mint">Layer by layer</span> forward pass
        </div>
        <ForwardPassAnimation
          architecture={[3, 3, 1]}
          inputs={inputs}
          weights={weights}
        />
      </div>

      <InfoBox variant="green">
        <span className="font-hand text-base">
          A forward pass moves data layer by layer. Click step by step and watch the signals light up  first the hidden layer, then the output.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Solving XOR                                                */
/* ------------------------------------------------------------------ */

const XOR_DATA: [number, number, number][] = [
  [0, 0, 0],
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
];

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

function SolvingXORTab() {
  const [wH, setWH] = useState([[3, 3], [5, 5]]);
  const [bH, setBH] = useState([-1, -7.5]);
  const [wO, setWO] = useState([5, -5]);
  const [bO, setBO] = useState([-2]);
  const [epoch, setEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [training, setTraining] = useState(false);
  const [trainSpeed, setTrainSpeed] = useState(90);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const predict = useCallback(
    (x1: number, x2: number) => {
      const h0 = sigmoid(wH[0][0] * x1 + wH[0][1] * x2 + bH[0]);
      const h1 = sigmoid(wH[1][0] * x1 + wH[1][1] * x2 + bH[1]);
      return sigmoid(wO[0] * h0 + wO[1] * h1 + bO[0]);
    },
    [wH, bH, wO, bO],
  );

  const handleTrain = useCallback(() => {
    playClick();
    setTraining(true);

    const targetWH = [[5.5, 5.5], [7.2, 7.2]];
    const targetBH = [-2.5, -10.8];
    const targetWO = [10, -10.5];
    const targetBO = [-4.5];
    const totalSteps = 50;
    let currentStep = 0;

    const startWH = wH.map((r) => [...r]);
    const startBH = [...bH];
    const startWO = [...wO];
    const startBO = [...bO];

    const tick = () => {
      if (currentStep >= totalSteps) {
        setTraining(false);
        playSuccess();
        return;
      }
      currentStep++;
      const t = currentStep / totalSteps;
      const ease = t * t * (3 - 2 * t);

      const newWH = startWH.map((row, j) => row.map((w, i) => w + (targetWH[j][i] - w) * ease));
      const newBH = startBH.map((b, j) => b + (targetBH[j] - b) * ease);
      const newWO = startWO.map((w, j) => w + (targetWO[j] - w) * ease);
      const newBO = startBO.map((b, j) => b + (targetBO[j] - b) * ease);

      setWH(newWH);
      setBH(newBH);
      setWO(newWO);
      setBO(newBO);
      setEpoch((e) => e + 1);

      let loss = 0;
      for (const [x1, x2, target] of XOR_DATA) {
        const h0 = sigmoid(newWH[0][0] * x1 + newWH[0][1] * x2 + newBH[0]);
        const h1 = sigmoid(newWH[1][0] * x1 + newWH[1][1] * x2 + newBH[1]);
        const p = sigmoid(newWO[0] * h0 + newWO[1] * h1 + newBO[0]);
        loss += (target - p) * (target - p);
      }
      setLossHistory((prev) => [...prev, loss / XOR_DATA.length]);

      timerRef.current = setTimeout(tick, trainSpeed);
    };
    tick();
  }, [wH, bH, wO, bO, trainSpeed]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTraining(false);
    setWH([[3, 3], [5, 5]]);
    setBH([-1, -7.5]);
    setWO([5, -5]);
    setBO([-2]);
    setEpoch(0);
    setLossHistory([]);
    playClick();
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Weights in the shape expected by <NeuralNetwork>: weights[layer][toNeuron][fromNeuron]
  const vizWeights = useMemo<number[][][]>(
    () => [
      // input → hidden
      [
        [wH[0][0], wH[0][1]],
        [wH[1][0], wH[1][1]],
      ],
      // hidden → output
      [[wO[0], wO[1]]],
    ],
    [wH, wO],
  );

  const INK = "#2b2a35";
  const plotSize = 240;
  const pad = 30;
  const gridRes = 32;
  const cellW = (plotSize - 2 * pad) / gridRes;

  const cells = useMemo(() => {
    const result: { x: number; y: number; val: number }[] = [];
    for (let i = 0; i < gridRes; i++) {
      for (let j = 0; j < gridRes; j++) {
        const x1 = -0.2 + (i / gridRes) * 1.4;
        const x2 = -0.2 + (j / gridRes) * 1.4;
        result.push({ x: i, y: j, val: predict(x1, x2) });
      }
    }
    return result;
  }, [predict]);

  // Sketchy palette: coral → yellow → mint
  const colorForVal = (v: number) => {
    const t = Math.max(0, Math.min(1, v));
    if (t < 0.5) {
      const k = t / 0.5;
      const r = 255;
      const g = Math.round(107 + (217 - 107) * k);
      const b = Math.round(107 + (61 - 107) * k);
      return `rgb(${r},${g},${b})`;
    } else {
      const k = (t - 0.5) / 0.5;
      const r = Math.round(255 + (78 - 255) * k);
      const g = Math.round(217 + (205 - 217) * k);
      const b = Math.round(61 + (196 - 61) * k);
      return `rgb(${r},${g},${b})`;
    }
  };

  const accuracy = XOR_DATA.filter(([x1, x2, t]) => (predict(x1, x2) >= 0.5 ? 1 : 0) === t).length / XOR_DATA.length;

  // Loss curve
  const lossW = 280, lossH = 130, lossPad = 28;

  return (
    <div className="space-y-5">
      <RikuSays>
        XOR is the problem that embarrassed single perceptrons forever. Spoiler: a teeny two-layer net just shrugs and solves it.
      </RikuSays>

      <div className="text-center font-hand text-2xl font-bold">
        <span className="marker-highlight-mint">Neural Network</span> solving XOR
      </div>
      <div className="text-center font-hand text-sm text-muted-foreground">
        2 inputs → 2 hidden → 1 output
      </div>

      {/* Live network view using the shared viz */}
      <div className="card-sketchy p-4 notebook-grid">
        <NeuralNetwork
          layers={[2, 2, 1]}
          weights={vizWeights}
          animateFlow={training}
          showValues={false}
          height={260}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Decision boundary heatmap */}
        <div className="card-sketchy p-3">
          <div className="font-hand text-sm font-bold text-center mb-2">Decision Boundary</div>
          <svg viewBox={`0 0 ${plotSize} ${plotSize}`} className="w-full max-w-[280px] mx-auto">
            {cells.map((c, i) => (
              <rect
                key={i}
                x={pad + c.x * cellW}
                y={pad + (gridRes - 1 - c.y) * cellW}
                width={cellW + 0.5}
                height={cellW + 0.5}
                fill={colorForVal(c.val)}
              />
            ))}
            <rect x={pad} y={pad} width={plotSize - 2 * pad} height={plotSize - 2 * pad} fill="none" stroke={INK} strokeWidth={2.5} rx={4} />
            {/* XOR data points with pulsing halos */}
            {XOR_DATA.map(([x1, x2, t], i) => {
              const sx = pad + ((x1 + 0.2) / 1.4) * (plotSize - 2 * pad);
              const sy = plotSize - pad - ((x2 + 0.2) / 1.4) * (plotSize - 2 * pad);
              const correct = (predict(x1, x2) >= 0.5 ? 1 : 0) === t;
              return (
                <g key={i}>
                  {correct && (
                    <circle cx={sx} cy={sy} r={14} fill="none" stroke={t === 1 ? "#4ecdc4" : "#ff6b6b"} strokeWidth={2} opacity={0.5} className="pulse-glow" style={{ color: t === 1 ? "#4ecdc4" : "#ff6b6b" }} />
                  )}
                  <circle cx={sx} cy={sy} r={11} fill={t === 1 ? "#4ecdc4" : "#ff6b6b"} stroke={INK} strokeWidth={2.5} />
                  <text x={sx} y={sy + 4} textAnchor="middle" className="text-[10px] font-bold" fill="#fff" fontFamily="Kalam">{t}</text>
                </g>
              );
            })}
            <text x={plotSize / 2} y={plotSize - 10} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam">x1</text>
            <text x={12} y={plotSize / 2} textAnchor="middle" className="text-[11px] font-bold" fill={INK} fontFamily="Kalam" transform={`rotate(-90 12 ${plotSize / 2})`}>x2</text>
          </svg>
        </div>

        {/* Loss curve */}
        <div className="card-sketchy p-3">
          <div className="font-hand text-sm font-bold text-center mb-2">Loss over Epochs</div>
          <svg viewBox={`0 0 ${lossW} ${lossH}`} className="w-full max-w-[300px] mx-auto">
            <defs>
              <pattern id="loss-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={INK} strokeOpacity="0.08" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x={lossPad} y={10} width={lossW - 2 * lossPad} height={lossH - lossPad - 10} fill="#fffdf5" stroke={INK} strokeWidth={2} rx={4} />
            <rect x={lossPad} y={10} width={lossW - 2 * lossPad} height={lossH - lossPad - 10} fill="url(#loss-grid)" />

            {lossHistory.length > 1 && (() => {
              const maxLoss = Math.max(...lossHistory, 0.01);
              const pts = lossHistory.map((l, i) => {
                const x = lossPad + (i / Math.max(lossHistory.length - 1, 1)) * (lossW - 2 * lossPad);
                const y = lossH - lossPad - (l / maxLoss) * (lossH - lossPad - 20);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              return (
                <>
                  {/* glow underlay */}
                  <polyline points={pts.join(" ")} fill="none" stroke="#ff6b6b" strokeWidth={6} opacity={0.3} strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={pts.join(" ")} fill="none" stroke="#ff6b6b" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  {/* Latest point dot */}
                  {(() => {
                    const i = lossHistory.length - 1;
                    const x = lossPad + (i / Math.max(lossHistory.length - 1, 1)) * (lossW - 2 * lossPad);
                    const y = lossH - lossPad - (lossHistory[i] / maxLoss) * (lossH - lossPad - 20);
                    return <circle cx={x} cy={y} r={5} fill="#ffd93d" stroke={INK} strokeWidth={2} className="pulse-glow" style={{ color: "#ffd93d" }} />;
                  })()}
                </>
              );
            })()}

            <text x={lossW / 2} y={lossH - 6} textAnchor="middle" className="text-[10px] font-bold" fill={INK} fontFamily="Kalam">Epoch</text>
            <text x={10} y={lossH / 2} textAnchor="middle" className="text-[10px] font-bold" fill={INK} fontFamily="Kalam" transform={`rotate(-90 10 ${lossH / 2})`}>Loss</text>
          </svg>
        </div>
      </div>

      {/* Predictions table */}
      <div className="card-sketchy overflow-hidden max-w-md mx-auto">
        <table className="w-full font-hand text-sm">
          <thead>
            <tr className="bg-accent-yellow border-b-2 border-foreground">
              <th className="px-3 py-2">x1</th>
              <th className="px-3 py-2">x2</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Output</th>
            </tr>
          </thead>
          <tbody>
            {XOR_DATA.map(([x1, x2, t], i) => {
              const out = predict(x1, x2);
              const rounded = out >= 0.5 ? 1 : 0;
              const ok = rounded === t;
              return (
                <tr key={i} className="border-t-2 border-dashed border-foreground/30">
                  <td className="px-3 py-2 text-center font-bold">{x1}</td>
                  <td className="px-3 py-2 text-center font-bold">{x2}</td>
                  <td className="px-3 py-2 text-center font-bold">{t}</td>
                  <td className={`px-3 py-2 text-center font-bold ${ok ? "text-emerald-600" : "text-red-500"}`}>
                    {out.toFixed(3)} {ok ? "OK" : "NO"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="card-sketchy p-3 max-w-md mx-auto" style={{ background: "#fff8e7" }}>
        <div className="flex flex-wrap gap-2 justify-center font-hand text-xs mb-2">
          <span className="px-2 py-0.5 rounded border-2 border-foreground bg-accent-lav text-white">epoch <b>{epoch}</b></span>
          {lossHistory.length > 0 && (
            <span className="px-2 py-0.5 rounded border-2 border-foreground bg-background">loss <b>{lossHistory[lossHistory.length - 1].toFixed(4)}</b></span>
          )}
        </div>
        <div className="h-3 rounded-full border-2 border-foreground bg-background overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ width: `${accuracy * 100}%`, background: accuracy === 1 ? "#4ecdc4" : "#ffd93d" }} />
        </div>
        <div className="text-center font-hand text-xs mt-1">{Math.round(accuracy * 100)}% accuracy</div>
        {accuracy === 1 && epoch > 0 && (
          <div className="text-center font-hand text-base font-bold marker-highlight-mint mt-1">
            XOR solved!
          </div>
        )}
      </div>

      {/* Train speed */}
      <div className="card-sketchy p-3 max-w-md mx-auto">
        <label className="font-hand text-xs font-bold flex justify-between">
          <span>Train Speed</span><span>{trainSpeed}ms</span>
        </label>
        <input type="range" min={30} max={300} step={10} value={trainSpeed} onChange={(e) => setTrainSpeed(parseInt(e.target.value))} className="w-full" style={{ accentColor: "#4ecdc4" }} />
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={handleTrain} disabled={training} className="btn-sketchy text-sm disabled:opacity-50">
          <Zap className="w-4 h-4" />
          {training ? "Training…" : "Train Network"}
        </button>
        <button onClick={handleReset} className="btn-sketchy-outline text-sm">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <InfoBox variant="indigo" title="XOR Solved!">
        <span className="font-hand text-base">
          A multi-layer network solves XOR because the hidden layer transforms the data into a new space where it becomes linearly separable. Watch the decision boundary morph and the loss curve plummet during training!
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
    question: "What is a 'hidden layer' in a neural network?",
    options: [
      "A layer that is invisible to the programmer",
      "A layer between the input and output that transforms data",
      "An extra output layer",
      "A layer that stores the training data",
    ],
    correctIndex: 1,
    explanation:
      "Hidden layers sit between input and output. They transform the data into representations that make the final output easier to compute.",
  },
  {
    question: "Why can a multi-layer network solve XOR but a single perceptron cannot?",
    options: [
      "It runs faster",
      "It uses more memory",
      "Hidden layers create non-linear decision boundaries",
      "It has more input nodes",
    ],
    correctIndex: 2,
    explanation:
      "The hidden layer transforms the input space so that the XOR pattern becomes linearly separable for the output layer.",
  },
  {
    question: "What happens during a 'forward pass'?",
    options: [
      "Weights are updated",
      "Data flows from input through all layers to produce an output",
      "The network is reset",
      "Errors are calculated backward",
    ],
    correctIndex: 1,
    explanation:
      "A forward pass sends input data through the network layer by layer, computing activations until the output is produced.",
  },
  {
    question: "What does adding more hidden neurons generally allow a network to do?",
    options: [
      "Learn simpler patterns only",
      "Run faster",
      "Learn more complex patterns",
      "Use less memory",
    ],
    correctIndex: 2,
    explanation:
      "More hidden neurons give the network more capacity to represent complex patterns and decision boundaries.",
  },
  {
    question: "In a forward pass, which layer is computed first?",
    options: [
      "Output layer",
      "The layer closest to the input (hidden layer)",
      "All layers at the same time",
      "A random layer",
    ],
    correctIndex: 1,
    explanation:
      "In a forward pass, computation goes left to right: input layer values feed into the hidden layer, then hidden layer outputs feed into the output layer.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function L20_NeuralNetworkActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "architecture",
        label: "Network Architecture",
        icon: <Network className="w-4 h-4" />,
        content: <ArchitectureTab />,
      },
      {
        id: "layer-by-layer",
        label: "Layer by Layer",
        icon: <Layers className="w-4 h-4" />,
        content: <LayerByLayerTab />,
      },
      {
        id: "solving-xor",
        label: "Solving XOR",
        icon: <Target className="w-4 h-4" />,
        content: <SolvingXORTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Building a Neural Network"
      level={6}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn backpropagation -- how neural networks actually learn!"
      story={
        <StorySection
          paragraphs={[
            "Aru was still puzzled by the XOR problem from the last lesson.",
            "Aru: \"So if one perceptron can't solve XOR, what do we do? Just give up?\"",
            "Byte: \"Never! We connect them into layers! Input goes to a Hidden layer, which goes to an Output layer. Each layer transforms the data in a new way. Together, they can learn anything!\"",
            "Aru: \"So it's like a team of neurons working together?\"",
            "Byte: \"Exactly! One neuron might not be smart enough, but a network of neurons can solve incredibly complex problems. Let me show you how to build one!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A neural network connects neurons in layers: Input, Hidden, and Output. The hidden layer transforms data into a new representation where previously impossible problems (like XOR) become solvable. More neurons and layers = more learning power."
        />
      }
    />
  );
}
