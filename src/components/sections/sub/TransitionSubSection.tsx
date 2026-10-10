import type React from "react";
import type {
  SketchParamValue,
  SketchParameters,
  TransitionType,
} from "../../../types/sketch";

interface Props {
  params: SketchParameters;
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
  hideBorderTop?: boolean;
}

export const TransitionSubSection: React.FC<Props> = ({
  params,
  onParamChange,
  hideBorderTop,
}) => {
  return (
    <div
      className={`${
        hideBorderTop ? "" : "pt-2 border-t border-gray-200"
      } space-y-2`}
    >
      <div className="text-gray-700 text-xs font-semibold">Transition</div>
      <div
        className={`grid gap-2 ${
          params.transitionType !== "none" ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        <div title="切り替え時のトランジションパターンを選択します">
          <label
            className="text-gray-600 font-medium block text-[10px] mb-1"
            htmlFor="select-transition"
          >
            アニメーション
          </label>
          <select
            id="select-transition"
            value={params.transitionType || "fade"}
            onChange={(e) =>
              onParamChange(
                "transitionType",
                e.target.value as TransitionType,
              )
            }
            className="w-full bg-white border border-gray-300 text-gray-900 rounded p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="none">アニメーションなし</option>
            <option value="fade">クロスフェード</option>
            <option value="zoom">ズームイン</option>
            <option value="wipe">円形ワイプ</option>
            <option value="slide">平坦スライド</option>
            <option value="swipeHorizontal">3D左右スワイプ</option>
            <option value="swipeVertical">3D上下スワイプ</option>
            <option value="cubeHorizontal">3Dキューブ回転 (Y軸)</option>
            <option value="cubeVertical">3Dキューブ回転 (X軸)</option>
          </select>
        </div>
        {params.transitionType !== "none" && (
          <div title="アニメーションの再生時間を指定します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px] mb-1">
              <label htmlFor="slider-transition-duration">再生時間</label>
              <span className="text-gray-900">
                {params.transitionDurationMs}ms
              </span>
            </div>
            <input
              type="range"
              id="slider-transition-duration"
              min="100"
              max="2000"
              step="50"
              value={params.transitionDurationMs || 400}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "transitionDurationMs",
                  Number.parseInt(e.target.value),
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
