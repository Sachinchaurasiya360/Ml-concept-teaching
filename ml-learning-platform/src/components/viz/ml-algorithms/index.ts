// Barrel exports for the ML algorithms visualization library.

export { default as KNNViz } from "./KNNViz";
export type { KNNVizProps } from "./KNNViz";

export { default as DecisionTreeViz } from "./DecisionTreeViz";
export type { DecisionTreeVizProps } from "./DecisionTreeViz";

export { default as KMeansViz } from "./KMeansViz";
export type { KMeansVizProps } from "./KMeansViz";

export { default as LinearRegressionViz } from "./LinearRegressionViz";
export type { LinearRegressionVizProps } from "./LinearRegressionViz";

export { default as LogisticRegressionViz } from "./LogisticRegressionViz";
export type { LogisticRegressionVizProps } from "./LogisticRegressionViz";

export { default as SVMViz } from "./SVMViz";
export type { SVMVizProps } from "./SVMViz";

export { default as RandomForestViz } from "./RandomForestViz";
export type { RandomForestVizProps } from "./RandomForestViz";

export { default as GradientDescentViz } from "./GradientDescentViz";
export type { GradientDescentVizProps } from "./GradientDescentViz";

export { default as ConfusionMatrixViz } from "./ConfusionMatrixViz";
export type { ConfusionMatrixVizProps } from "./ConfusionMatrixViz";

export {
  mulberry32,
  generateClusters,
  generateLinearData,
  generateClassification2D,
  generateCircularData,
  generateMoons,
  CLUSTER_COLORS,
} from "./dataGenerator";
export type { Point } from "./dataGenerator";
