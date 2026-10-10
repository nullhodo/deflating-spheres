import type p5 from "p5";
import type { ColorItem, SketchParameters } from "../../types/sketch";

interface PositionRecord {
  positionX: number;
  positionY: number;
  recordedRadius: number;
}

/**
 * 空気が抜けながら有機的な軌跡を描いて縮小する円のクラス
 */
export class OrganicDeflatingCircle {
  public currentPositionX: number;
  public currentPositionY: number;
  public startRadius: number;
  public currentRadius: number;
  public colorData: ColorItem;

  public currentVelocityX: number;
  public currentVelocityY: number;
  public currentHeadingAngle: number;

  public uniqueRandomSeed: number;
  public harmonicPhaseOffset1: number;
  public harmonicPhaseOffset2: number;
  public harmonicFrequencyRatio: number;

  public positionHistory: PositionRecord[];
  public lifespanFrames: number;
  public isDeflated: boolean;
  public isHeadDeflated: boolean;
  public trailFadeAlpha: number;
  public hasTriggeredParentDeflation: boolean;

  constructor(
    spawnPositionX: number,
    spawnPositionY: number,
    startRadius: number,
    launchAngle: number,
    initialSpeed: number,
    colorDefinition: ColorItem,
  ) {
    this.currentPositionX = spawnPositionX;
    this.currentPositionY = spawnPositionY;
    this.startRadius = startRadius;
    this.currentRadius = startRadius;
    this.colorData = colorDefinition;

    this.currentVelocityX = Math.cos(launchAngle) * initialSpeed;
    this.currentVelocityY = Math.sin(launchAngle) * initialSpeed;
    this.currentHeadingAngle = launchAngle;

    this.uniqueRandomSeed = Math.random() * 1000;
    this.harmonicPhaseOffset1 = Math.random() * Math.PI * 2;
    this.harmonicPhaseOffset2 = Math.random() * Math.PI * 2;
    this.harmonicFrequencyRatio = 0.8 + Math.random() * 0.4;

    this.positionHistory = [];
    this.lifespanFrames = 0;
    this.isDeflated = false;
    this.isHeadDeflated = false;
    this.trailFadeAlpha = 1.0;
    this.hasTriggeredParentDeflation = false;
  }

  /**
   * 物理状態および有機的蛇行運動の更新
   */
  public updateSimulationState(
    parameters: SketchParameters,
    noiseFn: (x: number, y: number, z: number) => number = () => 0.5,
  ): void {
    this.lifespanFrames++;

    // フェーズ 2: 円本体（ヘッド）が縮小・消滅した後のトレイル残存・自然消散処理
    if (this.isHeadDeflated) {
      // 尾っぽが流れて消えていくよう、最低限の描画点（2点）を残しながら古い履歴を消化
      const shrinkSteps = Math.max(
        1,
        Math.ceil(this.positionHistory.length * 0.03),
      );
      for (
        let s = 0;
        s < shrinkSteps && this.positionHistory.length > 2;
        s++
      ) {
        this.positionHistory.shift();
      }

      // トレイル透明度を滑らかにフェードアウト
      this.trailFadeAlpha = Math.max(0, this.trailFadeAlpha - 0.02);

      // 透明度が完全にゼロになった時点で安全に完全消滅
      if (this.trailFadeAlpha <= 0.01) {
        this.isDeflated = true;
        this.positionHistory = [];
      }
      return;
    }

    // フェーズ 1: 円本体（ヘッド）の通常の収縮と物理移動
    const shrinkFactor = 1.0 - parameters.deflationRate;
    this.currentRadius *= shrinkFactor;

    // 半径が極小になったら、ヘッド（円本体）のみ消滅させてトレイル消散フェーズへ移行
    if (this.currentRadius < 1.2) {
      this.isHeadDeflated = true;
      this.currentRadius = 0;
      if (
        parameters.enableColorMixingSystem ||
        this.positionHistory.length <= 1
      ) {
        this.isDeflated = true;
      }
      return;
    }

    const harmonicWave =
      Math.sin(
        this.lifespanFrames *
          parameters.harmonicFrequency *
          this.harmonicFrequencyRatio +
          this.harmonicPhaseOffset1,
      ) *
        0.6 +
      Math.sin(
        this.lifespanFrames * parameters.harmonicFrequency * 0.45 +
          this.harmonicPhaseOffset2,
      ) *
        0.4;

    const noiseScale = 0.003;
    const smoothNoiseVal = noiseFn(
      this.currentPositionX * noiseScale,
      this.currentPositionY * noiseScale,
      this.uniqueRandomSeed,
    );
    const smoothNoiseAngle = (smoothNoiseVal - 0.5) * 2.0;

    const steeringAngleDelta =
      (harmonicWave * 0.7 + smoothNoiseAngle * 0.3) *
      (parameters.wanderStrength * 0.075);
    this.currentHeadingAngle += steeringAngleDelta;

    const currentSpeedMagnitude = Math.sqrt(
      this.currentVelocityX * this.currentVelocityX +
        this.currentVelocityY * this.currentVelocityY,
    );
    const targetSpeed = Math.max(0.8, currentSpeedMagnitude * 0.998);

    const targetVelocityX =
      Math.cos(this.currentHeadingAngle) * targetSpeed;
    const targetVelocityY =
      Math.sin(this.currentHeadingAngle) * targetSpeed;

    const smoothingAlpha = 1.0 - parameters.smoothingFactor;
    this.currentVelocityX +=
      (targetVelocityX - this.currentVelocityX) * smoothingAlpha;
    this.currentVelocityY +=
      (targetVelocityY - this.currentVelocityY) * smoothingAlpha;

    this.currentPositionX += this.currentVelocityX;
    this.currentPositionY += this.currentVelocityY;

    this.positionHistory.push({
      positionX: this.currentPositionX,
      positionY: this.currentPositionY,
      recordedRadius: this.currentRadius,
    });

    if (this.positionHistory.length > parameters.trailHistoryLength) {
      this.positionHistory.shift();
    }
  }

