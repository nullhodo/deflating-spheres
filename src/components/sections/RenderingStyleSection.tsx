import { useAtom } from "jotai";
import { PaintbrushIcon } from "lucide-react";
import type React from "react";
import { sketchParamsAtom } from "../../state/sketchStore";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../types/sketch";
import { ArtisticEffectsSubSection } from "./sub/ArtisticEffectsSubSection";
import { TransitionSubSection } from "./sub/TransitionSubSection";

interface Props {
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
}

export const RenderingStyleSection: React.FC<Props> = ({
  onParamChange,
}) => {
  const [params] = useAtom(sketchParamsAtom);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <PaintbrushIcon className="w-4 h-4 text-gray-700" />
        <h3 className="text-sm font-semibold text-gray-900">
          描画スタイル設定
        </h3>
      </div>

      <TransitionSubSection
        params={params}
        onParamChange={onParamChange}
        hideBorderTop={true}
      />
      <ArtisticEffectsSubSection
        params={params}
        onParamChange={onParamChange}
      />
    </div>
  );
};
