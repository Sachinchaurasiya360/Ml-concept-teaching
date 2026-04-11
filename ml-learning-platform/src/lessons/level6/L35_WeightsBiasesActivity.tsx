"use client";

import { useState, useMemo } from "react";
import { Sliders, Scale, Target } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  Neuron,
  NeuralNetwork,
  WeightSlider,
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
/*  Tab 1 - What is a weight? (single input)                          */
/* ------------------------------------------------------------------ */

function SingleWeightTab() {
  const [input, setInput] = useState(5);
  const [weight, setWeight] = useState(2);

  const output = input * weight;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        A <b>weight</b> is just a number that says how IMPORTANT an input is.
      </p>

      <RikuSays>
        Hey, Riku here! Weights are like volume knobs  turn one up and
        that input gets louder in the final decision. Turn it to zero and
        the neuron stops caring.
      </RikuSays>

      <div className="card-sketchy p-4 notebook-grid">
        <Neuron
          inputs={[input]}
          weights={[weight]}
          bias={0}
          activation="linear"
          size={460}
          label={`output = input × weight = ${input} × ${weight} = ${output}`}
        />
      </div>

      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <div>
          <p className="font-hand text-sm font-bold text-foreground mb-1">
            Input value
          </p>
          <WeightSlider
            label="input"
            value={input}
            onChange={setInput}
            min={-10}
            max={10}
            step={1}
          />
        </div>
        <div>
          <p className="font-hand text-sm font-bold text-foreground mb-1">
            Weight
          </p>
          <WeightSlider
            label="weight"
            value={weight}
            onChange={setWeight}
            min={-3}
            max={5}
            step={0.5}
          />
        </div>
        <p className="font-hand text-xs text-muted-foreground">
          Try a weight of 0  the input gets ignored. Try a negative weight
          it flips the sign!
        </p>
      </div>

      <RikuSays>
        Watch the line between input and neuron: it changes color and
        thickness depending on the weight. Mint means positive, coral means
        negative, thicker means stronger. Same story inside every neural
        network you&apos;ll ever meet.
      </RikuSays>

      <InfoBox variant="blue">
        Big weight = &quot;this input matters a lot.&quot; Small weight =
        &quot;barely listen to this one.&quot; Negative weight = &quot;this
        input ARGUES against firing.&quot;
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Multiple inputs + bias                                     */
/* ------------------------------------------------------------------ */

function MultiInputTab() {
  const [w1, setW1] = useState(2);
  const [w2, setW2] = useState(3);
  const [w3, setW3] = useState(1);
  const [bias, setBias] = useState(0);

  const inputVals = [4, 7, 1]; // hours studied, hours slept, ate breakfast
  const weights = [w1, w2, w3];
  const sum =
    inputVals[0] * w1 + inputVals[1] * w2 + inputVals[2] * w3 + bias;
  const fires = sum > 15;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Real neurons combine MANY inputs. Watch how the weighted sum changes
        as you tweak each knob.
      </p>

      <RikuSays>
        The inputs are fixed today: 4 hours studied, 7 hours slept, 1 for
        ate-breakfast-yes. Your job is to decide how much each one MATTERS
        for the final decision.
      </RikuSays>

      <div className="card-sketchy p-4 notebook-grid">
        <Neuron
          inputs={inputVals}
          weights={weights}
          bias={bias}
          activation="linear"
          size={520}
          label={`study×${w1} + sleep×${w2} + breakfast×${w3} + ${bias} = ${sum.toFixed(1)}`}
        />
      </div>

      <div className="card-sketchy p-3 text-center font-hand text-sm">
        Neuron fires when sum {">"} 15:{" "}
        <span
          className={`px-2 py-0.5 rounded border-2 border-foreground font-bold ${
            fires ? "bg-accent-mint text-white" : "bg-background"
          }`}
        >
          {fires ? "FIRE" : "off"}
        </span>
      </div>

      {/* Sliders */}
      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <WeightSlider
          label="Weight 1 (study)"
          value={w1}
          onChange={setW1}
          min={-3}
          max={5}
          step={0.5}
        />
        <WeightSlider
          label="Weight 2 (sleep)"
          value={w2}
          onChange={setW2}
          min={-3}
          max={5}
          step={0.5}
        />
        <WeightSlider
          label="Weight 3 (breakfast)"
          value={w3}
          onChange={setW3}
          min={-3}
          max={5}
          step={0.5}
        />
        <WeightSlider
          label="Bias (constant nudge)"
          value={bias}
          onChange={setBias}
          min={-10}
          max={10}
          step={1}
        />
      </div>

      <RikuSays>
        The bias is the neuron&apos;s mood ring  a constant nudge added
        before the decision. Push bias way up and the neuron fires even with
        bad inputs. Push it down and it sulks no matter what.
      </RikuSays>

      <InfoBox variant="amber">
        The <b>bias</b> is like a &quot;default mood&quot;  a constant nudge
        added to the sum. It lets the neuron fire even when all inputs are
        zero, or refuse to fire even when they&apos;re all big.
      </InfoBox>

      {/* Show a whole little network for context */}
      <div className="card-sketchy p-4 notebook-grid">
        <p className="font-hand text-sm text-center text-foreground mb-2">
          In a real network, every arrow has its own weight and every neuron
          has its own bias. Here&apos;s what that looks like:
        </p>
        <NeuralNetwork
          layers={[3, 4, 2]}
          animateFlow
          inputs={[0.4, 0.7, 0.1]}
          width={560}
          height={260}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Tuning challenge                                           */
/* ------------------------------------------------------------------ */

const CHALLENGES = [
  {
    title: "Make the neuron output 20",
    inputs: [3, 4] as [number, number],
    target: 20,
    hint: "Try making both weights bigger.",
  },
  {
    title: "Make the neuron output 0 (without using zero weights)",
    inputs: [5, 5] as [number, number],
    target: 0,
    hint: "Try a positive weight on one and a negative on the other.",
  },
  {
    title: "Make the neuron output -10",
    inputs: [2, 3] as [number, number],
    target: -10,
    hint: "Negative weights flip the sign of inputs.",
  },
];

function ChallengeTab() {
  const [round, setRound] = useState(0);
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(1);

  const c = CHALLENGES[round];
  const out = c.inputs[0] * w1 + c.inputs[1] * w2;
  const diff = Math.abs(out - c.target);
  const won = diff < 0.5;

  function next() {
    setRound((r) => (r + 1) % CHALLENGES.length);
    setW1(1);
    setW2(1);
  }

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Tune the weights to hit the target output!
      </p>

      <RikuSays>
        Gradient descent does this automatically  but once you feel it in
        your thumbs, the rest of ML clicks. Small nudges, check the output,
        nudge again.
      </RikuSays>

      <div
        className="card-sketchy p-4"
        style={{ background: won ? "#e8fff5" : "#fffdf5" }}
      >
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center">
          Challenge {round + 1} of {CHALLENGES.length}
        </p>
        <h3 className="font-hand text-lg font-bold text-foreground text-center mt-1">
          {c.title}
        </h3>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <p className="font-hand text-xs text-muted-foreground">Input 1</p>
            <p className="font-hand text-2xl font-bold text-foreground">
              {c.inputs[0]}
            </p>
          </div>
          <div className="text-center">
            <p className="font-hand text-xs text-muted-foreground">Input 2</p>
            <p className="font-hand text-2xl font-bold text-foreground">
              {c.inputs[1]}
            </p>
          </div>
          <div
            className="text-center rounded-lg border-2 border-foreground p-2"
            style={{ background: "#ffd93d44" }}
          >
            <p className="font-hand text-xs text-muted-foreground">Target</p>
            <p className="font-hand text-2xl font-bold text-foreground">
              {c.target}
            </p>
          </div>
        </div>

        <div
          className="mt-4 text-center rounded-lg border-2 border-foreground p-3"
          style={{ background: won ? "#4ecdc444" : "#ff6b6b22" }}
        >
          <p className="font-hand text-xs text-muted-foreground">Current output</p>
          <p
            className="font-hand text-3xl font-bold text-foreground"
            style={{ color: won ? "#2b2a35" : "#ff6b6b" }}
          >
            {out.toFixed(1)}
          </p>
          <p className="font-hand text-xs text-muted-foreground">
            {won ? "Bullseye!" : `off by ${diff.toFixed(1)}`}
          </p>
        </div>
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <Neuron
          inputs={[c.inputs[0], c.inputs[1]]}
          weights={[w1, w2]}
          bias={0}
          activation="linear"
          size={440}
          label={`${c.inputs[0]}×${w1} + ${c.inputs[1]}×${w2} = ${out.toFixed(1)}`}
        />
      </div>

      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <WeightSlider
          label="Weight 1"
          value={w1}
          onChange={setW1}
          min={-5}
          max={5}
          step={0.5}
        />
        <WeightSlider
          label="Weight 2"
          value={w2}
          onChange={setW2}
          min={-5}
          max={5}
          step={0.5}
        />
        <p className="font-hand text-[11px] italic text-muted-foreground">
          Hint: {c.hint}
        </p>
      </div>

      {won && (
        <button
          onClick={next}
          className="btn-sketchy font-hand text-sm w-full"
          style={{ background: "#ffd93d" }}
        >
          Next challenge →
        </button>
      )}

      <InfoBox variant="green">
        This is exactly what training a neural network does  except the
        computer adjusts MILLIONS of weights at the same time, not just two!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does a 'weight' do in a neuron?",
    options: [
      "Holds the neuron in place",
      "Tells the neuron how important each input is",
      "Counts the inputs",
      "Stores memories",
    ],
    correctIndex: 1,
    explanation:
      "Weights tell the neuron how much each input matters. Big weight = listen closely. Tiny weight = ignore.",
  },
  {
    question: "If you set a weight to 0, what happens to that input?",
    options: [
      "It gets doubled",
      "It gets completely ignored",
      "It crashes the neuron",
      "It becomes 1",
    ],
    correctIndex: 1,
    explanation: "Anything × 0 = 0, so a zero weight is the neuron saying 'I don't care about this input at all'.",
  },
  {
    question: "What is a 'bias' in a neuron?",
    options: [
      "An input from outside",
      "A constant nudge added to the weighted sum",
      "A type of weight",
      "An error",
    ],
    correctIndex: 1,
    explanation:
      "The bias is just a number added at the end. It shifts the neuron's 'default' behavior up or down.",
  },
  {
    question: "Training a neural network means...",
    options: [
      "Building it from scratch",
      "Adjusting all the weights and biases until the outputs are correct",
      "Buying more computers",
      "Adding more inputs",
    ],
    correctIndex: 1,
    explanation:
      "Training is just slowly tweaking weights and biases  millions of them  until the network gets the right answers.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function L35_WeightsBiasesActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "single",
        label: "What's a Weight?",
        icon: <Sliders className="w-4 h-4" />,
        content: <SingleWeightTab />,
      },
      {
        id: "multi",
        label: "Many Inputs + Bias",
        icon: <Scale className="w-4 h-4" />,
        content: <MultiInputTab />,
      },
      {
        id: "challenge",
        label: "Tuning Challenge",
        icon: <Target className="w-4 h-4" />,
        content: <ChallengeTab />,
      },
    ],
    []
  );

  return (
    <LessonShell
      title="Weights & Biases: Tuning a Neuron"
      level={6}
      lessonNumber={5}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now you know how a single neuron is tuned. Next: watch DATA flow through a whole network of them!"
      story={
        <StorySection
          paragraphs={[
            "Aru: \"Byte, you keep saying 'the network learns by adjusting weights'. But what IS a weight?\"",
            "Byte: \"Imagine a chef tasting soup. The chef listens to your tongue (input 1: salty), your nose (input 2: smells good), your eyes (input 3: looks nice). Each sense matters DIFFERENTLY.\"",
            "Aru: \"Salty matters more than how it looks.\"",
            "Byte: \"Right! So you give 'salty' a big weight. 'Looks nice' gets a small weight. Each input is multiplied by its weight, then they're all summed up. THAT'S a neuron.\"",
            "Aru: \"And training the network is just figuring out the right numbers for those weights?\"",
            "Byte: \"Exactly. Adjusting millions of weights  like millions of tiny taste-knobs  until the network gets the right answer. Let's tune some yourself.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Every connection in a neural network has a WEIGHT  a number that says how important that input is. Each neuron also has a BIAS  a constant nudge added to the sum. Training a neural network is the process of adjusting all these weights and biases until the network produces correct outputs."
        />
      }
    />
  );
}
