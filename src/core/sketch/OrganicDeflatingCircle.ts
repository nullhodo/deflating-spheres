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

    const shrinkFactor = 1.0 - parameters.deflationRate;
    this.currentRadius *= shrinkFactor;

    if (this.currentRadius < 1.2) {
      this.isDeflated = true;
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

    // 1. 軌跡ラインの描画
    if (this.positionHistory.length > 1) {
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
          progressRatio * 140 * opacityMultiplier,
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

    const drawRadius = this.currentRadius * scaleMultiplier;
    const drawPositionX = this.currentPositionX * scaleMultiplier;
    const drawPositionY = this.currentPositionY * scaleMultiplier;

    // 2. ボケ光量・グローエフェクト (Opt-in)
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

    // 3. 風船（円本体）のソリッド描画
    target.noStroke();
    target.fill(
      redComponent,
      greenComponent,
      blueComponent,
      Math.round(255 * opacityMultiplier),
    );
    target.circle(drawPositionX, drawPositionY, drawRadius * 2);

    // 4. 反射ハイライトエフェクト (Opt-in)
    if (parameters.enableReflectionHighlight) {
      target.fill(255, 255, 255, 95 * opacityMultiplier);
      target.circle(
        drawPositionX - drawRadius * 0.28,
        drawPositionY - drawRadius * 0.28,
        drawRadius * 0.5,
      );
    }

    // 5. 外周輪郭線 (Opt-in)
    if (parameters.enableBorderOutline) {
      target.noFill();
      target.stroke(255, 255, 255, 160 * opacityMultiplier);
      target.strokeWeight(Math.max(1, 1.5 * scaleMultiplier));
      target.circle(drawPositionX, drawPositionY, drawRadius * 2);
    }

    // 6. デバッグ表示
    if (parameters.debugMode) {
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
