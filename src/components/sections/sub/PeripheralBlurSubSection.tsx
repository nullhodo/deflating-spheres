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

export const PeripheralBlurSubSection: React.FC<Props> = ({
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
        title="中心を鮮明に保ちつつ周辺部を滑らかにぼかす効果を追加します"
      >
        <span className="text-gray-700 text-xs font-medium">
          周辺ぼかし
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.showPeripheralBlur || false}
            className="sr-only peer"
            onChange={(e) =>
              onParamChange("showPeripheralBlur", e.target.checked)
            }
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.showPeripheralBlur && (
        <div className="space-y-2 pt-1">
          <div className="space-y-1" title="ぼかしの強さを調整します">
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-peripheral-blur-amount">
                ぼかし強度
              </label>
              <span className="text-gray-900">
                {Math.round(params.peripheralBlurAmount ?? 6)}px
              </span>
            </div>
            <input
              type="range"
              id="slider-peripheral-blur-amount"
              min="1"
              max="20"
              step="1"
              value={params.peripheralBlurAmount ?? 6}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "peripheralBlurAmount",
                  Number.parseInt(e.target.value, 10),
                )
              }
            />
          </div>

          <div
            className="space-y-1"
            title="ぼかさずに鮮明さを維持する中央の範囲を調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-peripheral-blur-radius">
                クリア領域
              </label>
              <span className="text-gray-900">
                {Math.round((params.peripheralBlurRadius ?? 0.4) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-peripheral-blur-radius"
              min="0.1"
              max="0.8"
              step="0.01"
              value={params.peripheralBlurRadius ?? 0.4}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "peripheralBlurRadius",
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
