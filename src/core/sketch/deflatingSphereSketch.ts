import type p5 from "p5";
import type { ColorItem, Palette, SketchParameters } from "../../types/sketch";
import { getAvailableObjectColors } from "../../utils/colorUtils";
import { OrganicDeflatingCircle } from "./OrganicDeflatingCircle";

interface SimulationStats {
  activeCount: number;
  currentParentRadius: number;
}

/**
 * 0〜360度の全色相からランダムに美しく上品なスペクトル光/色を生成
 */
function generateRandomSpectrumColor(): ColorItem {
  const hue = Math.random() * 360;
  // 目に優しい上品で澄んだ彩度 (68%〜82%) と明るさ (90%〜96%)
  const saturation = 0.68 + Math.random() * 0.14;
  const value = 0.90 + Math.random() * 0.06;

  const c = value * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = value - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;
  if (hue < 60) {
    rPrime = c;
    gPrime = x;
    bPrime = 0;
  } else if (hue < 120) {
    rPrime = x;
    gPrime = c;
    bPrime = 0;
  } else if (hue < 180) {
    rPrime = 0;
    gPrime = c;
    bPrime = x;
  } else if (hue < 240) {
    rPrime = 0;
    gPrime = x;
    bPrime = c;
  } else if (hue < 300) {
    rPrime = x;
    gPrime = 0;
    bPrime = c;
  } else {
    rPrime = c;
    gPrime = 0;
    bPrime = x;
  }

  const red = Math.round((rPrime + m) * 255);
  const green = Math.round((gPrime + m) * 255);
  const blue = Math.round((bPrime + m) * 255);

  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  const hex = `#${toHex(red)}${toHex(green)}${toHex(blue)}`;

  return {
    name: `Spectrum ${Math.round(hue)}°`,
    hex,
    rgb: [red, green, blue],
  };
}

export class DeflatingSphereSimulation {
  public circles: OrganicDeflatingCircle[] = [];
  public parentPulsePhase = 0;
  public frameEmissionCounter = 0;
  public nextEmissionTargetFrames = 0;
  public globalSimulationTime = 0;

  // 有機的成長・放出収縮オフセット
  public parentGrowthOffset = 0;
  public parentShrinkOffset = 0;
  public parentShrinkVelocity = 0;

  // 色減算・充填システム用状態 (現在の色から実際に引き算し、lerpで滑らかに追従)
  public parentTargetRgb: [number, number, number] = [255, 255, 255];
  public parentCurrentRgb: [number, number, number] = [255, 255, 255];

  public parentTargetCmy: [number, number, number] = [1.0, 1.0, 1.0];
  public parentCurrentCmy: [number, number, number] = [1.0, 1.0, 1.0];

