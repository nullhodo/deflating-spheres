import type p5 from "p5";

/**
 * 画面外周・四隅に向かって滑らかに減光するビネット効果を描画
 */
export function renderVignetteOverlay(
  _p5Instance: p5,
  targetBuffer: p5 | p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  intensity: number,
  radius: number,
): void {
  if (intensity <= 0.001 || radius <= 0) return;

  const rawGraphics = targetBuffer as unknown as {
    drawingContext?: CanvasRenderingContext2D;
    canvas?: HTMLCanvasElement;
    elt?: HTMLCanvasElement;
  };
  const ctx =
    rawGraphics.drawingContext ||
    rawGraphics.canvas?.getContext("2d") ||
    rawGraphics.elt?.getContext("2d");

  if (!ctx) return;

  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  const maxR = Math.hypot(cx, cy);
  const clampedRadius = Math.max(0.05, Math.min(0.95, radius));
  const innerR = maxR * clampedRadius * 0.7;

  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, maxR);
  const clampedIntensity = Math.max(0, Math.min(1.0, intensity));

  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(
    0.5,
    `rgba(0, 0, 0, ${(clampedIntensity * 0.28).toFixed(3)})`,
  );
  grad.addColorStop(1, `rgba(0, 0, 0, ${clampedIntensity.toFixed(3)})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
}
