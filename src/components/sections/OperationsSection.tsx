import { useAtom } from "jotai";
import { Redo2Icon, SlidersIcon, Undo2Icon } from "lucide-react";
import type React from "react";
import {
  autoRandomIntervalMsAtom,
  historyPointerAtom,
  historyStackAtom,
  isAutoRandomActiveAtom,
} from "../../state/sketchStore";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../types/sketch";

interface Props {
  onRandomizeAll?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onParamChange?: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
}

export const OperationsSection: React.FC<Props> = ({ onUndo, onRedo }) => {
  const [historyStack] = useAtom(historyStackAtom);
  const [historyPointer] = useAtom(historyPointerAtom);
  const [intervalMs, setIntervalMs] = useAtom(autoRandomIntervalMsAtom);
  const [isAutoRandomActive, setIsAutoRandomActive] = useAtom(
    isAutoRandomActiveAtom,
  );

  const canUndo = historyPointer > 0;
  const canRedo = historyPointer < historyStack.length - 1;

  return (
    <div className="space-y-3 bg-white/50 backdrop-blur-md p-3.5 rounded-md border border-white/50 shadow-xs">
      <div className="font-bold text-gray-900 flex items-center gap-2 text-xs">
        <SlidersIcon className="w-4 h-4 text-gray-700" /> 自動ランダム制御
      </div>

      {/* Auto Random Interval Slider & Switch */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-semibold text-xs">
            自動ランダム更新
          </span>
          <label
            className="relative inline-flex items-center cursor-pointer select-none"
            title="指定ms周期で自動的にランダム更新を実行します"
          >
            <input
              type="checkbox"
              checked={isAutoRandomActive}
              className="sr-only peer"
              onChange={(e) => setIsAutoRandomActive(e.target.checked)}
            />
            <div className="w-9 h-5 bg-gray-200/80 border border-gray-300/80 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-2xs" />
          </label>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-gray-600 font-medium text-[11px]">
            <label htmlFor="slider-interval-ms">更新周期 (ms)</label>
            <span className="text-gray-900">{intervalMs}ms</span>
          </div>
          <input
            type="range"
            id="slider-interval-ms"
            min="200"
            max="5000"
            step="100"
            value={intervalMs}
            className="w-full accent-emerald-600 bg-gray-200/80 rounded h-1.5 cursor-pointer"
            onChange={(e) =>
              setIntervalMs(Number.parseInt(e.target.value))
            }
          />
        </div>
      </div>

      {/* Undo / Redo */}
      <div className="flex gap-2 pt-2 border-t border-gray-200/60">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          title="前のパラメータ状態に戻します (Ctrl+Z)"
          className="flex-1 bg-white/70 hover:bg-white/95 disabled:opacity-40 text-gray-800 border border-gray-300/80 py-1.5 rounded transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed text-xs font-medium shadow-xs"
        >
          <Undo2Icon className="w-3.5 h-3.5" /> Undo
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          title="進んだパラメータ状態に進めます (Ctrl+Y)"
          className="flex-1 bg-white/70 hover:bg-white/95 disabled:opacity-40 text-gray-800 border border-gray-300/80 py-1.5 rounded transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed text-xs font-medium shadow-xs"
        >
          <Redo2Icon className="w-3.5 h-3.5" /> Redo
        </button>
      </div>
    </div>
  );
};
