import type {
  ColorItem,
  Palette,
  SketchParameters,
} from "../types/sketch";

/**
 * 基準色から明度・彩度を変えた調和グラデーションパレット配列を生成する関数
 */
export function generateGradientThemePalette(
  baseHexColor: string,
  totalSteps = 6,
): ColorItem[] {
  const cleanHex = baseHexColor.replace("#", "");
  const redComponent = Number.parseInt(cleanHex.substring(0, 2), 16) || 56;
  const greenComponent =
    Number.parseInt(cleanHex.substring(2, 4), 16) || 189;
  const blueComponent =
    Number.parseInt(cleanHex.substring(4, 6), 16) || 248;

  const generatedColors: ColorItem[] = [];
  for (let stepIndex = 0; stepIndex < totalSteps; stepIndex++) {
    const factor = stepIndex / Math.max(1, totalSteps - 1);
    const adjustedRed = Math.min(
      255,
      Math.max(10, Math.floor(redComponent * (0.35 + factor * 0.9))),
    );
    const adjustedGreen = Math.min(
      255,
      Math.max(10, Math.floor(greenComponent * (0.35 + factor * 0.9))),
    );
    const adjustedBlue = Math.min(
      255,
      Math.max(10, Math.floor(blueComponent * (0.35 + factor * 0.9))),
    );

    const hexString = `#${adjustedRed.toString(16).padStart(2, "0")}${adjustedGreen.toString(16).padStart(2, "0")}${adjustedBlue.toString(16).padStart(2, "0")}`;
    generatedColors.push({
      name: `Shade ${stepIndex + 1}`,
      hex: hexString,
      rgb: [adjustedRed, adjustedGreen, adjustedBlue],
    });
  }
  return generatedColors;
}

/**
 * 現在有効な利用可能カラーパレット配列を取得する関数
 */
export function getCurrentActiveColorList(
  params: SketchParameters,
  palettes: Palette[],
): ColorItem[] {
  if (params.useSingleColorMode) {
    const cleanHex = params.singleColorValue.replace("#", "");
    const redComponent =
      Number.parseInt(cleanHex.substring(0, 2), 16) || 56;
    const greenComponent =
      Number.parseInt(cleanHex.substring(2, 4), 16) || 189;
    const blueComponent =
      Number.parseInt(cleanHex.substring(4, 6), 16) || 248;
    return [
      {
        name: "Single Color",
        hex: params.singleColorValue,
        rgb: [redComponent, greenComponent, blueComponent],
      },
    ];
  }

  if (params.useGradientTheme) {
    return generateGradientThemePalette(params.gradientBaseColor, 6);
  }

  const selectedPalette = palettes[params.paletteIndex];
  if (selectedPalette && selectedPalette.colors.length > 0) {
    return selectedPalette.colors;
  }
  return palettes[0]?.colors || [];
}

/**
 * 現在の有効な背景色コード (HEX) を決定する関数
 */
export function getResolvedBackgroundColorHex(
  params: SketchParameters,
  palettes: Palette[],
): string {
  const colorList = getCurrentActiveColorList(params, palettes);
  const backgroundIndex = params.backgroundColorIndex;
  if (
    backgroundIndex >= 0 &&
    backgroundIndex < colorList.length &&
    colorList[backgroundIndex]
  ) {
    return colorList[backgroundIndex].hex;
  }
  return (
    params.manualBackgroundColor || params.backgroundColor || "#121316"
  );
}

/**
 * 現在の背景色を除外したオブジェクト描画用カラー配列を取得する関数
 */
export function getAvailableObjectColors(
  params: SketchParameters,
  palettes: Palette[],
): ColorItem[] {
  const fullColorList = getCurrentActiveColorList(params, palettes);
  if (params.useSingleColorMode || fullColorList.length <= 1) {
    return fullColorList;
  }

  const currentBackgroundHex = getResolvedBackgroundColorHex(
    params,
    palettes,
  ).toLowerCase();

  const candidateColors = fullColorList.filter((colorItem) => {
    return colorItem.hex.toLowerCase() !== currentBackgroundHex;
  });

  if (candidateColors.length === 0) {
    return fullColorList;
  }
  return candidateColors;
}
