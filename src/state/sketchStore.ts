import { atom } from "jotai";
import { DEFAULT_SKETCH_PARAMETERS } from "../constants/palettes";
import type { RandomTargets, SketchParameters } from "../types/sketch";

const DEFAULT_RANDOM_TARGETS: RandomTargets = {
  canvasAspectRatio: false,
  canvasPadding: false,
  palette: true,
  paletteShuffle: true,
  centerRadius: true,
  emission: true,
  deflation: true,
  wander: true,
  distinctChildColor: false,
  organicParentGrowth: false,
  effects: false,
  circleOpacity: false,
  randomSeed: true,
  transitionType: false,
  grain: false,
  riso: false,
  halftone: false,
  dithering: false,
  inkBleed: false,
  paperTexture: false,
  cmyk: false,
  vignette: false,
  peripheralBlur: false,
};

export const sketchParamsAtom = atom<SketchParameters>(
  DEFAULT_SKETCH_PARAMETERS,
);

export const historyStackAtom = atom<SketchParameters[]>([
  JSON.parse(JSON.stringify(DEFAULT_SKETCH_PARAMETERS)),
]);
export const historyPointerAtom = atom<number>(0);

export const isPanelOpenAtom = atom<boolean>(true);

interface RecordingState {
  isRecording: boolean;
  elapsedSeconds: number;
  isLoopMode?: boolean;
  currentLoop?: number;
  totalLoops?: number;
  loopIntervalMs?: number;
}

export const recordingStateAtom = atom<RecordingState>({
  isRecording: false,
  elapsedSeconds: 0,
  isLoopMode: false,
  currentLoop: 1,
  totalLoops: 1,
  loopIntervalMs: 2000,
});

export const randomTargetsAtom = atom<RandomTargets>(
  DEFAULT_RANDOM_TARGETS,
);
export const isRandomTargetsModalOpenAtom = atom<boolean>(false);

export const autoRandomIntervalMsAtom = atom<number>(5000);
export const isAutoRandomActiveAtom = atom<boolean>(false);

export const targetLoopsCountAtom = atom<number>(2);
export const isLoopRecordingActiveAtom = atom<boolean>(false);

// Live Simulation Diagnostics
interface SimulationDiagnostics {
  fps: number;
  activeParticles: number;
  centerRadius: number;
  optInEffectsActive: number;
}

export const simulationDiagnosticsAtom = atom<SimulationDiagnostics>({
  fps: 60,
  activeParticles: 0,
  centerRadius: 110,
  optInEffectsActive: 0,
});
