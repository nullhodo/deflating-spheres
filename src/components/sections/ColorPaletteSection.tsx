import { useAtom } from "jotai";
import {
  CheckIcon,
  ChevronDownIcon,
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
                onParamChange(
                  "backgroundColor",
                  currentPalette.colors[val].hex,
                );
              }
            }}
            className="w-full h-7 bg-white rounded border border-gray-300 text-xs px-1 cursor-pointer"
          >
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
              onParamChange("manualBackgroundColor", e.target.value);
              onParamChange("backgroundColor", e.target.value);
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
    </div>
  );
};
