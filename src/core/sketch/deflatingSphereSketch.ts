import type p5 from "p5";
import type { Palette, SketchParameters } from "../../types/sketch";
import { getAvailableObjectColors } from "../../utils/colorUtils";
import { OrganicDeflatingCircle } from "./OrganicDeflatingCircle";

interface SimulationStats {
  activeCount: number;
  currentParentRadius: number;
}

export class DeflatingSphereSimulation {
  public circles: OrganicDeflatingCircle[] = [];
  public parentPulsePhase = 0;
  public frameEmissionCounter = 0;
  public nextEmissionTargetFrames = 60;
  public globalSimulationTime = 0;

  public reset(): void {
    this.circles = [];
    this.parentPulsePhase = 0;
    this.frameEmissionCounter = 0;
    this.nextEmissionTargetFrames = 60;
    this.globalSimulationTime = 0;
  }

  /**
   * 1フレームのシミュレーション更新
   */
  public update(
    params: SketchParameters,
    width: number,
    height: number,
    noiseFn: (x: number, y: number, z: number) => number,
    palettes: Palette[],
  ): SimulationStats {
    this.globalSimulationTime += 0.016;

    const centerX = width / 2;
    const centerY = height / 2;

    // 呼吸・脈動エフェクト
    let currentParentRadius = params.centerRadius;
    if (params.enableBreathingPulse) {
      this.parentPulsePhase += params.pulseSpeed;
      const dynamicPulseOffset =
        Math.sin(this.parentPulsePhase) * params.pulseIntensity;
      currentParentRadius = Math.max(
        10,
        params.centerRadius + dynamicPulseOffset,
      );
    }

    // 子円の定期生成 (ゆらぎ付き)
    this.frameEmissionCounter++;
    if (this.frameEmissionCounter >= this.nextEmissionTargetFrames) {
      this.frameEmissionCounter = 0;
      this.emitNewCircle(
        centerX,
        centerY,
        currentParentRadius,
        params,
        palettes,
      );

      const jitterOffsetRatio =
        (Math.random() * 2 - 1) * params.emissionJitterFactor;
      const randomizedInterval =
        params.emissionIntervalFrames * (1.0 + jitterOffsetRatio);
      this.nextEmissionTargetFrames = Math.max(
        3,
        Math.round(randomizedInterval),
      );
    }

    // 子円の物理更新 & 寿命判定
    for (let i = this.circles.length - 1; i >= 0; i--) {
      const circle = this.circles[i];
      circle.updateSimulationState(params, noiseFn);

      const isOutOfBounds =
        circle.currentPositionX < -150 ||
        circle.currentPositionX > width + 150 ||
        circle.currentPositionY < -150 ||
        circle.currentPositionY > height + 150;

      if (circle.isDeflated || isOutOfBounds) {
        this.circles.splice(i, 1);
      }
    }

    return {
      activeCount: this.circles.length,
      currentParentRadius,
    };
  }

  /**
   * 新しい風船円を放出
   */
  private emitNewCircle(
    centerX: number,
    centerY: number,
    radius: number,
    params: SketchParameters,
    palettes: Palette[],
  ): void {
    const randomAngle = Math.random() * Math.PI * 2;
    const candidateColors = getAvailableObjectColors(params, palettes);
    const chosenColor = candidateColors[
      Math.floor(Math.random() * candidateColors.length)
    ] || {
      name: "Default",
      hex: "#38bdf8",
      rgb: [56, 189, 248],
    };

    const newCircle = new OrganicDeflatingCircle(
      centerX,
      centerY,
      radius,
      randomAngle,
      params.initialVelocity,
      chosenColor,
    );

    this.circles.push(newCircle);
  }

  /**
   * メイン描画処理
   */
  public render(
    target: p5 | p5.Graphics,
    width: number,
    height: number,
    params: SketchParameters,
    palettes: Palette[],
    scaleMultiplier = 1.0,
    currentParentRadius?: number,
  ): void {
    const centerX = (width * scaleMultiplier) / 2;
    const centerY = (height * scaleMultiplier) / 2;

    const parentRadius =
      currentParentRadius ??
      (params.enableBreathingPulse
        ? Math.max(
            10,
            params.centerRadius +
              Math.sin(this.parentPulsePhase) * params.pulseIntensity,
          )
        : params.centerRadius);

    // 子円の描画
    for (const circle of this.circles) {
      circle.renderToTarget(target, params, scaleMultiplier);
    }

    // 中央の母体円を描画
    this.renderCentralParentCircle(
      target,
      centerX,
      centerY,
      parentRadius * scaleMultiplier,
      params,
      palettes,
      scaleMultiplier,
    );
  }

  /**
   * 中央の母体親円を描画
   */
  public renderCentralParentCircle(
    target: p5 | p5.Graphics,
    positionX: number,
    positionY: number,
    radius: number,
    params: SketchParameters,
    palettes: Palette[],
    scaleMultiplier = 1.0,
  ): void {
    target.push();
    const availableColors = getAvailableObjectColors(params, palettes);
    const primaryColor = availableColors[0] || {
      name: "Default",
      hex: "#dcdce6",
      rgb: [220, 220, 230],
    };
    const rgbValues = primaryColor.rgb;
    const red = rgbValues[0];
    const green = rgbValues[1];
    const blue = rgbValues[2];
    const opacity = params.circleOpacity;

    // 1. ボケ光量・グローエフェクト (Opt-in)
    if (params.enableGlowBokeh) {
      target.noStroke();
      target.fill(red, green, blue, 20 * opacity);
      target.circle(
        positionX,
        positionY,
        (radius + 32 * scaleMultiplier) * 2,
      );
      target.fill(red, green, blue, 45 * opacity);
      target.circle(
        positionX,
        positionY,
        (radius + 16 * scaleMultiplier) * 2,
      );
    }

    // 2. 親円本体 (ソリッド完全塗り)
    target.noStroke();
    target.fill(red, green, blue, Math.round(255 * opacity));
    target.circle(positionX, positionY, radius * 2);

    // 3. 反射ハイライトエフェクト (Opt-in)
    if (params.enableReflectionHighlight) {
      target.fill(255, 255, 255, 110 * opacity);
      target.circle(
        positionX - radius * 0.3,
        positionY - radius * 0.3,
        radius * 0.65,
      );
    }

    // 4. 外周輪郭線 (Opt-in)
    if (params.enableBorderOutline) {
      target.noFill();
      target.stroke(255, 255, 255, 180 * opacity);
      target.strokeWeight(2.5 * scaleMultiplier);
      target.circle(positionX, positionY, radius * 2);
    }

    // 5. コアシンボルドット (Opt-in)
    if (params.enableCenterCoreDot) {
      target.fill(255, 255, 255, 220 * opacity);
      target.noStroke();
      target.circle(positionX, positionY, 6 * scaleMultiplier);
    }

    target.pop();
  }
}
