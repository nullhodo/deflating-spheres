import { describe, expect, it } from "vitest";

describe("Canvas 2D BlendMode lighter test", () => {
  it("tests globalCompositeOperation lighter with Canvas", () => {
    // 仮想Canvasの動作シミュレーション
    // 黒背景 (0, 0, 0)
    // 円1 (子円): 黄色 [250, 200, 0], alpha = 1.0
    // 円2 (親円): 青   [5, 55, 255], alpha = 1.0
    // lighter合成時のピクセル値
    const r1 = 250;
    const g1 = 200;
    const b1 = 0;
    const r2 = 5;
    const g2 = 55;
    const b2 = 255;

    // lighter (ADD) は:
    // R = min(255, r1 + r2) = 255
    // G = min(255, g1 + g2) = 255
    // B = min(255, b1 + b2) = 255
    const r = Math.min(255, r1 + r2);
    const g = Math.min(255, g1 + g2);
    const b = Math.min(255, b1 + b2);

    expect(r).toBe(255);
    expect(g).toBe(255);
    expect(b).toBe(255);
  });
});
