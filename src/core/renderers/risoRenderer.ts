import type p5 from "p5";
import { getIndexedNoise } from "../../utils/noiseUtils";

export function renderRisoPrintOverlay(
  _p5Instance: p5,
  targetBuffer: p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  offsetPx: number,
  intensity: number,
): void {
  if (offsetPx <= 0 && intensity <= 0) return;

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

  if (ctx && srcCanvas && offsetPx > 0) {
    const srcCtx = srcCanvas.getContext("2d");

    if (srcCtx) {
      const imgData = srcCtx.getImageData(0, 0, canvasWidth, canvasHeight);
      const pixels = imgData.data;

      const redCanvas = document.createElement("canvas");
      redCanvas.width = canvasWidth;
      redCanvas.height = canvasHeight;
      const redCtx = redCanvas.getContext("2d");

      const blueCanvas = document.createElement("canvas");
      blueCanvas.width = canvasWidth;
      blueCanvas.height = canvasHeight;
      const blueCtx = blueCanvas.getContext("2d");

      if (redCtx && blueCtx) {
        const redImg = redCtx.createImageData(canvasWidth, canvasHeight);
        const blueImg = blueCtx.createImageData(canvasWidth, canvasHeight);

        const rData = redImg.data;
        const bData = blueImg.data;

        const bgR = pixels[0];
        const bgG = pixels[1];
        const bgB = pixels[2];

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          const diffR = Math.abs(r - bgR);
          const diffG = Math.abs(g - bgG);
          const diffB = Math.abs(b - bgB);
          const isArtwork = a > 10 && diffR + diffG + diffB > 25;

          if (isArtwork) {
            rData[i] = r;
            rData[i + 1] = Math.floor(g * 0.3);
            rData[i + 2] = Math.floor(b * 0.3);
            rData[i + 3] = Math.floor(a * 0.6);

            bData[i] = Math.floor(r * 0.3);
            bData[i + 1] = Math.floor(g * 0.4);
            bData[i + 2] = b;
            bData[i + 3] = Math.floor(a * 0.6);
          }
        }

        redCtx.putImageData(redImg, 0, 0);
        blueCtx.putImageData(blueImg, 0, 0);

        ctx.save();
        ctx.globalCompositeOperation = "multiply";

        ctx.globalAlpha = 0.85;
        ctx.drawImage(redCanvas, offsetPx * 0.9, -offsetPx * 0.6);

        ctx.globalAlpha = 0.85;
        ctx.drawImage(blueCanvas, -offsetPx * 0.7, offsetPx * 0.8);

        ctx.restore();
      }
    }
  }

  if (intensity > 0) {
    const numDots = Math.floor(
      canvasWidth * canvasHeight * 0.02 * intensity,
    );
    targetBuffer.noStroke();
    targetBuffer.fill(20, 20, 20, Math.min(180, 255 * intensity * 0.5));

    for (let i = 0; i < numDots; i++) {
      const rx = getIndexedNoise(i * 3) * canvasWidth;
      const ry = getIndexedNoise(i * 3 + 1) * canvasHeight;
      const dotRadius = 0.5 + getIndexedNoise(i * 3 + 2) * 1.5;
      targetBuffer.circle(rx, ry, dotRadius);
    }
  }

  targetBuffer.pop();
}
