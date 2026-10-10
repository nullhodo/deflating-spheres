import { describe, expect, it } from "vitest";
import { DeflatingSphereSimulation } from "../src/core/sketch/deflatingSphereSketch";
import type { Palette, SketchParameters } from "../src/types/sketch";

const mockPalettes: Palette[] = [
  {
    title: "Default",
    comment: "Default palette",
    colors: [
      { name: "White", hex: "#ffffff", rgb: [255, 255, 255] },
      { name: "Black", hex: "#000000", rgb: [0, 0, 0] },
    ],
  },
];

const createParams = (
  overrides?: Partial<SketchParameters>,
): SketchParameters => ({
  canvasAspectRatio: 1,
  canvasPadding: 0,
  backgroundColor: "#000000",
  primaryColor: "#ffffff",
  secondaryColor: "#ffffff",
  accentColor: "#ffffff",
  paletteIndex: 0,
  paletteShuffledColors: null,
  randomSeedValue: 12345,
  centerRadius: 100,
  pulseIntensity: 0,
  pulseSpeed: 0,
  emissionIntervalFrames: 10,
  emissionJitterFactor: 0,
  initialVelocity: 5.0,
  deflationRate: 0.01,
  wanderStrength: 0,
  harmonicFrequency: 0,
  smoothingFactor: 1,
  trailHistoryLength: 30,
  circleOpacity: 1.0,
  distinctChildColor: true,
  enableOrganicParentGrowth: false,
  parentGrowthRate: 0,
  deflationShrinkFactor: 0,
  deflationDurationFactor: 1.0,
  deflationTriggerTiming: 0.7,
  enableBreathingPulse: false,
  enableReflectionHighlight: false,
  enableGlowBokeh: false,
  enableBorderOutline: false,
  enableCenterCoreDot: false,
  useSingleColorMode: false,
  singleColorValue: "#ffffff",
  useGradientTheme: false,
  gradientBaseColor: "#ffffff",
  backgroundColorIndex: -1,
  manualBackgroundColor: "#000000",
  shapeCount: 16,
  shapeSize: 60,
  shapeComplexity: 6,
  animationSpeed: 1,
  shapeType: "circle",
  transitionType: "none",
  transitionDurationMs: 0,
  showGrain: false,
  grainIntensity: 0,
  showRiso: false,
  risoOffsetPx: 0,
  risoIntensity: 0,
  showHalftone: false,
  halftoneSize: 0,
  halftoneAngle: 0,
  showDithering: false,
  ditheringScale: 0,
  ditheringLevels: 0,
  showInkBleed: false,
  inkBleedAmount: 0,
  inkBleedRoughness: 0,
  showPaperTexture: false,
  paperRoughness: 0,
  paperColorDensity: 0,
  showCmyk: false,
  cmykOffsetFactor: 0,
  cmykIntensity: 0,
  showVignette: false,
  vignetteIntensity: 0,
  vignetteRadius: 0,
  showPeripheralBlur: false,
  peripheralBlurAmount: 0,
  peripheralBlurRadius: 0,
  debugMode: false,
  enableColorMixingSystem: true,
  colorMixingMode: "rgb_additive",
  colorRechargeSpeed: 0.008,
  ...overrides,
});

interface SimulationInternals {
  parentCurrentRgb: [number, number, number];
  parentCurrentCmy: [number, number, number];
  circles: { colorData: { rgb: [number, number, number] } }[];
}

