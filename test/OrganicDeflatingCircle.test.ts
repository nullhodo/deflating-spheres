import { describe, expect, it } from "vitest";
import { OrganicDeflatingCircle } from "../src/core/sketch/OrganicDeflatingCircle";
import type { SketchParameters } from "../src/types/sketch";

const createMockParams = (
  overrides?: Partial<SketchParameters>,
): SketchParameters => {
  return {
    canvasAspectRatio: 1,
    canvasPadding: 40,
    backgroundColor: "#121316",
    primaryColor: "#38bdf8",
    secondaryColor: "#818cf8",
    accentColor: "#f43f5e",
    paletteIndex: 0,
    paletteShuffledColors: null,
    randomSeedValue: 12345,
    centerRadius: 110,
    pulseIntensity: 0,
    pulseSpeed: 0.045,
    emissionIntervalFrames: 60,
    emissionJitterFactor: 0.35,
    initialVelocity: 5.0,
    deflationRate: 0.02,
    wanderStrength: 1.0,
    harmonicFrequency: 0.035,
    smoothingFactor: 0.9,
    trailHistoryLength: 10,
    circleOpacity: 1.0,
    distinctChildColor: true,
    enableOrganicParentGrowth: true,
    parentGrowthRate: 0.25,
    deflationShrinkFactor: 0.45,
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
    backgroundColorIndex: 0,
    manualBackgroundColor: "#121316",
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

describe("OrganicDeflatingCircle", () => {
  it("initializes properties properly", () => {
    const circle = new OrganicDeflatingCircle(
      100,
      200,
      50,
      0, // angle 0 => velocity along X axis
      5.0,
      { name: "Cyan", hex: "#00ffff", rgb: [0, 255, 255] },
    );

    expect(circle.currentPositionX).toBe(100);
    expect(circle.currentPositionY).toBe(200);
    expect(circle.startRadius).toBe(50);
    expect(circle.currentRadius).toBe(50);
    expect(circle.currentVelocityX).toBeCloseTo(5.0);
    expect(circle.currentVelocityY).toBeCloseTo(0.0);
    expect(circle.isDeflated).toBe(false);
    expect(circle.positionHistory.length).toBe(0);
  });

  it("shrinks radius on each simulation update", () => {
    const params = createMockParams({ deflationRate: 0.1 }); // 10% shrink
    const circle = new OrganicDeflatingCircle(0, 0, 100, 0, 2.0, {
      name: "Test",
      hex: "#ffffff",
      rgb: [255, 255, 255],
    });

    circle.updateSimulationState(params, () => 0.5);
    expect(circle.currentRadius).toBeCloseTo(90);
    expect(circle.positionHistory.length).toBe(1);
    expect(circle.isDeflated).toBe(false);
  });

  it("marks as deflated when radius falls below 1.2", () => {
    const params = createMockParams({ deflationRate: 0.5 });
    const circle = new OrganicDeflatingCircle(0, 0, 2.0, 0, 1.0, {
      name: "Test",
      hex: "#ffffff",
      rgb: [255, 255, 255],
    });

    // 2.0 * 0.5 = 1.0 (< 1.2)
    circle.updateSimulationState(params, () => 0.5);
    expect(circle.isDeflated).toBe(true);
  });

  it("respects trailHistoryLength constraint", () => {
    const params = createMockParams({
      deflationRate: 0.001,
      trailHistoryLength: 5,
    });
    const circle = new OrganicDeflatingCircle(0, 0, 100, 0, 1.0, {
      name: "Test",
      hex: "#ffffff",
      rgb: [255, 255, 255],
    });

    for (let i = 0; i < 20; i++) {
      circle.updateSimulationState(params, () => 0.5);
    }

    expect(circle.positionHistory.length).toBe(5);
  });
});
