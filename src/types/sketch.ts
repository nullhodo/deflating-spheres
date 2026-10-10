export interface ColorItem {
  name: string;
  hex: string;
  rgb: [number, number, number];
}

export interface Palette {
  title: string;
  comment: string;
  colors: ColorItem[];
}

export type TransitionType =
  | "none"
  | "fade"
  | "slide"
  | "zoom"
  | "wipe"
  | "swipeHorizontal"
  | "swipeVertical"
  | "cubeHorizontal"
  | "cubeVertical";

export interface SketchParameters {
  // Canvas & Core
  canvasAspectRatio: number;
  canvasPadding: number;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  paletteIndex: number;
  paletteShuffledColors: ColorItem[] | null;
  randomSeedValue: number;

  // Deflating Spheres Parameters
  centerRadius: number;
  pulseIntensity: number;
  pulseSpeed: number;
  emissionIntervalFrames: number;
  emissionJitterFactor: number;
  initialVelocity: number;

  deflationRate: number;
  wanderStrength: number;
  harmonicFrequency: number;
  smoothingFactor: number;
  trailHistoryLength: number;
  circleOpacity: number;

  // Distinct child color option
  distinctChildColor: boolean;

  // Organic parent growth & deflate shrinkage
  enableOrganicParentGrowth: boolean;
  parentGrowthRate: number;
  deflationShrinkFactor: number;
  deflationDurationFactor: number;
  deflationTriggerTiming: number;

  // Opt-in Visual Effects (Default OFF)
  enableBreathingPulse: boolean;
  enableReflectionHighlight: boolean;
  enableGlowBokeh: boolean;
  enableBorderOutline: boolean;
  enableCenterCoreDot: boolean;

  // Color Modes
  useSingleColorMode: boolean;
  singleColorValue: string;
  useGradientTheme: boolean;
  gradientBaseColor: string;
  backgroundColorIndex: number;
  manualBackgroundColor: string;

  // Color Mixing & Subtraction System
  enableColorMixingSystem?: boolean;
  colorMixingMode?: "rgb_additive" | "cmy_subtractive";
  colorRechargeSpeed?: number;

  // Demo Shape Parameters (for compatibility)
  shapeCount: number;
  shapeSize: number;
  shapeComplexity: number;
  animationSpeed: number;
  shapeType: "circle" | "rect" | "polygon" | "flower" | "spiral";

  // Transition
  transitionType: TransitionType;
  transitionDurationMs: number;

  // Artistic Effects
  showGrain: boolean;
  grainIntensity: number;

  showRiso: boolean;
  risoOffsetPx: number;
  risoIntensity: number;

  showHalftone: boolean;
  halftoneSize: number;
  halftoneAngle: number;

  showDithering: boolean;
  ditheringScale: number;
  ditheringLevels: number;

  showInkBleed: boolean;
  inkBleedAmount: number;
  inkBleedRoughness: number;

  showPaperTexture: boolean;
  paperRoughness: number;
  paperColorDensity: number;

  showCmyk: boolean;
  cmykOffsetFactor: number;
  cmykIntensity: number;

  showVignette: boolean;
  vignetteIntensity: number;
  vignetteRadius: number;

  showPeripheralBlur: boolean;
  peripheralBlurAmount: number;
  peripheralBlurRadius: number;

  // Debug
  debugMode: boolean;
}

export interface RandomTargets {
  canvasAspectRatio: boolean;
  canvasPadding: boolean;
  palette: boolean;
  paletteShuffle: boolean;
  centerRadius: boolean;
  emission: boolean;
  deflation: boolean;
  wander: boolean;
  distinctChildColor: boolean;
  organicParentGrowth: boolean;
  effects: boolean;
  circleOpacity: boolean;
  randomSeed: boolean;
  transitionType: boolean;
  grain: boolean;
  riso: boolean;
  halftone: boolean;
  dithering: boolean;
  inkBleed: boolean;
  paperTexture: boolean;
  cmyk: boolean;
  vignette: boolean;
  peripheralBlur: boolean;
}

export type SketchParamValue = number | boolean | string;