describe("Color Mixing Center Pixel Tracking Test", () => {
  it("strictly preserves center composite color across emission frames with zero flicker (RGB additive)", () => {
    const sim = new DeflatingSphereSimulation();
    const simInternal = sim as unknown as SimulationInternals;
    const params = createParams({ colorMixingMode: "rgb_additive" });

    for (let f = 1; f <= 50; f++) {
      const parentBefore = [...simInternal.parentCurrentRgb];
      const circlesBefore = simInternal.circles.length;

      sim.update(params, 800, 800, () => 0.5, mockPalettes);

      const parentAfter = [...simInternal.parentCurrentRgb];
      const circlesAfter = simInternal.circles.length;
      const justEmitted = circlesAfter > circlesBefore;

      if (justEmitted) {
        const latestChild =
          simInternal.circles[simInternal.circles.length - 1];
        const childColor = latestChild.colorData.rgb;

        // 親円(新) + 子円 の中心重なり領域の色 (光の加算合成)
        const composite = [
          parentAfter[0] + childColor[0],
          parentAfter[1] + childColor[1],
          parentAfter[2] + childColor[2],
        ];

        // 放出直前の親円の色と、放出瞬間の合成色(親円+子円)の差分を検証
        // リチャージによる微小増加(1フレームあたり最大2)を除き、差が2未満(完全一致)であることを検証
        const diffR = Math.abs(composite[0] - parentBefore[0]);
        const diffG = Math.abs(composite[1] - parentBefore[1]);
        const diffB = Math.abs(composite[2] - parentBefore[2]);

        expect(diffR).toBeLessThanOrEqual(2);
        expect(diffG).toBeLessThanOrEqual(2);
        expect(diffB).toBeLessThanOrEqual(2);
      }
    }
  });

  it("strictly preserves multiplicative composite pixel color with custom opacity (CMY subtractive)", () => {
    const sim = new DeflatingSphereSimulation();
    const simInternal = sim as unknown as SimulationInternals;
    const testOpacity = 0.65;
    const params = createParams({
      colorMixingMode: "cmy_subtractive",
      backgroundColor: "#ffffff",
      circleOpacity: testOpacity,
    });

    for (let f = 1; f <= 50; f++) {
      const parentCmyBefore = [...simInternal.parentCurrentCmy];
      const circlesBefore = simInternal.circles.length;

      sim.update(params, 800, 800, () => 0.5, mockPalettes);

      const parentCmyAfter = [...simInternal.parentCurrentCmy];
      const circlesAfter = simInternal.circles.length;
      const justEmitted = circlesAfter > circlesBefore;

      if (justEmitted) {
        const latestChild =
          simInternal.circles[simInternal.circles.length - 1];
        const childColor = latestChild.colorData.rgb;
        const alpha = testOpacity;

        // 親円本体の色
        const parentRBefore = Math.round((1.0 - parentCmyBefore[0]) * 255);
        const parentGBefore = Math.round((1.0 - parentCmyBefore[1]) * 255);
        const parentBBefore = Math.round((1.0 - parentCmyBefore[2]) * 255);

        const parentRAfter = Math.round((1.0 - parentCmyAfter[0]) * 255);
        const parentGAfter = Math.round((1.0 - parentCmyAfter[1]) * 255);
        const parentBAfter = Math.round((1.0 - parentCmyAfter[2]) * 255);

        // 放出直前の画面ピクセル値 (白背景 255 と親円のアルファブレンド)
        const screenRBefore = Math.round(
          (1 - alpha) * 255 + alpha * parentRBefore,
        );
        const screenGBefore = Math.round(
          (1 - alpha) * 255 + alpha * parentGBefore,
        );
        const screenBBefore = Math.round(
          (1 - alpha) * 255 + alpha * parentBBefore,
        );

        // 子円が白背景にアルファ描画された後の実効ピクセル色
        const childEffR = Math.round(
          (1 - alpha) * 255 + alpha * childColor[0],
        );
        const childEffG = Math.round(
          (1 - alpha) * 255 + alpha * childColor[1],
        );
        const childEffB = Math.round(
          (1 - alpha) * 255 + alpha * childColor[2],
        );

        // 親円が multiply でアルファ描画された際の実効乗数
        const parentEffR = Math.round(
          (1 - alpha) * 255 + alpha * parentRAfter,
        );
        const parentEffG = Math.round(
          (1 - alpha) * 255 + alpha * parentGAfter,
        );
        const parentEffB = Math.round(
          (1 - alpha) * 255 + alpha * parentBAfter,
        );

        // 重なり領域の Canvas 2D multiply 合成ピクセル値
        const compositeR = Math.round((childEffR * parentEffR) / 255);
        const compositeG = Math.round((childEffG * parentEffG) / 255);
        const compositeB = Math.round((childEffB * parentEffB) / 255);

        const diffR = Math.abs(compositeR - screenRBefore);
        const diffG = Math.abs(compositeG - screenGBefore);
        const diffB = Math.abs(compositeB - screenBBefore);

        expect(diffR).toBeLessThanOrEqual(2);
        expect(diffG).toBeLessThanOrEqual(2);
        expect(diffB).toBeLessThanOrEqual(2);
      }
    }
  });
});
