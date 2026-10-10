import type React from "react";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../../types/sketch";

interface Props {
  params: SketchParameters;
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
  hideBorderTop?: boolean;
}

export const VignetteSubSection: React.FC<Props> = ({
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
      <div
        className="flex items-center justify-between"
        title="画面の四隅・周辺を暗く落とし、中央に視線を集めるビネット効果を追加します"
      >
        <span className="text-gray-700 text-xs font-medium">ビネット</span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.showVignette || false}
            className="sr-only peer"
            onChange={(e) =>
              onParamChange("showVignette", e.target.checked)
            }
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.showVignette && (
        <div className="space-y-2 pt-1">
          <div className="space-y-1" title="四隅の暗さの強さを調整します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-vignette-intensity">減光強度</label>
              <span className="text-gray-900">
                {Math.round((params.vignetteIntensity ?? 0.45) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-vignette-intensity"
              min="0.1"
              max="1.0"
              step="0.01"
              value={params.vignetteIntensity ?? 0.45}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "vignetteIntensity",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>

          <div
            className="space-y-1"
            title="減光を開始する中央からの範囲を調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-vignette-radius">有効範囲</label>
              <span className="text-gray-900">
                {Math.round((params.vignetteRadius ?? 0.5) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-vignette-radius"
              min="0.1"
              max="0.9"
              step="0.01"
              value={params.vignetteRadius ?? 0.5}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "vignetteRadius",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
