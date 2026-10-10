import { describe, expect, it } from "vitest";
import type { Palette, SketchParameters } from "../src/types/sketch";
import {
  generateGradientThemePalette,
  getAvailableObjectColors,
  getCurrentActiveColorList,
  getResolvedBackgroundColorHex,
} from "../src/utils/colorUtils";

const mockPalettes: Palette[] = [
  {
    title: "Primary Trio",
    comment: "Basic primary colors",
    colors: [
      { name: "Blue", hex: "#0000ff", rgb: [0, 0, 255] },
      { name: "Red", hex: "#ff0000", rgb: [255, 0, 0] },
      { name: "Yellow", hex: "#ffff00", rgb: [255, 255, 0] },
    ],
  },
];

const createMockParams = (
  overrides?: Partial<SketchParameters>,
): SketchParameters => {
  return {
    canvasAspectRatio: 1,
    canvasPadding: 40,
    backgroundColor: "#121316",
    primaryColor: "#0000ff",
    secondaryColor: "#ff0000",
    accentColor: "#ffff00",
    paletteIndex: 0,
    paletteShuffledColors: null,
    randomSeedValue: 12345,
    centerRadius: 110,
    pulseIntensity: 0,
    pulseSpeed: 0.045,
    emissionIntervalFrames: 60,
    emissionJitterFactor: 0.35,
    initialVelocity: 5.7,
    deflationRate: 0.011,
    wanderStrength: 1.2,
    harmonicFrequency: 0.035,
    smoothingFactor: 0.92,
    trailHistoryLength: 32,
    circleOpacity: 1.0,
    distinctChildColor: true,
    enableOrganicParentGrowth: true,
    parentGrowthRate: 0.25,
    deflationShrinkFactor: 0.45,
    deflationDurationFactor: 1.0,
    deflationTriggerTiming: 0.7,
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
    animationSpeed: 1.0,
    shapeType: "circle",
    transitionType: "none",
    transitionDurationMs: 600,
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

describe("colorUtils", () => {
  it("generates correct number of steps for gradient palette", () => {
    const shades = generateGradientThemePalette("#38bdf8", 6);
    expect(shades.length).toBe(6);
    for (const shade of shades) {
      expect(shade.hex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(shade.rgb.length).toBe(3);
    }
  });

  it("handles single color mode in getCurrentActiveColorList", () => {
    const params = createMockParams({
      useSingleColorMode: true,
      singleColorValue: "#ff8800",
    });
    const colors = getCurrentActiveColorList(params, mockPalettes);
    expect(colors.length).toBe(1);
    expect(colors[0].hex).toBe("#ff8800");
  });

  it("handles gradient theme mode in getCurrentActiveColorList", () => {
    const params = createMockParams({
      useGradientTheme: true,
      gradientBaseColor: "#10b981",
    });
    const colors = getCurrentActiveColorList(params, mockPalettes);
    expect(colors.length).toBe(6);
  });

  it("resolves background color correctly from palette index", () => {
    const params = createMockParams({
      paletteIndex: 0,
      backgroundColorIndex: 1, // Red (#ff0000)
    });
    const bgHex = getResolvedBackgroundColorHex(params, mockPalettes);
    expect(bgHex).toBe("#ff0000");
  });

  it("excludes background color from available object colors", () => {
    const params = createMockParams({
      paletteIndex: 0,
      backgroundColorIndex: 0, // Blue (#0000ff)
    });
    const available = getAvailableObjectColors(params, mockPalettes);
    expect(available.some((c) => c.hex.toLowerCase() === "#0000ff")).toBe(
      false,
    );
    expect(available.length).toBe(2);
  });

  it("prioritizes paletteShuffledColors when present", () => {
    const shuffledCustom = [
      {
        name: "Yellow",
        hex: "#ffff00",
        rgb: [255, 255, 0] as [number, number, number],
      },
      {
        name: "Red",
        hex: "#ff0000",
        rgb: [255, 0, 0] as [number, number, number],
      },
      {
        name: "Blue",
        hex: "#0000ff",
        rgb: [0, 0, 255] as [number, number, number],
      },
    ];
    const params = createMockParams({
      paletteIndex: 0,
      paletteShuffledColors: shuffledCustom,
    });
    const colors = getCurrentActiveColorList(params, mockPalettes);
    expect(colors).toEqual(shuffledCustom);
    expect(colors[0].hex).toBe("#ffff00");
  });
});
