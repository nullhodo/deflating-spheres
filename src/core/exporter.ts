import type p5 from "p5";
import { PALETTES } from "../constants/palettes";
import type { RandomTargets, SketchParameters } from "../types/sketch";
import { getResolvedBackgroundColorHex } from "../utils/colorUtils";
import { getFormattedDate } from "../utils/date";
import { renderCmykPrintOverlay } from "./renderers/cmykRenderer";
import { renderDitheringOverlay } from "./renderers/ditheringRenderer";
import { renderGrainOverlay } from "./renderers/grainOverlay";
import { renderHalftoneScreenOverlay } from "./renderers/halftoneRenderer";
import { renderInkBleedOverlay } from "./renderers/inkBleedRenderer";
import { renderPaperTextureOverlay } from "./renderers/paperTextureRenderer";
import { renderPeripheralBlurOverlay } from "./renderers/peripheralBlurRenderer";
import { renderRisoPrintOverlay } from "./renderers/risoRenderer";
import { renderVignetteOverlay } from "./renderers/vignetteRenderer";
import type { DeflatingSphereSimulation } from "./sketch/deflatingSphereSketch";

export interface SketchConfigFile {
  version: string;
  exportedAt: string;
  params: SketchParameters;
  randomTargets?: RandomTargets;
}

/**
 * Exports high-resolution image scaled properly along with JSON config.
 */
export function exportHighResImage(
  p5Instance: p5,
  params: SketchParameters,
  exportWidth = 2880,
  exportHeight = 2880,
  randomTargets?: RandomTargets,
  simulation?: DeflatingSphereSimulation,
): void {
  const timestampString = getFormattedDate();
  const filenameBase = `deflating-spheres_${timestampString}_${exportWidth}x${exportHeight}`;

  const offscreenGraphics = p5Instance.createGraphics(
    exportWidth,
    exportHeight,
  );
  const bgColor = getResolvedBackgroundColorHex(params, PALETTES);
  offscreenGraphics.background(bgColor);

  const currentCanvasWidth = p5Instance.width || 800;
  const scaleFactor = exportWidth / currentCanvasWidth;
  const scaledParams = JSON.parse(
    JSON.stringify(params),
  ) as SketchParameters;

  scaledParams.debugMode = false;

  if (simulation) {
    simulation.render(
      offscreenGraphics,
      exportWidth / scaleFactor,
      exportHeight / scaleFactor,
      scaledParams,
      PALETTES,
      scaleFactor,
    );
  }

  // Apply texture & print effects
  if (params.showGrain) {
    renderGrainOverlay(
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.grainIntensity || 0.15,
    );
  }

  if (params.showCmyk) {
    renderCmykPrintOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.cmykOffsetFactor !== undefined
        ? params.cmykOffsetFactor
        : 0.35,
      params.cmykIntensity !== undefined ? params.cmykIntensity : 0.9,
      bgColor,
    );
  }

  if (params.showRiso) {
    renderRisoPrintOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.risoOffsetPx * scaleFactor,
      params.risoIntensity || 0.7,
    );
  }

  if (params.showHalftone) {
    renderHalftoneScreenOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.halftoneSize * scaleFactor,
      params.halftoneAngle || 45,
    );
  }

  if (params.showDithering) {
    renderDitheringOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.ditheringScale * scaleFactor,
      params.ditheringLevels || 4,
    );
  }

  if (params.showInkBleed) {
    renderInkBleedOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.inkBleedAmount * scaleFactor,
      params.inkBleedRoughness || 0.4,
    );
  }

  if (params.showPaperTexture) {
    renderPaperTextureOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.paperRoughness || 0.25,
      params.paperColorDensity || 0.15,
    );
  }

  if (params.showPeripheralBlur) {
    renderPeripheralBlurOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      (params.peripheralBlurAmount || 6) * scaleFactor,
      params.peripheralBlurRadius !== undefined
        ? params.peripheralBlurRadius
        : 0.4,
    );
  }

  if (params.showVignette) {
    renderVignetteOverlay(
      p5Instance,
      offscreenGraphics,
      exportWidth,
      exportHeight,
      params.vignetteIntensity !== undefined
        ? params.vignetteIntensity
        : 0.45,
      params.vignetteRadius !== undefined ? params.vignetteRadius : 0.5,
    );
  }

  p5Instance.save(offscreenGraphics, `${filenameBase}.png`);
  exportJsonSettings(params, filenameBase, randomTargets);

  try {
    offscreenGraphics.remove();
  } catch {
    // ignore
  }
}

/**
 * Exports vector SVG graphics.
 */
export function exportSvgGraphics(
  p5Instance: p5,
  params: SketchParameters,
  exportWidth = 1920,
  exportHeight = 1920,
  simulation?: DeflatingSphereSimulation,
): void {
  const timestampString = getFormattedDate();
  const filenameBase = `deflating-spheres_${timestampString}_vector`;

  const svgGraphics = p5Instance.createGraphics(
    exportWidth,
    exportHeight,
    // @ts-expect-error p5.SVG constant is provided by p5.js-svg plugin
    p5Instance.SVG,
  );

  const currentCanvasWidth = p5Instance.width || 800;
  const scaleFactor = exportWidth / currentCanvasWidth;
  const scaledParams = JSON.parse(
    JSON.stringify(params),
  ) as SketchParameters;
  scaledParams.debugMode = false;

  const bgColor = getResolvedBackgroundColorHex(params, PALETTES);
  svgGraphics.background(bgColor);

  if (simulation) {
    simulation.render(
      svgGraphics,
      exportWidth / scaleFactor,
      exportHeight / scaleFactor,
      scaledParams,
      PALETTES,
      scaleFactor,
    );
  }

  p5Instance.save(svgGraphics, `${filenameBase}.svg`);

  try {
    svgGraphics.remove();
  } catch {
    // ignore
  }
}

/**
 * Exports JSON configuration file.
 */
export function exportJsonSettings(
  params: SketchParameters,
  customFilename?: string,
  randomTargets?: RandomTargets,
): void {
  const timestampString = getFormattedDate();
  const filename = customFilename
    ? `${customFilename}.json`
    : `deflating-spheres-settings_${timestampString}.json`;

  const configData: SketchConfigFile = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    params,
    randomTargets,
  };

  const jsonString = JSON.stringify(configData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(blob);

  const linkElement = document.createElement("a");
  linkElement.href = downloadUrl;
  linkElement.download = filename;
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  URL.revokeObjectURL(downloadUrl);
}
