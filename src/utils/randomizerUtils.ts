import type p5 from "p5";
import { PALETTES } from "../constants/palettes";
import type {
  RandomTargets,
  SketchParameters,
  TransitionType,
} from "../types/sketch";

/**
 * Computes randomized parameters based on selected target flags.
 */
export function buildRandomizedParameters(
  prevParams: SketchParameters,
  targets: RandomTargets,
  p5Instance?: p5,
): { nextParams: SketchParameters } {
  const next: SketchParameters = { ...prevParams };
  const p = p5Instance || ({} as p5);

  const randRange = (min: number, max: number) => {
    return p.random
      ? p.random(min, max)
      : min + Math.random() * (max - min);
  };

  const randInt = (min: number, max: number) => {
    return Math.floor(randRange(min, max + 1));
  };

  const randChoice = <T>(arr: T[]): T => {
    return arr[randInt(0, arr.length - 1)];
  };

  if (targets.canvasAspectRatio) {
    const ratioCandidates = [1.0, 16 / 9, 9 / 16, 4 / 5, 3 / 2, 4 / 3];
    next.canvasAspectRatio = randChoice(ratioCandidates);
  }

  if (targets.canvasPadding) {
    next.canvasPadding = Math.floor(randRange(10, 80));
  }

  if (targets.palette) {
    const palIdx = randInt(0, PALETTES.length - 1);
    const pal = PALETTES[palIdx];
    next.paletteIndex = palIdx;
    let colors = [...pal.colors];

    if (targets.paletteShuffle) {
      colors = colors.sort(() => Math.random() - 0.5);
      next.paletteShuffledColors = colors;
    } else {
      next.paletteShuffledColors = null;
    }

    next.backgroundColor = colors[0]?.hex || "#FFFFFF";
    next.primaryColor = colors[1]?.hex || "#000000";
    next.secondaryColor = colors[2]?.hex || colors[1]?.hex || "#888888";
    next.accentColor = colors[3]?.hex || colors[0]?.hex || "#FF0055";

    // Randomize background color index within palette
    next.backgroundColorIndex = randInt(0, colors.length - 1);
  } else if (targets.paletteShuffle) {
    const pal = PALETTES[next.paletteIndex] || PALETTES[0];
    const baseColors =
      next.paletteShuffledColors && next.paletteShuffledColors.length > 0
        ? [...next.paletteShuffledColors]
        : [...pal.colors];
    const shuffled = [...baseColors].sort(() => Math.random() - 0.5);
    next.paletteShuffledColors = shuffled;
    next.backgroundColor = shuffled[0]?.hex || "#FFFFFF";
    next.backgroundColorIndex = 0;
  }

  // Deflating Spheres: Center Radius
  if (targets.centerRadius) {
    next.centerRadius = randInt(40, 180);
  }

  // Deflating Spheres: Emission & Launch
  if (targets.emission) {
    next.centerRadius = randInt(40, 180);
    next.emissionIntervalFrames = randInt(20, 110);
    next.emissionJitterFactor = Number(randRange(0.1, 0.7).toFixed(2));
    next.initialVelocity = Number(randRange(2.0, 10.0).toFixed(1));
  }

  // Deflating Spheres: Deflation Rate
  if (targets.deflation) {
    next.deflationRate = Number(randRange(0.004, 0.028).toFixed(3));
  }

  // Deflating Spheres: Wander & Noise Trajectory
  if (targets.wander) {
    next.wanderStrength = Number(randRange(0.4, 3.0).toFixed(1));
    next.harmonicFrequency = Number(randRange(0.01, 0.07).toFixed(3));
    next.smoothingFactor = Number(randRange(0.75, 0.97).toFixed(2));
    next.trailHistoryLength = randInt(12, 60);
  }

  if (targets.distinctChildColor) {
    next.distinctChildColor = Math.random() > 0.15;
  }

  if (targets.organicParentGrowth) {
    next.enableOrganicParentGrowth = Math.random() > 0.1;
    next.parentGrowthRate = Number(randRange(0.1, 0.45).toFixed(2));
    next.deflationShrinkFactor = Number(randRange(0.1, 0.35).toFixed(2));
    next.deflationDurationFactor = Number(randRange(0.6, 2.0).toFixed(2));
    next.deflationTriggerTiming = Number(randRange(0.4, 1.1).toFixed(2));
  }

  // Deflating Spheres: Opt-in Effects
  if (targets.effects) {
    next.enableBreathingPulse = Math.random() > 0.6;
    if (next.enableBreathingPulse) {
      next.pulseIntensity = randInt(10, 50);
      next.pulseSpeed = Number(randRange(0.02, 0.08).toFixed(3));
    }
    next.enableReflectionHighlight = Math.random() > 0.5;
    next.enableGlowBokeh = Math.random() > 0.6;
    next.enableBorderOutline = Math.random() > 0.7;
    next.enableCenterCoreDot = Math.random() > 0.6;
  }

  if (targets.circleOpacity) {
    next.circleOpacity = Number(randRange(0.4, 1.0).toFixed(2));
  }

  if (targets.randomSeed) {
    next.randomSeedValue = Math.floor(randRange(1, 999999));
  }

  if (targets.transitionType) {
    const transitions: TransitionType[] = [
      "none",
      "fade",
      "slide",
      "zoom",
      "wipe",
      "swipeHorizontal",
      "swipeVertical",
      "cubeHorizontal",
      "cubeVertical",
    ];
    next.transitionType = randChoice(transitions);
  }

  if (targets.grain) {
    next.showGrain = Math.random() > 0.5;
    next.grainIntensity = Number(randRange(0.05, 0.35).toFixed(2));
  }

  if (targets.riso) {
    next.showRiso = Math.random() > 0.5;
    next.risoOffsetPx = Math.floor(randRange(1, 8));
    next.risoIntensity = Number(randRange(0.3, 0.9).toFixed(2));
  }

  if (targets.halftone) {
    next.showHalftone = Math.random() > 0.5;
    next.halftoneSize = Math.floor(randRange(3, 12));
    next.halftoneAngle = Math.floor(randRange(0, 90));
  }

  if (targets.dithering) {
    next.showDithering = Math.random() > 0.5;
    next.ditheringScale = Math.floor(randRange(1, 4));
    next.ditheringLevels = Math.floor(randRange(2, 6));
  }

  if (targets.inkBleed) {
    next.showInkBleed = Math.random() > 0.5;
    next.inkBleedAmount = Number(randRange(1.0, 5.0).toFixed(1));
    next.inkBleedRoughness = Number(randRange(0.1, 0.6).toFixed(2));
  }

  if (targets.paperTexture) {
    next.showPaperTexture = Math.random() > 0.5;
    next.paperRoughness = Number(randRange(0.1, 0.5).toFixed(2));
    next.paperColorDensity = Number(randRange(0.05, 0.3).toFixed(2));
  }

  if (targets.cmyk) {
    next.showCmyk = Math.random() > 0.5;
    next.cmykOffsetFactor = Math.floor(randRange(1, 6));
    next.cmykIntensity = Number(randRange(0.3, 0.9).toFixed(2));
  }

  if (targets.vignette) {
    next.showVignette = Math.random() > 0.5;
    next.vignetteIntensity = Number(randRange(0.2, 0.7).toFixed(2));
    next.vignetteRadius = Number(randRange(0.3, 0.8).toFixed(2));
  }

  if (targets.peripheralBlur) {
    next.showPeripheralBlur = Math.random() > 0.5;
    next.peripheralBlurAmount = Math.floor(randRange(2, 10));
    next.peripheralBlurRadius = Number(randRange(0.2, 0.6).toFixed(2));
  }

  return { nextParams: next };
}
