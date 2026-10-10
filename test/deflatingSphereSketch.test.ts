import { describe, expect, it } from "vitest";
import { DeflatingSphereSimulation } from "../src/core/sketch/deflatingSphereSketch";
import type { Palette, SketchParameters } from "../src/types/sketch";

const mockPalettes: Palette[] = [
  {
    title: "Retro Color Blocks",
    comment: "Vintage multi-color blocks",
    colors: [
      { name: "Burgundy", hex: "#551a28", rgb: [85, 26, 40] },
      { name: "Mustard", hex: "#d89f08", rgb: [216, 159, 8] },
      { name: "Teal", hex: "#2d8c84", rgb: [45, 140, 132] },
      { name: "Red", hex: "#a51e0e", rgb: [165, 30, 14] },
      { name: "Cream", hex: "#dfc7af", rgb: [223, 199, 175] },
    ],
  },
];

const createParams = (
  overrides?: Partial<SketchParameters>,
): SketchParameters => {
  return {
    canvasAspectRatio: 1,
    canvasPadding: 40,
    backgroundColor: "#dfc7af",
    primaryColor: "#551a28",
    secondaryColor: "#d89f08",
    accentColor: "#2d8c84",
    paletteIndex: 0,
    paletteShuffledColors: null,
    randomSeedValue: 12345,
    centerRadius: 100,
    pulseIntensity: 0,
    pulseSpeed: 0.045,
    emissionIntervalFrames: 20,
    emissionJitterFactor: 0,
    initialVelocity: 5.0,
    deflationRate: 0.01,
    wanderStrength: 1.0,
    harmonicFrequency: 0.035,
    smoothingFactor: 0.9,
    trailHistoryLength: 32,
    circleOpacity: 1.0,
    distinctChildColor: true,
    enableOrganicParentGrowth: true,
    parentGrowthRate: 0.5,
    deflationShrinkFactor: 0.5,
    deflationDurationFactor: 1.0,
    enableBreathingPulse: false,
    enableReflectionHighlight: false,
    enableGlowBokeh: false,
    enableBorderOutline: false,
    enableCenterCoreDot: false,
    useSingleColorMode: false,
    singleColorValue: "#38bdf8",
    useGradientTheme: false,
    gradientBaseColor: "#38bdf8",
    backgroundColorIndex: 4, // Cream
    manualBackgroundColor: "#dfc7af",
    shapeCount: 16,
    shapeSize: 60,
    shapeComplexity: 6,
    animationSpeed: 1,
    shapeType: "circle",
    transitionType: "none",
    transitionDurationMs: 500,
    showGrain: false,
    grainIntensity: 0.15,
    showRiso: false,
    risoOffsetPx: 3,
    risoIntensity: 0.7,
    showHalftone: false,
    halftoneSize: 6,
    halftoneAngle: 45,
    showDithering: false,
    ditheringScale: 2,
    ditheringLevels: 4,
    showInkBleed: false,
    inkBleedAmount: 2.5,
    inkBleedRoughness: 0.4,
    showPaperTexture: false,
    paperRoughness: 0.25,
    paperColorDensity: 0.15,
    showCmyk: false,
    cmykOffsetFactor: 3,
    cmykIntensity: 0.8,
    showVignette: false,
    vignetteIntensity: 0.45,
    vignetteRadius: 0.5,
    showPeripheralBlur: false,
    peripheralBlurAmount: 6,
    peripheralBlurRadius: 0.4,
    debugMode: false,
    ...overrides,
  };
};

describe("DeflatingSphereSimulation - New Organic Features", () => {
  it("emits child circles with distinct colors from parent when distinctChildColor is true", () => {
    const sim = new DeflatingSphereSimulation();
    const params = createParams({
      distinctChildColor: true,
      emissionIntervalFrames: 5,
    });

    // Run simulation to trigger emission
    for (let frame = 0; frame < 10; frame++) {
      sim.update(params, 800, 600, () => 0.5, mockPalettes);
    }

    expect(sim.circles.length).toBeGreaterThan(0);
    const parentPrimaryHex = "#551a28";
    for (const circle of sim.circles) {
      expect(circle.colorData.hex.toLowerCase()).not.toBe(
        parentPrimaryHex,
      );
    }
  });

  it("grows parent circle gradually and shrinks when child circle exits parent boundary", () => {
    const sim = new DeflatingSphereSimulation();
    const params = createParams({
      centerRadius: 100,
      enableOrganicParentGrowth: true,
      parentGrowthRate: 0.5,
      emissionIntervalFrames: 5,
      deflationShrinkFactor: 0.5,
      initialVelocity: 15.0, // High velocity so it exits boundary quickly
    });

    // Frame 1: parent radius starts expanding
    const statsFrame1 = sim.update(
      params,
      800,
      600,
      () => 0.5,
      mockPalettes,
    );
    expect(statsFrame1.currentParentRadius).toBeGreaterThan(100);

    // Run until emission occurs (frame 5)
    for (let i = 2; i <= 5; i++) {
      sim.update(params, 800, 600, () => 0.5, mockPalettes);
    }
    expect(sim.circles.length).toBe(1);

    // Before crossing boundary, hasTriggeredParentDeflation is false
    const child = sim.circles[0];
    // Run simulation frames until child reaches boundary and triggers deflation
    let triggered = false;
    for (let frame = 0; frame < 20; frame++) {
      sim.update(params, 800, 600, () => 0.5, mockPalettes);
      if (child.hasTriggeredParentDeflation) {
        triggered = true;
        break;
      }
    }
    expect(triggered).toBe(true);
    // When deflation triggers, parentShrinkVelocity is negative (contracting)
    expect(sim.parentShrinkVelocity).toBeLessThan(0);
  });

  it("maintains steady base radius when organic growth is disabled", () => {
    const sim = new DeflatingSphereSimulation();
    const params = createParams({
      centerRadius: 100,
      enableOrganicParentGrowth: false,
      emissionIntervalFrames: 10,
    });

    for (let i = 0; i < 5; i++) {
      const stats = sim.update(params, 800, 600, () => 0.5, mockPalettes);
      expect(stats.currentParentRadius).toBe(100);
    }
  });

  it("scales deflation duration with deflationDurationFactor", () => {
    const simFast = new DeflatingSphereSimulation();
    const simSlow = new DeflatingSphereSimulation();

    const fastParams = createParams({
      deflationDurationFactor: 0.5,
      emissionIntervalFrames: 5,
      initialVelocity: 25.0,
    });
    const slowParams = createParams({
      deflationDurationFactor: 2.0,
      emissionIntervalFrames: 5,
      initialVelocity: 25.0,
    });

    // Run until emission and boundary crossing
    for (let i = 0; i < 15; i++) {
      simFast.update(fastParams, 800, 600, () => 0.5, mockPalettes);
      simSlow.update(slowParams, 800, 600, () => 0.5, mockPalettes);
    }

    // After emission, advance 10 frames and check recovery speed
    for (let i = 0; i < 10; i++) {
      simFast.update(fastParams, 800, 600, () => 0.5, mockPalettes);
      simSlow.update(slowParams, 800, 600, () => 0.5, mockPalettes);
    }

    // Faster duration recovers closer to 0 than slower duration
    expect(Math.abs(simFast.parentShrinkOffset)).toBeLessThan(
      Math.abs(simSlow.parentShrinkOffset),
    );
  });
});
