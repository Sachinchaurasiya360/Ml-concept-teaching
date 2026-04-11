// Barrel exports for the CNN / image visualization library.

export { default as ImageGrid } from "./ImageGrid";
export type { ImageGridProps } from "./ImageGrid";

export { default as ConvolutionViz } from "./ConvolutionViz";
export type { ConvolutionVizProps } from "./ConvolutionViz";

export { default as FilterBank } from "./FilterBank";
export type { FilterBankProps } from "./FilterBank";

export { default as PoolingViz } from "./PoolingViz";
export type { PoolingVizProps } from "./PoolingViz";

export { default as FeatureMap } from "./FeatureMap";
export type { FeatureMapProps } from "./FeatureMap";

export { default as MiniCNN } from "./MiniCNN";
export type { MiniCNNProps } from "./MiniCNN";

export { default as KernelEditor } from "./KernelEditor";
export type { KernelEditorProps } from "./KernelEditor";

// Shared types
export type {
  Pixels2D,
  FilterKernel,
  ColormapName,
  PoolingType,
  LayerType,
  LayerSpec,
  ConvLayerSpec,
  PoolLayerSpec,
  DenseLayerSpec,
  FlattenLayerSpec,
  ConvStep,
  NamedFilter,
} from "./types";

// Image + kernel helpers
export {
  mulberry32,
  convolve2d,
  maxPool2d,
  avgPool2d,
  maxPoolArgmax,
  normalizeImage,
  normalizeValue,
  getColormap,
  textColorForValue,
  minMax,
  makeZeros,
  clonePixels,
  makeKernel,
  cloneKernel,
  PRESET_FILTERS,
  DEFAULT_FILTER_BANK,
  DEMO_IMAGES,
  DEFAULT_DEMO_IMAGE,
} from "./imageUtils";
