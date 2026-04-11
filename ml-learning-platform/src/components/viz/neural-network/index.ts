// Barrel export for the neural-network visualization library.
export { Neuron, default as NeuronDefault } from "./Neuron";
export type { NeuronProps } from "./Neuron";

export { NeuralNetwork, default as NeuralNetworkDefault } from "./NeuralNetwork";
export type { NeuralNetworkProps } from "./NeuralNetwork";

export { WeightSlider, default as WeightSliderDefault } from "./WeightSlider";
export type { WeightSliderProps } from "./WeightSlider";

export {
  ActivationFunctionViz,
  default as ActivationFunctionVizDefault,
} from "./ActivationFunctionViz";
export type { ActivationFunctionVizProps } from "./ActivationFunctionViz";

export { Perceptron, default as PerceptronDefault } from "./Perceptron";
export type { PerceptronProps, PerceptronPoint } from "./Perceptron";

export { LossLandscape, default as LossLandscapeDefault } from "./LossLandscape";
export type { LossLandscapeProps } from "./LossLandscape";

export {
  ForwardPassAnimation,
  default as ForwardPassAnimationDefault,
} from "./ForwardPassAnimation";
export type { ForwardPassAnimationProps } from "./ForwardPassAnimation";

export {
  BackpropagationViz,
  default as BackpropagationVizDefault,
} from "./BackpropagationViz";
export type { BackpropagationVizProps } from "./BackpropagationViz";

// Helpers re-exported for lesson authors.
export {
  activate,
  activateDerivative,
  softmaxVec,
  weightedSum,
  forwardPass,
  makeRandomWeights,
  round,
  fmt,
  clamp,
  type ActivationName,
} from "./utils";
export { mulberry32 } from "./mulberry32";
