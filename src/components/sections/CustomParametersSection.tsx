import { useAtom } from "jotai";
import {
  ActivityIcon,
  CircleDotIcon,
  CircleIcon,
  DotIcon,
  HeartIcon,
  SparklesIcon,
  SunIcon,
  SunMediumIcon,
} from "lucide-react";
import type React from "react";
import { sketchParamsAtom } from "../../state/sketchStore";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../types/sketch";

interface Props {
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
}

export const CustomParametersSection: React.FC<Props> = ({
  onParamChange,
}) => {
  const [params] = useAtom(sketchParamsAtom);

  return (
    <div className="space-y-4">
      {/* 視覚エフェクト (Opt-in) */}
      <div className="space-y-3 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-lg shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
            視覚エフェクト (Opt-in)
          </span>
          <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-medium">
            初期値OFF
          </span>
        </div>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          デフォルトはフラットでミニマルな表現です。好みに応じて個別に有効化できます。
        </p>

        <div className="space-y-2 pt-1">
          {/* 呼吸・脈動エフェクト */}
          <label className="flex items-center justify-between bg-white/70 hover:bg-white/90 p-2 rounded-md border border-amber-500/20 cursor-pointer transition">
            <span className="text-[11px] text-gray-800 font-medium flex items-center gap-1.5">
              <HeartIcon className="w-3.5 h-3.5 text-rose-500" />
              呼吸・脈動エフェクト
            </span>
            <input
              type="checkbox"
              checked={params.enableBreathingPulse}
              onChange={(e) =>
                onParamChange("enableBreathingPulse", e.target.checked)
              }
              className="rounded text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* 反射・光沢ハイライト */}
          <label className="flex items-center justify-between bg-white/70 hover:bg-white/90 p-2 rounded-md border border-amber-500/20 cursor-pointer transition">
            <span className="text-[11px] text-gray-800 font-medium flex items-center gap-1.5">
              <SunIcon className="w-3.5 h-3.5 text-yellow-500" />
              反射・光沢ハイライト
            </span>
            <input
              type="checkbox"
              checked={params.enableReflectionHighlight}
              onChange={(e) =>
                onParamChange(
                  "enableReflectionHighlight",
                  e.target.checked,
                )
              }
              className="rounded text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* ボケ光量・グロー */}
          <label className="flex items-center justify-between bg-white/70 hover:bg-white/90 p-2 rounded-md border border-amber-500/20 cursor-pointer transition">
            <span className="text-[11px] text-gray-800 font-medium flex items-center gap-1.5">
              <SunMediumIcon className="w-3.5 h-3.5 text-sky-500" />
              ボケ光量・グローエフェクト
            </span>
            <input
              type="checkbox"
              checked={params.enableGlowBokeh}
              onChange={(e) =>
                onParamChange("enableGlowBokeh", e.target.checked)
              }
              className="rounded text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* フチ（外周輪郭線） */}
          <label className="flex items-center justify-between bg-white/70 hover:bg-white/90 p-2 rounded-md border border-amber-500/20 cursor-pointer transition">
            <span className="text-[11px] text-gray-800 font-medium flex items-center gap-1.5">
              <CircleIcon className="w-3.5 h-3.5 text-gray-500" />
              フチ（外周輪郭線）描画
            </span>
            <input
              type="checkbox"
              checked={params.enableBorderOutline}
              onChange={(e) =>
                onParamChange("enableBorderOutline", e.target.checked)
              }
              className="rounded text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* 母体円の中心点描画 */}
          <label className="flex items-center justify-between bg-white/70 hover:bg-white/90 p-2 rounded-md border border-amber-500/20 cursor-pointer transition">
            <span className="text-[11px] text-gray-800 font-medium flex items-center gap-1.5">
              <DotIcon className="w-3.5 h-3.5 text-gray-500" />
              母体円の中心点描画
            </span>
            <input
              type="checkbox"
              checked={params.enableCenterCoreDot}
              onChange={(e) =>
                onParamChange("enableCenterCoreDot", e.target.checked)
              }
              className="rounded text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 母体円 & 放出設定 */}
      <div className="space-y-3 bg-white/50 backdrop-blur-md p-3.5 rounded-lg border border-white/60 shadow-xs">
        <div className="font-bold text-gray-900 flex items-center gap-2 text-xs">
          <CircleDotIcon className="w-4 h-4 text-sky-600" />
          母体円 & 放出設定
        </div>

        {/* 中心円の基本半径 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>中心円の基本半径</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.centerRadius} px
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={250}
            value={params.centerRadius}
            onChange={(e) =>
              onParamChange("centerRadius", Number(e.target.value))
            }
            className="w-full accent-sky-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* 脈動の振幅強度 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>脈動の振幅強度</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.pulseIntensity} px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={80}
            value={params.pulseIntensity}
            onChange={(e) =>
              onParamChange("pulseIntensity", Number(e.target.value))
            }
            className="w-full accent-sky-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* 脈動速度 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>脈動の速度</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.pulseSpeed.toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            min={0.005}
            max={0.1}
            step={0.005}
            value={params.pulseSpeed}
            onChange={(e) =>
              onParamChange("pulseSpeed", Number(e.target.value))
            }
            className="w-full accent-sky-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* 放出頻度 (フレーム間隔) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>放出頻度 (フレーム間隔)</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.emissionIntervalFrames}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={180}
            value={params.emissionIntervalFrames}
            onChange={(e) =>
              onParamChange(
                "emissionIntervalFrames",
                Number(e.target.value),
              )
            }
            className="w-full accent-sky-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* 放出ゆらぎ (Jitter) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>放出間隔のゆらぎ (Jitter)</span>
            <span className="font-mono text-gray-900 font-semibold">
              {Math.round(params.emissionJitterFactor * 100)} %
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={params.emissionJitterFactor}
            onChange={(e) =>
              onParamChange("emissionJitterFactor", Number(e.target.value))
            }
            className="w-full accent-sky-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* 発射初速 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>発射初速</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.initialVelocity.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={15}
            step={0.1}
            value={params.initialVelocity}
            onChange={(e) =>
              onParamChange("initialVelocity", Number(e.target.value))
            }
            className="w-full accent-sky-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* 収縮 & 有機的蛇行軌跡 */}
      <div className="space-y-3 bg-white/50 backdrop-blur-md p-3.5 rounded-lg border border-white/60 shadow-xs">
        <div className="font-bold text-gray-900 flex items-center gap-2 text-xs">
          <ActivityIcon className="w-4 h-4 text-emerald-600" />
          収縮 & 有機的ぐねぐね軌跡
        </div>

        {/* 収縮レート */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>収縮レート (空気抜け速度)</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.deflationRate.toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            min={0.002}
            max={0.05}
            step={0.001}
            value={params.deflationRate}
            onChange={(e) =>
              onParamChange("deflationRate", Number(e.target.value))
            }
            className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* 蛇行のうねり強度 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>蛇行のうねり強度</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.wanderStrength.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={4}
            step={0.1}
            value={params.wanderStrength}
            onChange={(e) =>
              onParamChange("wanderStrength", Number(e.target.value))
            }
            className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* 有機的揺らぎの周波数 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>有機的揺らぎの周波数</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.harmonicFrequency.toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            min={0.005}
            max={0.1}
            step={0.001}
            value={params.harmonicFrequency}
            onChange={(e) =>
              onParamChange("harmonicFrequency", Number(e.target.value))
            }
            className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* ノイズ平滑度 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>ノイズ平滑度 (慣性制御)</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.smoothingFactor.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={0.99}
            step={0.01}
            value={params.smoothingFactor}
            onChange={(e) =>
              onParamChange("smoothingFactor", Number(e.target.value))
            }
            className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* 軌跡の描画密度 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>軌跡の描画履歴長</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.trailHistoryLength}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={100}
            step={1}
            value={params.trailHistoryLength}
            onChange={(e) =>
              onParamChange("trailHistoryLength", Number(e.target.value))
            }
            className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* 不透明度 (ソリッド度) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600">
            <span>不透明度 (ソリッド度)</span>
            <span className="font-mono text-gray-900 font-semibold">
              {params.circleOpacity.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.01}
            value={params.circleOpacity}
            onChange={(e) =>
              onParamChange("circleOpacity", Number(e.target.value))
            }
            className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