  /**
   * 描画関数
   */
  public renderToTarget(
    target: p5 | p5.Graphics,
    parameters: SketchParameters,
    scaleMultiplier = 1.0,
  ): void {
    if (this.positionHistory.length === 0) return;

    const rgbValues = this.colorData.rgb || [120, 180, 240];
    const redComponent = rgbValues[0];
    const greenComponent = rgbValues[1];
    const blueComponent = rgbValues[2];
    const opacityMultiplier = parameters.circleOpacity;

    // 1. 軌跡ラインの描画 (トレイルが自然にフェードアウトして消散)
    // 三原色モード時は軌跡を描画せず、すっきりと円本体のみを描画
    if (
      !parameters.enableColorMixingSystem &&
      this.positionHistory.length > 1 &&
      this.trailFadeAlpha > 0.01
    ) {
      target.noFill();
      for (
        let historyIndex = 1;
        historyIndex < this.positionHistory.length;
        historyIndex++
      ) {
        const previousPoint = this.positionHistory[historyIndex - 1];
        const currentPoint = this.positionHistory[historyIndex];
        const progressRatio = historyIndex / this.positionHistory.length;

        target.stroke(
          redComponent,
          greenComponent,
          blueComponent,
          progressRatio * 140 * opacityMultiplier * this.trailFadeAlpha,
        );
        target.strokeWeight(
          Math.max(
            1,
            previousPoint.recordedRadius *
              0.35 *
              scaleMultiplier *
              progressRatio,
          ),
        );
        target.line(
          previousPoint.positionX * scaleMultiplier,
          previousPoint.positionY * scaleMultiplier,
          currentPoint.positionX * scaleMultiplier,
          currentPoint.positionY * scaleMultiplier,
        );
      }
    }

    const drawPositionX = this.currentPositionX * scaleMultiplier;
    const drawPositionY = this.currentPositionY * scaleMultiplier;

    // 2. 円本体（ヘッド）の描画（ヘッドが健在な間のみ描画）
    if (!this.isHeadDeflated && this.currentRadius > 0.5) {
      const drawRadius = this.currentRadius * scaleMultiplier;

      // ボケ光量・グローエフェクト (Opt-in)
      if (parameters.enableGlowBokeh) {
        target.noStroke();
        target.fill(
          redComponent,
          greenComponent,
          blueComponent,
          24 * opacityMultiplier,
        );
        target.circle(
          drawPositionX,
          drawPositionY,
          (drawRadius + 14 * scaleMultiplier) * 2,
        );
      }

      // 風船（円本体）のソリッド描画
      target.noStroke();
      target.fill(
        redComponent,
        greenComponent,
        blueComponent,
        Math.round(255 * opacityMultiplier),
      );
      target.circle(drawPositionX, drawPositionY, drawRadius * 2);

      // 反射ハイライトエフェクト (Opt-in)
      if (parameters.enableReflectionHighlight) {
        target.fill(255, 255, 255, 95 * opacityMultiplier);
        target.circle(
          drawPositionX - drawRadius * 0.28,
          drawPositionY - drawRadius * 0.28,
          drawRadius * 0.5,
        );
      }

      // 外周輪郭線 (Opt-in)
      if (parameters.enableBorderOutline) {
        target.noFill();
        target.stroke(255, 255, 255, 160 * opacityMultiplier);
        target.strokeWeight(Math.max(1, 1.5 * scaleMultiplier));
        target.circle(drawPositionX, drawPositionY, drawRadius * 2);
      }
    }

    // 6. デバッグ表示
    if (parameters.debugMode && !this.isHeadDeflated) {
      target.stroke(255, 60, 60, 200);
      target.strokeWeight(2);
      target.line(
        drawPositionX,
        drawPositionY,
        drawPositionX + this.currentVelocityX * 8 * scaleMultiplier,
        drawPositionY + this.currentVelocityY * 8 * scaleMultiplier,
      );
    }
  }
}
