import { useAtom } from "jotai";
import {
  CheckIcon,
  ChevronDownIcon,
  LayersIcon,
  PaletteIcon,
  RefreshCwIcon,
  ShuffleIcon,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { PALETTES } from "../../constants/palettes";
import { sketchParamsAtom } from "../../state/sketchStore";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../types/sketch";
import {
  getCurrentActiveColorList,
  getResolvedBackgroundColorHex,
} from "../../utils/colorUtils";

interface Props {
  onApplyPalette: (index: number) => void;
  onPickRandomPalette: () => void;
  onShufflePaletteColors: () => void;
  onGenerateGradientTheme: (baseHex: string) => void;
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
}

export const ColorPaletteSection: React.FC<Props> = ({
  onApplyPalette,
  onPickRandomPalette,
  onShufflePaletteColors,
  onGenerateGradientTheme,
  onParamChange,
}) => {
  const [params] = useAtom(sketchParamsAtom);
  const [baseColor, setBaseColor] = useState(
    params.gradientBaseColor || "#38bdf8",
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPalette = PALETTES[params.paletteIndex] || PALETTES[0];
  const activeColorList = getCurrentActiveColorList(params, PALETTES);
  const resolvedBg = getResolvedBackgroundColorHex(params, PALETTES);

  const getPaletteGradient = (
    palette: (typeof PALETTES)[number],
    angle = 90,
  ) => {
    if (!palette?.colors?.length) return "transparent";
    const hexes = palette.colors.map((c) => c.hex);
    if (hexes.length === 1) return hexes[0];
    return `linear-gradient(${angle}deg, ${hexes.join(", ")})`;
  };

  const getPaletteSoftGradient = (
    palette: (typeof PALETTES)[number],
    opacity = 0.25,
    angle = 90,
  ) => {
    if (!palette?.colors?.length) return "transparent";
    const stops = palette.colors.map((c) => {
      const [r, g, b] = c.rgb;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    });
    if (stops.length === 1) return stops[0];
    return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleDropdownOutside = (e: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("pointerdown", handleDropdownOutside);
    }
    return () => {
      document.removeEventListener("pointerdown", handleDropdownOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="space-y-3 bg-white/50 backdrop-blur-md p-3.5 rounded-md border border-white/50 shadow-xs relative overflow-hidden">
      {/* Top accent line colored by current palette */}
      <div
        className="h-[3px] absolute top-0 left-0 right-0 transition-all duration-300"
        style={{ background: getPaletteGradient(currentPalette, 90) }}
      />

      <div className="font-bold text-gray-900 flex items-center gap-2 text-xs pt-0.5">
        <PaletteIcon className="w-4 h-4 text-gray-700" /> カラーパレット
        &amp; テーマ
      </div>

      {/* Palette Selector with Color Preview Swatches */}
      <div className="space-y-1 relative" ref={dropdownRef}>
        <div className="flex justify-between items-center">
          <label
            htmlFor="palette-custom-select"
            className="text-gray-600 font-medium block text-[11px]"
          >
            プリセット ({PALETTES.length}種)
          </label>
          <span className="text-[10px] text-gray-600 font-mono">
            #{params.paletteIndex + 1}
          </span>
        </div>

        {/* Custom Dropdown Trigger Button */}
        <button
          type="button"
          id="palette-custom-select"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="w-full bg-white/80 hover:bg-white text-gray-900 border border-gray-300/80 rounded p-1.5 text-xs flex items-center justify-between gap-2 shadow-2xs transition cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            {/* Swatch dots */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {currentPalette.colors.slice(0, 4).map((c) => (
                <span
                  key={c.hex}
                  className="w-2.5 h-2.5 rounded-full border border-black/10 flex-shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <span className="truncate font-medium text-xs">
              {currentPalette.title}
            </span>
          </div>
          <ChevronDownIcon
            className={`w-3.5 h-3.5 text-gray-600 flex-shrink-0 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white/95 backdrop-blur-lg border border-gray-300 rounded shadow-xl py-1 text-xs custom-scrollbar">
            {PALETTES.map((pal, idx) => {
              const isSelected = idx === params.paletteIndex;
              return (
                <button
                  type="button"
                  key={pal.title}
                  onClick={() => {
                    onApplyPalette(idx);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between gap-2 hover:bg-gray-100/80 transition cursor-pointer ${
                    isSelected
                      ? "bg-gray-100 font-semibold text-gray-900"
                      : "text-gray-700"
                  }`}
                  style={{
                    background: isSelected
                      ? getPaletteSoftGradient(pal, 0.15)
                      : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {pal.colors.slice(0, 5).map((c) => (
                        <span
                          key={c.hex}
                          className="w-2.5 h-2.5 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                    <div className="truncate">
                      <span className="text-xs">{pal.title}</span>
                      {pal.comment && (
                        <span className="text-[10px] text-gray-600 ml-1.5 hidden sm:inline">
                          - {pal.comment}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckIcon className="w-3.5 h-3.5 text-gray-800 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Palette Color Strip */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] text-gray-600">
          <span>アクティブ構成色 ({activeColorList.length}色)</span>
          <span className="font-mono text-gray-600 truncate max-w-[150px]">
            {params.useSingleColorMode
              ? "単色モード"
              : params.useGradientTheme
                ? "グラデーション"
                : currentPalette.title}
          </span>
        </div>
        <div className="w-full h-5 rounded overflow-hidden flex border border-gray-300 shadow-inner">
          {activeColorList.map((c, i) => (
            <div
              key={`${c.hex}_${i}`}
              className="flex-1 h-full transition-all hover:opacity-90 cursor-default"
              style={{ backgroundColor: c.hex }}
              title={`${c.name} (${c.hex})`}
            />
          ))}
        </div>
      </div>

      {/* Palette Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPickRandomPalette}
          title="ランダムにパレットを選択します"
          className="flex-1 bg-white/70 hover:bg-white/95 text-gray-800 border border-gray-300/80 py-1.5 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer font-medium shadow-xs"
        >
          <ShuffleIcon className="w-3.5 h-3.5" />
          ランダムパレット
        </button>
        <button
          type="button"
          onClick={onShufflePaletteColors}
          title="現在のパレット内で色割り当てをシャッフルします"
          className="flex-1 bg-white/70 hover:bg-white/95 text-gray-800 border border-gray-300/80 py-1.5 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer font-medium shadow-xs"
        >
          <RefreshCwIcon className="w-3.5 h-3.5" />
          配色シャッフル
        </button>
      </div>

      {/* 背景色設定 */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
        <div>
          <label
            htmlFor="bg-palette-index"
            className="text-gray-600 font-medium block text-[10px] mb-1"
          >
            背景色 (パレット基準)
          </label>
          <select
            id="bg-palette-index"
            value={params.backgroundColorIndex}
            onChange={(e) => {
              const val = Number(e.target.value);
              onParamChange("backgroundColorIndex", val);
              if (val >= 0 && currentPalette.colors[val]) {
                const hex = currentPalette.colors[val].hex;
                onParamChange("backgroundColor", hex);
                onParamChange("manualBackgroundColor", hex);
              }
            }}
            className="w-full h-7 bg-white rounded border border-gray-300 text-xs px-1 cursor-pointer"
          >
            <option value={-1}>手動カスタム ({resolvedBg})</option>
            {currentPalette.colors.map((c, idx) => (
              <option key={c.hex} value={idx}>
                {c.name} ({c.hex})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="color-manual-bg"
            className="text-gray-600 font-medium block text-[10px] mb-1"
          >
            背景手動調整 ({resolvedBg})
          </label>
          <input
            type="color"
            id="color-manual-bg"
            value={resolvedBg}
            className="w-full h-7 rounded border border-gray-300 bg-white cursor-pointer"
            onChange={(e) => {
              const newColor = e.target.value;
              onParamChange("backgroundColorIndex", -1);
              onParamChange("manualBackgroundColor", newColor);
              onParamChange("backgroundColor", newColor);
            }}
          />
        </div>
      </div>

      {/* 単色モード (Single Color) */}
      <div className="pt-2 border-t border-gray-200 space-y-1.5">
        <label className="flex items-center justify-between text-gray-700 text-[11px] font-medium cursor-pointer">
          <span>単色モード (Single Color)</span>
          <input
            type="checkbox"
            checked={params.useSingleColorMode}
            onChange={(e) =>
              onParamChange("useSingleColorMode", e.target.checked)
            }
            className="rounded text-gray-900 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
          />
        </label>
        {params.useSingleColorMode && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="color"
              value={params.singleColorValue}
              onChange={(e) =>
                onParamChange("singleColorValue", e.target.value)
              }
              className="w-7 h-7 rounded border border-gray-300 cursor-pointer bg-white"
            />
            <span className="font-mono text-xs text-gray-600">
              {params.singleColorValue}
            </span>
          </div>
        )}
      </div>

      {/* Gradient Theme Generator */}
      <div className="pt-2 border-t border-gray-200 space-y-2">
        <label className="flex items-center justify-between text-gray-700 text-[11px] font-medium cursor-pointer">
          <span>単色グラデーションテーマ化</span>
          <input
            type="checkbox"
            checked={params.useGradientTheme}
            onChange={(e) =>
              onParamChange("useGradientTheme", e.target.checked)
            }
            className="rounded text-gray-900 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
          />
        </label>
        {params.useGradientTheme && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => {
                setBaseColor(e.target.value);
                onParamChange("gradientBaseColor", e.target.value);
              }}
              className="w-7 h-7 rounded border border-gray-300 cursor-pointer bg-white"
            />
            <button
              type="button"
              onClick={() => {
                onParamChange("gradientBaseColor", baseColor);
                onGenerateGradientTheme(baseColor);
              }}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-1 rounded text-xs transition font-medium shadow-sm cursor-pointer"
            >
              グラデーション更新
            </button>
          </div>
        )}
      </div>

      {/* 色減算・充填システム (三原色の混色) */}
      <div className="pt-2 border-t border-gray-200 space-y-2">
        <label className="flex items-center justify-between text-gray-800 text-[11px] font-semibold cursor-pointer">
          <span className="flex items-center gap-1.5">
            <LayersIcon className="w-3.5 h-3.5 text-indigo-500" />
            色減算・充填システム (三原色)
          </span>
          <input
            type="checkbox"
            checked={params.enableColorMixingSystem}
            onChange={(e) => {
              const isChecked = e.target.checked;
              onParamChange("enableColorMixingSystem", isChecked);
              if (isChecked) {
                // 三原色システムON時は縮小係数を0、不透明度を0.7 (透過混色) に設定
                onParamChange("deflationShrinkFactor", 0);
                onParamChange("circleOpacity", 0.7);
                // 光の三原色なら黒背景、色の三原色なら白背景に自動設定
                const targetBg =
                  params.colorMixingMode === "cmy_subtractive"
                    ? "#ffffff"
                    : "#0a0a0c";
                onParamChange("backgroundColorIndex", -1);
                onParamChange("manualBackgroundColor", targetBg);
                onParamChange("backgroundColor", targetBg);
              }
            }}
            className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
          />
        </label>

        {params.enableColorMixingSystem && (
          <div className="bg-indigo-50/70 p-2.5 rounded border border-indigo-100 space-y-2.5 text-xs text-gray-700">
            {/* 混色方式切り替え */}
            <div>
              <span className="text-[10px] text-gray-500 font-medium block mb-1">
                混色方式
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onParamChange("colorMixingMode", "rgb_additive");
                    // 光の三原色は黒背景に自動設定
                    onParamChange("backgroundColorIndex", -1);
                    onParamChange("manualBackgroundColor", "#0a0a0c");
                    onParamChange("backgroundColor", "#0a0a0c");
                  }}
                  className={`py-1 px-2 rounded text-[11px] font-medium border text-center transition cursor-pointer ${
                    params.colorMixingMode === "rgb_additive"
                      ? "bg-white border-indigo-500 text-indigo-700 shadow-xs"
                      : "bg-white/60 border-gray-200 text-gray-600 hover:bg-white"
                  }`}
                >
                  光の三原色 (RGB加算)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onParamChange("colorMixingMode", "cmy_subtractive");
                    // 色の三原色は白背景に自動設定
                    onParamChange("backgroundColorIndex", -1);
                    onParamChange("manualBackgroundColor", "#ffffff");
                    onParamChange("backgroundColor", "#ffffff");
                  }}
                  className={`py-1 px-2 rounded text-[11px] font-medium border text-center transition cursor-pointer ${
                    params.colorMixingMode === "cmy_subtractive"
                      ? "bg-white border-indigo-500 text-indigo-700 shadow-xs"
                      : "bg-white/60 border-gray-200 text-gray-600 hover:bg-white"
                  }`}
                >
                  色の三原色 (CMY減算)
                </button>
              </div>
            </div>

            {/* モード説明 */}
            <p className="text-[10px] text-gray-500 leading-normal">
              {params.colorMixingMode === "rgb_additive"
                ? "白光から黄色が出ると青が残り、シアンが出ると赤が残る補色減算。吸気・時間で白光へ再充填"
                : "深色からイエローが出ると青が残り、シアンが出ると赤が残るインク減算。吸気・時間で深インク色へ再充填"}
            </p>

            {/* 充填速度スライダー */}
            <div>
              <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                <span>色の充填速度 (リチャージ)</span>
                <span className="font-mono">
                  {(params.colorRechargeSpeed ?? 0.008).toFixed(4)}
                </span>
              </div>
              <input
                type="range"
                min="0.0005"
                max="0.03"
                step="0.0005"
                value={params.colorRechargeSpeed ?? 0.008}
                onChange={(e) =>
                  onParamChange(
                    "colorRechargeSpeed",
                    Number.parseFloat(e.target.value),
                  )
                }
                className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
