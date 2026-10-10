import { SparklesIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../../types/sketch";
import { CmykSubSection } from "./CmykSubSection";
import { DitheringSubSection } from "./DitheringSubSection";
import { GrainSubSection } from "./GrainSubSection";
import { HalftoneSubSection } from "./HalftoneSubSection";
import { InkBleedSubSection } from "./InkBleedSubSection";
import { PaperTextureSubSection } from "./PaperTextureSubSection";
import { PeripheralBlurSubSection } from "./PeripheralBlurSubSection";
import { RisoSubSection } from "./RisoSubSection";
import { VignetteSubSection } from "./VignetteSubSection";

interface Props {
  params: SketchParameters;
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
}

/**
 * Grouped SubSection for artistic texture & print effects:
 * Film Grain, Vignette, Peripheral Blur, CMYK Print, Risograph, Halftone, Dithering, Ink Bleed, and Paper Texture.
 */
export const ArtisticEffectsSubSection: React.FC<Props> = ({
  params,
  onParamChange,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const activeEffectsCount = [
    params.showGrain,
    params.showVignette,
    params.showPeripheralBlur,
    params.showCmyk,
    params.showRiso,
    params.showHalftone,
    params.showDithering,
    params.showInkBleed,
    params.showPaperTexture,
  ].filter(Boolean).length;

  return (
    <div className="pt-2 border-t border-gray-200 space-y-2">
      <button
        type="button"
        className="w-full flex items-center justify-between cursor-pointer select-none py-1 group text-left"
        onClick={() => setIsOpen(!isOpen)}
        title="フィルムグレインやCMYK印刷、和紙の質感などの静止テクスチャエフェクトを設定します"
      >
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-900 transition-colors" />
          <span className="text-gray-900 text-xs font-semibold group-hover:text-gray-700 transition-colors">
            エフェクト
          </span>
          {activeEffectsCount > 0 && (
            <span className="bg-gray-100 text-gray-800 text-[10px] px-1.5 py-0.5 rounded-full font-medium border border-gray-300">
              {activeEffectsCount} ON
            </span>
          )}
        </div>
        <span className="text-gray-500 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="space-y-3.5 p-2.5 bg-white/50 backdrop-blur-md rounded border border-white/60 shadow-xs">
          {/* 安定・完成版エフェクト */}
          <GrainSubSection
            params={params}
            onParamChange={onParamChange}
            hideBorderTop={true}
          />
          <VignetteSubSection
            params={params}
            onParamChange={onParamChange}
          />
          <PeripheralBlurSubSection
            params={params}
            onParamChange={onParamChange}
          />
          <HalftoneSubSection
            params={params}
            onParamChange={onParamChange}
          />
          <DitheringSubSection
            params={params}
            onParamChange={onParamChange}
          />

          {/* 開発途中エフェクト */}
          <div className="pt-2 border-t border-dashed border-amber-300/80">
            <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block mb-2 border border-amber-200">
              🚧 開発途中
            </div>
            <div className="space-y-3.5">
              <CmykSubSection
                params={params}
                onParamChange={onParamChange}
                hideBorderTop={true}
              />
              <RisoSubSection
                params={params}
                onParamChange={onParamChange}
              />
              <InkBleedSubSection
                params={params}
                onParamChange={onParamChange}
              />
              <PaperTextureSubSection
                params={params}
                onParamChange={onParamChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
