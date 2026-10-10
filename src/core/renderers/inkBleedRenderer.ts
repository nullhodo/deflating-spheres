import type p5 from "p5";
import { getStaticNoise } from "../../utils/noiseUtils";

export function renderInkBleedOverlay(
  _p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  bleedAmount: number,
  roughness: number,
): void {
  if (bleedAmount <= 0) return;

  targetBuffer.push();

  const srcCanvas =
    (targetBuffer as unknown as { canvas?: HTMLCanvasElement }).canvas ||
    (targetBuffer as unknown as { elt?: HTMLCanvasElement }).elt;

  const ctx =
    (
      targetBuffer as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      }
    ).drawingContext ||
    (srcCanvas?.getContext("2d") ?? null);

  if (ctx && srcCanvas) {
    const srcCtx = srcCanvas.getContext("2d");
    if (!srcCtx) {
      targetBuffer.pop();
      return;
    }

    const offCanvas = document.createElement("canvas");
    offCanvas.width = canvasWidth;
    offCanvas.height = canvasHeight;
    const offCtx = offCanvas.getContext("2d");

    if (offCtx) {
      offCtx.save();
      const filterRadius = Math.max(1, bleedAmount * 0.8);
      offCtx.filter = `blur(${filterRadius}px)`;
      offCtx.drawImage(srcCanvas, 0, 0);
      offCtx.restore();

      const steps = 8;
      const radius = Math.max(1, bleedAmount * 1.2);

      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = Math.min(0.75, 0.25 + roughness * 0.5);

      for (let i = 0; i < steps; i++) {
        const angle = (i * Math.PI * 2) / steps;
        const noiseFactor = getStaticNoise(
          i * 10,
          Math.floor(roughness * 100),
        );
        const dist = radius * (0.4 + noiseFactor * 0.8);
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;

        ctx.drawImage(offCanvas, dx, dy);
      }

      ctx.restore();
    }
  }

  targetBuffer.pop();
}
