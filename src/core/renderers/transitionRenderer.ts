import type p5 from "p5";
import type { TransitionType } from "../../types/sketch";

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

export function renderTransition(
  targetGraphics: p5 | p5.Graphics,
  prevBuffer: p5.Graphics,
  currentBuffer: p5.Graphics,
  progress: number,
  type: TransitionType,
): void {
  const width = targetGraphics.width;
  const height = targetGraphics.height;
  const p = Math.max(0, Math.min(1, progress));

  if (type === "none" || p >= 1.0) {
    targetGraphics.image(currentBuffer, 0, 0);
    return;
  }

  const eased = easeInOutCubic(p);

  targetGraphics.push();

  switch (type) {
    case "fade": {
      targetGraphics.image(currentBuffer, 0, 0);
      targetGraphics.tint(255, 255 * (1 - eased));
      targetGraphics.image(prevBuffer, 0, 0);
      targetGraphics.noTint();
      break;
    }

    case "slide": {
      const offsetX = width * eased;
      targetGraphics.image(prevBuffer, -offsetX, 0);
      targetGraphics.image(currentBuffer, width - offsetX, 0);
      break;
    }

    case "zoom": {
      targetGraphics.image(currentBuffer, 0, 0);
      targetGraphics.push();
      const centerAlign = (
        "CENTER" in targetGraphics ? targetGraphics.CENTER : "center"
      ) as p5.IMAGE_MODE;
      targetGraphics.imageMode(centerAlign);
      targetGraphics.translate(width / 2, height / 2);
      const scaleFactor = 1 + eased * 0.35;
      targetGraphics.scale(scaleFactor);
      targetGraphics.tint(255, 255 * (1 - eased));
      targetGraphics.image(prevBuffer, 0, 0);
      targetGraphics.pop();
      break;
    }

    case "wipe": {
      targetGraphics.image(prevBuffer, 0, 0);
      const maxRadius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
      const currentRadius = maxRadius * eased;

      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      if (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, currentRadius, 0, Math.PI * 2);
        ctx.clip();
        targetGraphics.image(currentBuffer, 0, 0);
        ctx.restore();
      } else {
        targetGraphics.tint(255, 255 * eased);
        targetGraphics.image(currentBuffer, 0, 0);
        targetGraphics.noTint();
      }
      break;
    }

    case "swipeHorizontal": {
      const splitX = width * eased;
      targetGraphics.image(prevBuffer, 0, 0);

      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      if (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, height);
        ctx.clip();
        targetGraphics.image(currentBuffer, 0, 0);
        ctx.restore();
      } else {
        targetGraphics.image(currentBuffer, 0, 0);
      }
      break;
    }

    case "swipeVertical": {
      const splitY = height * eased;
      targetGraphics.image(prevBuffer, 0, 0);

      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      if (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, splitY);
        ctx.clip();
        targetGraphics.image(currentBuffer, 0, 0);
        ctx.restore();
      } else {
        targetGraphics.image(currentBuffer, 0, 0);
      }
      break;
    }

    case "cubeHorizontal": {
      const prevCanvas =
        (prevBuffer as unknown as { canvas?: HTMLCanvasElement }).canvas ||
        (prevBuffer as unknown as { elt?: HTMLCanvasElement }).elt;
      const curCanvas =
        (currentBuffer as unknown as { canvas?: HTMLCanvasElement })
          .canvas ||
        (currentBuffer as unknown as { elt?: HTMLCanvasElement }).elt;

      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      if (ctx && prevCanvas && curCanvas) {
        ctx.save();
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, width, height);

        const angle = eased * (Math.PI / 2);
        const wOld = width * Math.cos(angle);
        const wNew = width * Math.sin(angle);

        ctx.save();
        ctx.translate(0, 0);
        ctx.drawImage(prevCanvas, 0, 0, width, height, 0, 0, wOld, height);
        ctx.fillStyle = `rgba(0,0,0,${eased * 0.6})`;
        ctx.fillRect(0, 0, wOld, height);
        ctx.restore();

        ctx.save();
        ctx.translate(wOld, 0);
        ctx.drawImage(curCanvas, 0, 0, width, height, 0, 0, wNew, height);
        ctx.fillStyle = `rgba(0,0,0,${(1 - eased) * 0.6})`;
        ctx.fillRect(0, 0, wNew, height);
        ctx.restore();

        ctx.restore();
      } else {
        targetGraphics.image(currentBuffer, 0, 0);
      }
      break;
    }

    case "cubeVertical": {
      const prevCanvas =
        (prevBuffer as unknown as { canvas?: HTMLCanvasElement }).canvas ||
        (prevBuffer as unknown as { elt?: HTMLCanvasElement }).elt;
      const curCanvas =
        (currentBuffer as unknown as { canvas?: HTMLCanvasElement })
          .canvas ||
        (currentBuffer as unknown as { elt?: HTMLCanvasElement }).elt;

      const rawGraphics = targetGraphics as unknown as {
        drawingContext?: CanvasRenderingContext2D;
      };
      const ctx = rawGraphics.drawingContext;

      if (ctx && prevCanvas && curCanvas) {
        ctx.save();
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, width, height);

        const angle = eased * (Math.PI / 2);
        const hOld = height * Math.cos(angle);
        const hNew = height * Math.sin(angle);

        ctx.save();
        ctx.translate(0, 0);
        ctx.drawImage(prevCanvas, 0, 0, width, height, 0, 0, width, hOld);
        ctx.fillStyle = `rgba(0,0,0,${eased * 0.6})`;
        ctx.fillRect(0, 0, width, hOld);
        ctx.restore();

        ctx.save();
        ctx.translate(0, hOld);
        ctx.drawImage(curCanvas, 0, 0, width, height, 0, 0, width, hNew);
        ctx.fillStyle = `rgba(0,0,0,${(1 - eased) * 0.6})`;
        ctx.fillRect(0, 0, width, hNew);
        ctx.restore();

        ctx.restore();
      } else {
        targetGraphics.image(currentBuffer, 0, 0);
      }
      break;
    }

    default:
      targetGraphics.image(currentBuffer, 0, 0);
      break;
  }

  targetGraphics.pop();
}
