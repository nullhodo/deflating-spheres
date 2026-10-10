import { useAtom } from "jotai";
import { TerminalIcon } from "lucide-react";
import type React from "react";
import {
  simulationDiagnosticsAtom,
  sketchParamsAtom,
} from "../state/sketchStore";

export const DebugOverlay: React.FC = () => {
  const [params] = useAtom(sketchParamsAtom);
  const [diagnostics] = useAtom(simulationDiagnosticsAtom);

  if (!params.debugMode) return null;

  const effectsCount = [
    params.enableBreathingPulse,
    params.enableReflectionHighlight,
    params.enableGlowBokeh,
    params.enableBorderOutline,
    params.enableCenterCoreDot,
  ].filter(Boolean).length;

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-gray-900/90 backdrop-blur-md border border-gray-700/70 p-3 rounded-lg text-xs font-mono space-y-1.5 text-gray-200 shadow-xl pointer-events-none select-none">
      <div className="text-gray-400 font-bold border-b border-gray-700/70 pb-1 mb-1 flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5">
          <TerminalIcon className="w-3.5 h-3.5 text-sky-400" />
          SYSTEM MONITOR
        </span>
        <span className="text-emerald-400 text-[10px]">ONLINE</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-gray-400">FPS:</span>
        <span className="text-emerald-400 font-semibold">
          {diagnostics.fps}
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-gray-400">ACTIVE PARTICLES:</span>
        <span className="text-sky-400 font-semibold">
          {diagnostics.activeParticles}
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-gray-400">CENTER RADIUS:</span>
        <span className="text-gray-100">
          {diagnostics.centerRadius.toFixed(1)} px
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-gray-400">OPT-IN EFFECTS:</span>
        <span
          className={
            effectsCount > 0
              ? "text-amber-400 font-semibold"
              : "text-gray-500 font-semibold"
          }
        >
          {effectsCount > 0 ? `${effectsCount} ACTIVE` : "ALL OFF"}
        </span>
      </div>
    </div>
  );
};