  public reset(): void {
    this.circles = [];
    this.parentPulsePhase = 0;
    this.frameEmissionCounter = 0;
    this.nextEmissionTargetFrames = 0;
    this.globalSimulationTime = 0;
    this.parentGrowthOffset = 0;
    this.parentShrinkOffset = 0;
    this.parentShrinkVelocity = 0;
    this.parentTargetRgb = [255, 255, 255];
    this.parentCurrentRgb = [255, 255, 255];
    this.parentTargetCmy = [1.0, 1.0, 1.0];
    this.parentCurrentCmy = [1.0, 1.0, 1.0];
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

    if (this.nextEmissionTargetFrames <= 0) {
      this.nextEmissionTargetFrames = Math.max(
        3,
        params.emissionIntervalFrames,
      );
    }

    const centerX = width / 2;
    const centerY = height / 2;

    // 1. 有機的成長（ロジスティック飽和付き：上限に近づくほど緩やかに減速し、自律的に安定）
    if (params.enableOrganicParentGrowth) {
      const maxGrowth = params.centerRadius * 0.75;
      const saturationRatio = Math.min(
        1,
        Math.max(0, this.parentGrowthOffset / Math.max(1, maxGrowth)),
      );
      // 上限に近づくにつれて吸気・膨張速度を緩やかに
      const effectiveGrowth =
        params.parentGrowthRate * (1 - saturationRatio * 0.75);
      this.parentGrowthOffset = Math.min(
        maxGrowth,
        this.parentGrowthOffset + effectiveGrowth,
      );
    } else {
      this.parentGrowthOffset = 0;
    }

    // 2. 放出時の収縮オフセット：スプリング・ダンパー物理（Ease-In-Out 弾性振動）
    // 瞬間ステップ変位ではなく、速度と弾性加速度により
    // 「ゼロから加速して縮み（Ease-In）→ 最深部で滑らかに減速（変曲点）→ ふんわりと弾性復元（Ease-Out）」を実現
    // deflationDurationFactor (現在の基準時間を 1.0 とする) により所要時間をスケーリング
    const durationFactor = Math.max(
      0.1,
      params.deflationDurationFactor ?? 1.0,
    );
    const steps = 4;
    const dt = 1.0 / (durationFactor * steps);
    // スプリング剛性を調整してEase-Inの立ち上がりレスポンスを向上
    const springStiffness = 0.11;
    const springDamping = 0.26;

    for (let s = 0; s < steps; s++) {
      const springForce = -springStiffness * this.parentShrinkOffset;
      const dampingForce = -springDamping * this.parentShrinkVelocity;
      this.parentShrinkVelocity += (springForce + dampingForce) * dt;
      this.parentShrinkOffset += this.parentShrinkVelocity * dt;
    }

    // 微小振動の停止
    if (
      Math.abs(this.parentShrinkOffset) < 0.001 &&
      Math.abs(this.parentShrinkVelocity) < 0.001
    ) {
      this.parentShrinkOffset = 0;
      this.parentShrinkVelocity = 0;
    }

    // 3. 呼吸・脈動エフェクト (Opt-in)
    let dynamicPulseOffset = 0;
    if (params.enableBreathingPulse) {
      this.parentPulsePhase += params.pulseSpeed;
      dynamicPulseOffset =
        Math.sin(this.parentPulsePhase) * params.pulseIntensity;
    }

    // 現在のベース親円の半径を計算
    const currentParentRadius = Math.max(
      15,
      params.centerRadius +
        dynamicPulseOffset +
        this.parentGrowthOffset +
        this.parentShrinkOffset,
    );

    // 3.5. 色の充填 (リチャージ) 処理と急激な色変化を防ぐ滑らかな追従アニメーション
    if (params.enableColorMixingSystem) {
      const baseRecharge = params.colorRechargeSpeed ?? 0.008;
      let growthRatio = 0;
      if (params.enableOrganicParentGrowth && params.centerRadius > 0) {
        const maxGrowth = params.centerRadius * 0.75;
        growthRatio = Math.min(
          1,
          Math.max(0, this.parentGrowthOffset / Math.max(1, maxGrowth)),
        );
      }
      // baseRecharge基準とし、吸気成長度合いに応じて穏やかにブースト (最大2倍)
      const effectiveRecharge = baseRecharge * (1.0 + growthRatio * 1.0);

      if (params.colorMixingMode === "rgb_additive") {
        // 目標色 (parentTargetRgb) を白光 [255, 255, 255] へ向かって充填
        this.parentTargetRgb[0] = Math.min(
          255,
          this.parentTargetRgb[0] +
            (255 - this.parentTargetRgb[0]) * effectiveRecharge,
        );
        this.parentTargetRgb[1] = Math.min(
          255,
          this.parentTargetRgb[1] +
            (255 - this.parentTargetRgb[1]) * effectiveRecharge,
        );
        this.parentTargetRgb[2] = Math.min(
          255,
          this.parentTargetRgb[2] +
            (255 - this.parentTargetRgb[2]) * effectiveRecharge,
        );

        this.parentCurrentRgb[0] = this.parentTargetRgb[0];
        this.parentCurrentRgb[1] = this.parentTargetRgb[1];
        this.parentCurrentRgb[2] = this.parentTargetRgb[2];
      } else {
        // 目標インク (parentTargetCmy) を満タン [1.0, 1.0, 1.0] (漆黒) へ向かって充填
        this.parentTargetCmy[0] = Math.min(
          1.0,
          this.parentTargetCmy[0] +
            (1.0 - this.parentTargetCmy[0]) * effectiveRecharge,
        );
        this.parentTargetCmy[1] = Math.min(
          1.0,
          this.parentTargetCmy[1] +
            (1.0 - this.parentTargetCmy[1]) * effectiveRecharge,
        );
        this.parentTargetCmy[2] = Math.min(
          1.0,
          this.parentTargetCmy[2] +
            (1.0 - this.parentTargetCmy[2]) * effectiveRecharge,
        );

        this.parentCurrentCmy[0] = this.parentTargetCmy[0];
        this.parentCurrentCmy[1] = this.parentTargetCmy[1];
        this.parentCurrentCmy[2] = this.parentTargetCmy[2];
      }
    }

    // 4. 子円の放出判定
    // スライダ変更時に次回目標フレーム数が即座に追従するよう上限調整
    const maxAllowedInterval = Math.round(
      params.emissionIntervalFrames * (1.0 + params.emissionJitterFactor),
    );
    if (this.nextEmissionTargetFrames > maxAllowedInterval) {
      this.nextEmissionTargetFrames = maxAllowedInterval;
    }

    this.frameEmissionCounter++;
    let shouldEmit =
      this.frameEmissionCounter >= this.nextEmissionTargetFrames;

    // アイデア①: 内圧超過による確率的放出（自律平衡フィードバック）
    // ※三原色モード時は縮小係数が0のため内圧が減衰せず常時発火してしまうのを防ぎ、
    // 通常モードかつ有機成長ONのときのみ発火させる
    if (
      !params.enableColorMixingSystem &&
      !shouldEmit &&
      params.enableOrganicParentGrowth &&
      this.frameEmissionCounter >= 6
    ) {
      const excess = this.parentGrowthOffset;
      const maxGrowth = params.centerRadius * 0.75;
      if (excess > maxGrowth * 0.35) {
        // 超過度合いに比例して確率が上昇 (毎フレーム 0〜4% 程度の確率)
        const pressureProbability =
          ((excess - maxGrowth * 0.35) / (maxGrowth * 0.65)) * 0.035;
        if (Math.random() < pressureProbability) {
          shouldEmit = true;
        }
      }
    }

    if (shouldEmit) {
      this.frameEmissionCounter = 0;

      // 放出される子円の初期半径
      // 三原色システムON時は親円の大きさと同じ (等身大) で放出
      const childEmissionRadius = params.enableColorMixingSystem
        ? currentParentRadius
        : Math.max(14, Math.min(currentParentRadius * 0.38, 55));

      // 放出実行（生成時はまだ親円のお腹の中にいるため縮まない）
      this.emitNewCircle(
        centerX,
        centerY,
        childEmissionRadius,
        params,
        palettes,
      );

      // 次回放出フレーム数の決定 (Jitter付き)
      const jitterOffsetRatio =
        (Math.random() * 2 - 1) * params.emissionJitterFactor;
      const randomizedInterval =
        params.emissionIntervalFrames * (1.0 + jitterOffsetRatio);
      this.nextEmissionTargetFrames = Math.max(
        3,
        Math.round(randomizedInterval),
      );
    }

    // 5. 子円の物理更新 & フチ抜け時の収縮トリガー & 寿命判定
    for (let i = this.circles.length - 1; i >= 0; i--) {
      const circle = this.circles[i];
      circle.updateSimulationState(params, noiseFn);

      // 有機的収縮表現: 子円が親円のフチ（外周）を越えて外へ出たタイミングで発火！
      if (
        params.enableOrganicParentGrowth &&
        !circle.hasTriggeredParentDeflation
      ) {
        const dx = circle.currentPositionX - centerX;
        const dy = circle.currentPositionY - centerY;
        const distFromCenter = Math.hypot(dx, dy);

        // 収縮トリガー判定: deflationTriggerTiming (0.0: 中心即時 〜 0.7: 先端接触 〜 1.0: 中心通過 〜 1.3: 完全離脱)
        const triggerFactor = Math.max(
          0.0,
          params.deflationTriggerTiming ?? 0.7,
        );
        const triggerThreshold = currentParentRadius * triggerFactor;

        if (distFromCenter >= triggerThreshold) {
          circle.hasTriggeredParentDeflation = true;

          const totalShrink =
            circle.startRadius * params.deflationShrinkFactor;

          // 最初のEase-Inの遅さを解消するため、発火瞬間に初動レスポンス（即時変位）を与え、
          // 続いて速度インパルスで素早く最大収縮へ加速（キレのあるEase-In）
          const immediateKick = totalShrink * 0.22;
          this.parentShrinkOffset -= immediateKick;

          const shrinkImpulse = totalShrink * 0.38;
          this.parentShrinkVelocity -= shrinkImpulse;

          // 蓄積成長分も一部吐き出されて収支のつり合いを取る
          this.parentGrowthOffset = Math.max(
            0,
            this.parentGrowthOffset -
              (immediateKick + shrinkImpulse) * 0.65,
          );
        }
      }

      // 画面内にヘッドまたは軌跡が残っているか判定
      // ヘッドが画面外に出ても、軌跡が画面内に残っている間は削除せず、
      // 軌跡の最後尾まで画面外へ完全に抜け出るまで自然な描画を継続
      const margin = 60;
      const isHeadInside =
        circle.currentPositionX >= -margin &&
        circle.currentPositionX <= width + margin &&
        circle.currentPositionY >= -margin &&
        circle.currentPositionY <= height + margin;

      let hasVisibleTrail = false;
      if (!isHeadInside && !params.enableColorMixingSystem) {
        for (let j = 0; j < circle.positionHistory.length; j++) {
          const pt = circle.positionHistory[j];
          if (
            pt.positionX >= -margin &&
            pt.positionX <= width + margin &&
            pt.positionY >= -margin &&
            pt.positionY <= height + margin
          ) {
            hasVisibleTrail = true;
            break;
          }
        }
      }

      // 極端な遠方への安全ガード (1200px)
      const isFarBeyondScreen =
        circle.currentPositionX < -1200 ||
        circle.currentPositionX > width + 1200 ||
        circle.currentPositionY < -1200 ||
        circle.currentPositionY > height + 1200;

      const isCompletelyOffscreen =
        (!isHeadInside && !hasVisibleTrail) || isFarBeyondScreen;

      if (circle.isDeflated || isCompletelyOffscreen) {
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
    let chosenColor: ColorItem;

    if (params.enableColorMixingSystem) {
      // 1. レパートリー固定を撤廃: 0〜360度の全色相からランダムかつ鮮やかな光/色を生成
      chosenColor = generateRandomSpectrumColor();
      const emittedRgb = chosenColor.rgb;

      if (params.colorMixingMode === "rgb_additive") {
        // 【真の光の減算 (エネルギー完全保存)】:
        // 現在の親円の色 (parentCurrentRgb) から、放出された光のエネルギーを即座に 100% 引き算！
        // これにより、生まれた瞬間の重なり領域は「親円(新) + 子円(放出した光) = 放出前の親円」が厳密に成立し、チカつきがゼロになる！
        this.parentTargetRgb[0] = Math.max(
          0,
          this.parentCurrentRgb[0] - emittedRgb[0],
        );
        this.parentTargetRgb[1] = Math.max(
          0,
          this.parentCurrentRgb[1] - emittedRgb[1],
        );
        this.parentTargetRgb[2] = Math.max(
          0,
          this.parentCurrentRgb[2] - emittedRgb[2],
        );

        this.parentCurrentRgb[0] = this.parentTargetRgb[0];
        this.parentCurrentRgb[1] = this.parentTargetRgb[1];
        this.parentCurrentRgb[2] = this.parentTargetRgb[2];
      } else {
        // 【真の色の減算 (インク完全保存)】:
        // 放出された色の CMY インク成分 (0.0〜1.0) を正しく算出して親円から即座に引き算！
        // シアン(C) = 1-R, マゼンタ(M) = 1-G, イエロー(Y) = 1-B
        const emittedR = emittedRgb[0] / 255;
        const emittedG = emittedRgb[1] / 255;
        const emittedB = emittedRgb[2] / 255;

        const emittedCyan = 1.0 - emittedR;
        const emittedMagenta = 1.0 - emittedG;
        const emittedYellow = 1.0 - emittedB;

        this.parentTargetCmy[0] = Math.max(
          0.0,
          this.parentCurrentCmy[0] - emittedCyan,
        );
        this.parentTargetCmy[1] = Math.max(
          0.0,
          this.parentCurrentCmy[1] - emittedMagenta,
        );
        this.parentTargetCmy[2] = Math.max(
          0.0,
          this.parentCurrentCmy[2] - emittedYellow,
        );

        this.parentCurrentCmy[0] = this.parentTargetCmy[0];
        this.parentCurrentCmy[1] = this.parentTargetCmy[1];
        this.parentCurrentCmy[2] = this.parentTargetCmy[2];
      }
    } else {
      const availableColors = getAvailableObjectColors(params, palettes);
      const parentPrimaryColor = availableColors[0] || {
        name: "Default",
        hex: "#551A28",
        rgb: [85, 26, 40],
      };

      let candidateColors = availableColors;

      // 出ていく円はベース円と違う色にするオプション
      if (params.distinctChildColor && availableColors.length > 1) {
        const parentHex = parentPrimaryColor.hex.toLowerCase();
        const distinctList = availableColors.filter(
          (c) => c.hex.toLowerCase() !== parentHex,
        );
        if (distinctList.length > 0) {
          candidateColors = distinctList;
        }
      }

      chosenColor =
        candidateColors[
          Math.floor(Math.random() * candidateColors.length)
        ] || parentPrimaryColor;
    }

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

    const dynamicPulseOffset = params.enableBreathingPulse
      ? Math.sin(this.parentPulsePhase) * params.pulseIntensity
      : 0;

    const parentRadius =
      currentParentRadius ??
      Math.max(
        15,
        params.centerRadius +
          dynamicPulseOffset +
          this.parentGrowthOffset +
          this.parentShrinkOffset,
      );

    // 三原色混色システム用のブレンドモード設定
    const isColorMixing = Boolean(params.enableColorMixingSystem);
    const targetAny = target as any;

    if (isColorMixing) {
      if (params.colorMixingMode === "rgb_additive") {
        // 光の三原色: 加算合成 (ADD / 'lighter')
        target.blendMode(targetAny.ADD ?? "lighter");
      } else {
        // 色の三原色: 乗算合成 (MULTIPLY / 'multiply')
        target.blendMode(targetAny.MULTIPLY ?? "multiply");
      }
    }

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

    // ブレンドモードを確実に通常 (BLEND / 'source-over') に復帰 (グレイン等の後続エフェクトへの干渉を完全防止)
    if (isColorMixing) {
      target.blendMode(targetAny.BLEND ?? "source-over");
    }
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
    let red: number;
    let green: number;
    let blue: number;

    if (params.enableColorMixingSystem) {
      if (params.colorMixingMode === "rgb_additive") {
        red = Math.round(this.parentCurrentRgb[0]);
        green = Math.round(this.parentCurrentRgb[1]);
        blue = Math.round(this.parentCurrentRgb[2]);
      } else {
        // CMYインク濃度 (0.0〜1.0) から表示RGBを算出 (白背景上での純粋な減算)
        red = Math.round(
          (1.0 - Math.min(1.0, Math.max(0.0, this.parentCurrentCmy[0]))) * 255,
        );
        green = Math.round(
          (1.0 - Math.min(1.0, Math.max(0.0, this.parentCurrentCmy[1]))) * 255,
        );
        blue = Math.round(
          (1.0 - Math.min(1.0, Math.max(0.0, this.parentCurrentCmy[2]))) * 255,
        );
      }
    } else {
      const availableColors = getAvailableObjectColors(params, palettes);
      const primaryColor = availableColors[0] || {
        name: "Default",
        hex: "#551A28",
        rgb: [85, 26, 40],
      };
      const rgbValues = primaryColor.rgb;
      red = rgbValues[0];
      green = rgbValues[1];
      blue = rgbValues[2];
    }

    // 三原色の混色モード時は背景を透かさず完全ソリッド(1.0)で描画 (背景の透けによるチカつきを完全防止)
    const opacity = params.enableColorMixingSystem
      ? 1.0
      : params.circleOpacity;

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
