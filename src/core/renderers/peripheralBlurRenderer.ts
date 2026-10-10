import type p5 from "p5";

let cachedBlurCanvas: HTMLCanvasElement | null = null;
let cachedWidth = 0;
let cachedHeight = 0;

function getBlurCanvas(width: number, height: number): HTMLCanvasElement {
  if (
    cachedBlurCanvas &&
    cachedWidth === width &&
    cachedHeight === height
  ) {
    return cachedBlurCanvas;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  cachedBlurCanvas = canvas;
  cachedWidth = width;
  cachedHeight = height;
  return canvas;
}

/**
 * 画面中央の鮮明さを維持しながら周辺領域を滑らかにぼかす効果を描画
 */
export function renderPeripheralBlurOverlay(
  _p5Instance: p5,
  targetBuffer: p5 | p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  blurAmount: number,
  clearRadius: number,
): void {
  if (blurAmount <= 0.5 || clearRadius >= 0.98) return;

  const rawGraphics = targetBuffer as unknown as {
    drawingContext?: CanvasRenderingContext2D;
    canvas?: HTMLCanvasElement;
    elt?: HTMLCanvasElement;
  };
  const srcCanvas = rawGraphics.canvas || rawGraphics.elt;
  const ctx = rawGraphics.drawingContext || srcCanvas?.getContext("2d");

  if (!ctx || !srcCanvas) return;

  const blurCanvas = getBlurCanvas(canvasWidth, canvasHeight);
  const blurCtx = blurCanvas.getContext("2d");
  if (!blurCtx) return;

  const roundedBlur = Math.max(1, Math.round(blurAmount));
  const overshoot = roundedBlur * 2;

  // 1. オフスクリーンキャンバスに周辺クリッピングを防ぎつつぼかしを描画
  blurCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  blurCtx.filter = `blur(${roundedBlur}px)`;
  blurCtx.drawImage(
    srcCanvas,
    -overshoot,
    -overshoot,
    canvasWidth + overshoot * 2,
    canvasHeight + overshoot * 2,
  );
  blurCtx.filter = "none";

  // 2. 放射状グラデーションマスクを中心が透明・周辺が不透明になるよう適用
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  const maxR = Math.hypot(cx, cy);
  const clampedClearRadius = Math.max(0.05, Math.min(0.95, clearRadius));
  const innerR = maxR * clampedClearRadius * 0.7;

  blurCtx.globalCompositeOperation = "destination-in";
  const maskGrad = blurCtx.createRadialGradient(
    cx,
    cy,
    innerR,
    cx,
    cy,
    maxR,
  );
  maskGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  maskGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.45)");
  maskGrad.addColorStop(1, "rgba(0, 0, 0, 1)");

  blurCtx.fillStyle = maskGrad;
  blurCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  blurCtx.globalCompositeOperation = "source-over";

  // 3. 元のバッファにマスクされたぼかしを合成
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(blurCanvas, 0, 0);
  ctx.restore();
}
