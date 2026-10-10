import { useAtom } from "jotai";
import {
  FileCodeIcon,
  FileDownIcon,
  SquareIcon,
  VideoIcon,
} from "lucide-react";
import type React from "react";
import {
  isLoopRecordingActiveAtom,
  recordingStateAtom,
  targetLoopsCountAtom,
} from "../../state/sketchStore";

interface Props {
  onExportJpg: () => void;
  onExportSvg: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onImportJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJson: () => void;
  onStartNLoopRecord: () => void;
  onStopNLoopRecord: () => void;
}

export const ExportSection: React.FC<Props> = ({
  onExportJpg,
  onExportSvg,
  onStartRecord,
  onStopRecord,
  onImportJson,
  onExportJson,
  onStartNLoopRecord,
  onStopNLoopRecord,
}) => {
  const [recordingState] = useAtom(recordingStateAtom);
  const [targetLoops, setTargetLoops] = useAtom(targetLoopsCountAtom);
  const [isLoopRecordingActive] = useAtom(isLoopRecordingActiveAtom);

  return (
    <div className="space-y-3 bg-white/50 backdrop-blur-md p-3.5 rounded-md border border-white/50 shadow-xs">
      <div className="font-bold text-gray-900 flex items-center gap-2 text-xs">
        <FileCodeIcon className="w-4 h-4 text-gray-700" /> 出力 &amp; 保存
      </div>

      {/* Image Exports */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onExportJpg}
          title="縦横2880pxの高解像度PNG画像とJSON設定を出力します"
          className="bg-gray-900/90 hover:bg-gray-900 text-white py-2 rounded font-medium transition flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-xs active:scale-[0.99]"
        >
          高解像度PNG
        </button>
        <button
          type="button"
          onClick={onExportSvg}
          title="p5.js-svg を使用してベクターSVG画像を出力します"
          className="bg-white/70 hover:bg-white/95 text-gray-800 border border-gray-300/80 py-2 rounded font-medium transition flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-xs"
        >
          SVG
        </button>
      </div>

      {/* Manual MP4 Recording */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
        <button
          type="button"
          disabled={recordingState.isRecording}
          onClick={onStartRecord}
          title="mp4-muxer / WebCodecs で動画録画を開始します (Rキー)"
          className="bg-white/70 hover:bg-white/95 text-gray-800 border border-gray-300/80 py-2 rounded font-medium transition flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <VideoIcon className="w-4 h-4" /> 手動録画 (R)
        </button>
        <button
          type="button"
          disabled={!recordingState.isRecording}
          onClick={onStopRecord}
          title="録画を停止して動画とJSONを出力します (Sキー)"
          className="bg-white/70 hover:bg-white/95 disabled:opacity-40 text-gray-800 border border-gray-300/80 py-2 rounded font-medium transition flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:cursor-not-allowed shadow-xs"
        >
          <VideoIcon className="w-4 h-4" /> 録画停止 (S)
        </button>
      </div>

      {/* Exact N-Loop MP4 Recording */}
      <div className="space-y-2 pt-2 border-t border-gray-200/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700 font-semibold">
            Nループ指定 MP4録画
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 font-medium text-[11px]">
              ループ数:
            </span>
            <select
              value={targetLoops}
              onChange={(e) =>
                setTargetLoops(Number.parseInt(e.target.value))
              }
              className="bg-white/70 hover:bg-white/95 border border-gray-300/80 rounded px-2 py-0.5 text-xs text-gray-900 cursor-pointer shadow-2xs"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n} ループ
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoopRecordingActive ? (
          <button
            type="button"
            onClick={onStopNLoopRecord}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2 text-xs cursor-pointer animate-pulse shadow-sm"
          >
            <SquareIcon className="w-4 h-4 fill-white" />
            Nループ録画を停止 (録画中)
          </button>
        ) : (
          <button
            type="button"
            disabled={recordingState.isRecording}
            onClick={onStartNLoopRecord}
            title="指定したNループ分だけ自動ランダム更新しながらMP4動画を自動撮影します"
            className="w-full bg-white/70 hover:bg-white/95 text-gray-800 border border-gray-300/80 py-2 rounded font-medium transition flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            <VideoIcon className="w-4 h-4" />
            {targetLoops} ループ分を自動録画 (MP4)
          </button>
        )}
      </div>

      {/* JSON File Export / Import */}
      <div className="pt-2 border-t border-gray-200/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-semibold text-xs">
            JSON設定ファイル
          </span>
          <button
            type="button"
            onClick={onExportJson}
            title="現在のパラメータとランダム化対象設定をJSONファイルとして保存します"
            className="px-2.5 py-1 bg-white/70 hover:bg-white/95 text-gray-800 border border-gray-300/80 rounded text-xs font-medium transition flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <FileDownIcon className="w-3.5 h-3.5" /> JSON保存
          </button>
        </div>

        <div title="過去に保存したJSONファイルを読み込んでパラメータやランダム設定を再現します">
          <input
            type="file"
            id="file-json-input"
            accept=".json"
            onChange={onImportJson}
            className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-gray-300/80 file:text-xs file:font-semibold file:bg-white/80 file:text-gray-800 hover:file:bg-white cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
