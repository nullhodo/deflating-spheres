import { useAtom } from "jotai";
import p5 from "p5";
import p5Svg from "p5.js-svg";
import type React from "react";
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { ControlPanel } from "./components/ControlPanel";
import { DebugOverlay } from "./components/DebugOverlay";
import { RecordingOverlay } from "./components/RecordingOverlay";
import { PALETTES } from "./constants/palettes";
import {
  exportHighResImage,
  exportJsonSettings,
  exportSvgGraphics,
} from "./core/exporter";
import { VideoRecorderManager } from "./core/recorder";
import { renderCmykPrintOverlay } from "./core/renderers/cmykRenderer";
import { renderDitheringOverlay } from "./core/renderers/ditheringRenderer";
import { renderGrainOverlay } from "./core/renderers/grainOverlay";
import { renderHalftoneScreenOverlay } from "./core/renderers/halftoneRenderer";
import { renderInkBleedOverlay } from "./core/renderers/inkBleedRenderer";
import { renderPaperTextureOverlay } from "./core/renderers/paperTextureRenderer";
import { renderPeripheralBlurOverlay } from "./core/renderers/peripheralBlurRenderer";
import { renderRisoPrintOverlay } from "./core/renderers/risoRenderer";
import { renderTransition } from "./core/renderers/transitionRenderer";
import { renderVignetteOverlay } from "./core/renderers/vignetteRenderer";
import { DeflatingSphereSimulation } from "./core/sketch/deflatingSphereSketch";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSketchHandlers } from "./hooks/useSketchHandlers";
import { useWheelRangeSlider } from "./hooks/useWheelRangeSlider";
import "./index.css";
import {
  autoRandomIntervalMsAtom,
  isAutoRandomActiveAtom,
  isLoopRecordingActiveAtom,
  isPanelOpenAtom,
  randomTargetsAtom,
  recordingStateAtom,
  simulationDiagnosticsAtom,
  sketchParamsAtom,
  targetLoopsCountAtom,
} from "./state/sketchStore";
import { getResolvedBackgroundColorHex } from "./utils/colorUtils";

// Initialize p5 SVG plugin
p5Svg(p5);

// Set [DEV] title prefix in local development mode
if (import.meta.env.DEV && !document.title.startsWith("[DEV]")) {
  document.title = `[DEV] ${document.title}`;
}

const App: React.FC = () => {
  const [params] = useAtom(sketchParamsAtom);
  const [, setRecordingState] = useAtom(recordingStateAtom);
  const [randomTargets] = useAtom(randomTargetsAtom);
  const [, setIsPanelOpen] = useAtom(isPanelOpenAtom);
  const [, setIsAutoRandomActive] = useAtom(isAutoRandomActiveAtom);
  const [, setIsLoopRecordingActive] = useAtom(isLoopRecordingActiveAtom);
  const [, setDiagnostics] = useAtom(simulationDiagnosticsAtom);
  const [targetLoops] = useAtom(targetLoopsCountAtom);
  const [intervalMs] = useAtom(autoRandomIntervalMsAtom);

  const p5ContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const recorderRef = useRef<VideoRecorderManager | null>(null);
  const simulationRef = useRef<DeflatingSphereSimulation>(
    new DeflatingSphereSimulation(),
  );

  const paramsRef = useRef(params);
  const randomTargetsRef = useRef(randomTargets);
  const targetLoopsRef = useRef(targetLoops);
  const intervalMsRef = useRef(intervalMs);

  const loopTimerRef = useRef<{
    timeouts: ReturnType<typeof setTimeout>[];
    intervalId?: ReturnType<typeof setInterval>;
  }>({ timeouts: [] });

  const clearLoopTimers = () => {
    for (const t of loopTimerRef.current.timeouts) clearTimeout(t);
    loopTimerRef.current.timeouts = [];
    if (loopTimerRef.current.intervalId) {
      clearInterval(loopTimerRef.current.intervalId);
      loopTimerRef.current.intervalId = undefined;
    }
  };

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    randomTargetsRef.current = randomTargets;
  }, [randomTargets]);

  useEffect(() => {
    targetLoopsRef.current = targetLoops;
  }, [targetLoops]);

  useEffect(() => {
    intervalMsRef.current = intervalMs;
  }, [intervalMs]);

  useEffect(() => {
    return () => clearLoopTimers();
  }, []);

  const {
    handleParamChange,
    handleApplyPalette,
    handlePickRandomPalette,
    handleShufflePaletteColors,
    handleGenerateGradientTheme,
    randomizeSelectedParameters,
    handleUndo,
    handleRedo,
    handleImportJson,
    handleExportJson,
  } = useSketchHandlers(p5InstanceRef);

  const handleStartRecord = async () => {
    if (recorderRef.current) {
      clearLoopTimers();
      setIsLoopRecordingActive(false);
      await recorderRef.current.startRecording();
    }
  };

  const handleStopRecord = async () => {
    clearLoopTimers();
    setIsLoopRecordingActive(false);
    if (recorderRef.current) {
      await recorderRef.current.stopRecording();
    }
  };

  const handleStopNLoopRecord = async () => {
    clearLoopTimers();
    setIsLoopRecordingActive(false);
    setIsAutoRandomActive(false);
    if (recorderRef.current) {
      const N = targetLoopsRef.current;
      const T = intervalMsRef.current;
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
      const base = `deflating-spheres_${ts}_nloop_${N}x${T}ms`;
      await recorderRef.current.stopRecording(`${base}.mp4`);
      exportJsonSettings(
        paramsRef.current,
        `${base}`,
        randomTargetsRef.current,
      );
    }
  };

  const handleStartNLoopRecord = async () => {
    if (!recorderRef.current) return;

    clearLoopTimers();
    setIsAutoRandomActive(false);

    const N = targetLoopsRef.current;
    const T = intervalMsRef.current;

    setIsLoopRecordingActive(true);
    setRecordingState({
      isRecording: true,
      elapsedSeconds: 0,
      isLoopMode: true,
      currentLoop: 1,
      totalLoops: N,
      loopIntervalMs: T,
    });

    const success = await recorderRef.current.startRecording();
    if (!success) {
      setIsLoopRecordingActive(false);
      return;
    }

    randomizeSelectedParameters();

    const startTime = performance.now();

    const timerId = setInterval(() => {
      const elapsedMs = performance.now() - startTime;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const currLoop = Math.min(N, Math.floor(elapsedMs / T) + 1);
      setRecordingState((prev) => ({
        ...prev,
        isRecording: true,
        elapsedSeconds: elapsedSec,
        isLoopMode: true,
        currentLoop: currLoop,
        totalLoops: N,
        loopIntervalMs: T,
      }));
    }, 100);
    loopTimerRef.current.intervalId = timerId;

    for (let k = 1; k < N; k++) {
      const timeout = setTimeout(() => {
        randomizeSelectedParameters();
      }, k * T);
      loopTimerRef.current.timeouts.push(timeout);
    }

    const finalTimeout = setTimeout(async () => {
      await handleStopNLoopRecord();
    }, N * T);
    loopTimerRef.current.timeouts.push(finalTimeout);
  };

  const handleExportJpg = () => {
    if (p5InstanceRef.current) {
      exportHighResImage(
        p5InstanceRef.current,
        paramsRef.current,
        2880,
        2880,
        randomTargetsRef.current,
        simulationRef.current,
      );
    }
  };

  const handleExportSvg = () => {
    if (p5InstanceRef.current) {
      exportSvgGraphics(
        p5InstanceRef.current,
        paramsRef.current,
        1920,
        1920,
        simulationRef.current,
      );
    }
  };

  useKeyboardShortcuts({
    onRandomizeAll: randomizeSelectedParameters,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onTogglePanel: () => setIsPanelOpen((prev) => !prev),
    onStartRecord: handleStartRecord,
    onStopRecord: handleStopRecord,
    onExportImage: handleExportJpg,
  });

  useWheelRangeSlider();

  // p5 Sketch Lifecycle
  useEffect(() => {
    if (!p5ContainerRef.current) return;

    let prevBuffer: p5.Graphics | null = null;
    let currentBuffer: p5.Graphics | null = null;
    let transitionStartTime = 0;
    let lastRenderKey = "";
    let prevParticleCount = 0;
    let prevCenterColor: number[] = [0, 0, 0];

    const sketch = (p: p5) => {
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        if (p5ContainerRef.current) {
          canvas.parent(p5ContainerRef.current);
        }
        p.pixelDensity(window.devicePixelRatio || 1);
        p.frameRate(60);

        const canvasElement = canvas.elt as HTMLCanvasElement;
        recorderRef.current = new VideoRecorderManager(
          canvasElement,
          (recording, elapsedSec) => {
            setRecordingState({
              isRecording: recording,
              elapsedSeconds: elapsedSec,
            });
          },
        );

        prevBuffer = p.createGraphics(p.windowWidth, p.windowHeight);
        currentBuffer = p.createGraphics(p.windowWidth, p.windowHeight);
        simulationRef.current.reset();
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        if (prevBuffer)
          prevBuffer.resizeCanvas(p.windowWidth, p.windowHeight);
        if (currentBuffer)
          currentBuffer.resizeCanvas(p.windowWidth, p.windowHeight);
        const canvasEl = p5ContainerRef.current?.querySelector("canvas");
        if (recorderRef.current && canvasEl) {
          recorderRef.current.setCanvas(canvasEl);
        }
      };

      p.draw = () => {
        const currentParams = paramsRef.current;
        const width = p.width;
        const height = p.height;

        if (!currentBuffer || !prevBuffer) return;

        const currentKey = `${currentParams.randomSeedValue}_${currentParams.paletteIndex}_${currentParams.useSingleColorMode}_${currentParams.useGradientTheme}_${currentParams.centerRadius}_${currentParams.emissionIntervalFrames}`;

        // Trigger transition if key changed
        if (lastRenderKey !== "" && currentKey !== lastRenderKey) {
          if (currentParams.transitionType !== "none") {
            prevBuffer.clear();
            prevBuffer.image(currentBuffer, 0, 0);
            transitionStartTime = p.millis();
          }
        }
        lastRenderKey = currentKey;

        // 1. Update simulation physics & particles
        const stats = simulationRef.current.update(
          currentParams,
          width,
          height,
          (x, y, z) => p.noise(x, y, z),
          PALETTES,
        );

        // Update diagnostics for HUD
        setDiagnostics({
          fps: Math.round(p.frameRate()),
          activeParticles: stats.activeCount,
          centerRadius: stats.currentParentRadius,
          optInEffectsActive: [
            currentParams.enableBreathingPulse,
            currentParams.enableReflectionHighlight,
            currentParams.enableGlowBokeh,
            currentParams.enableBorderOutline,
            currentParams.enableCenterCoreDot,
          ].filter(Boolean).length,
        });

        // 2. Render to currentBuffer
        const bgColor = getResolvedBackgroundColorHex(
          currentParams,
          PALETTES,
        );
        currentBuffer.background(bgColor);

        simulationRef.current.render(
          currentBuffer,
          width,
          height,
          currentParams,
          PALETTES,
          1.0,
          stats.currentParentRadius,
        );

        // 三原色モード時の中心ピクセル色トラッキング (debugMode時のみ実測検証)
        if (
          currentParams.enableColorMixingSystem &&
          currentParams.debugMode
        ) {
          const cx = Math.floor(width / 2);
          const cy = Math.floor(height / 2);
          const rawPix = currentBuffer.get(cx, cy);
          const currentCenterColor = [rawPix[0], rawPix[1], rawPix[2]];

          if (stats.activeCount > prevParticleCount) {
            const diff = [
              currentCenterColor[0] - prevCenterColor[0],
              currentCenterColor[1] - prevCenterColor[1],
              currentCenterColor[2] - prevCenterColor[2],
            ];
            const isFlickering =
              Math.abs(diff[0]) > 4 ||
              Math.abs(diff[1]) > 4 ||
              Math.abs(diff[2]) > 4;
            console.log(
              `%c[ColorTracking] 子円放出検知! 放出直前: rgb(${prevCenterColor.join(",")}) -> 放出直後: rgb(${currentCenterColor.join(",")}) | 差分(Δ): [${diff.join(",")}] ${isFlickering ? "⚠️ チカつき検知!" : "✅ 変化なし (完全安定)"}`,
              isFlickering
                ? "color: #ef4444; font-weight: bold; font-size: 11px;"
                : "color: #10b981; font-weight: bold; font-size: 11px;",
            );
          }

          prevParticleCount = stats.activeCount;
          prevCenterColor = currentCenterColor;
        }

        // 3. Apply visual texture & print effects to currentBuffer
        if (currentParams.showGrain) {
          renderGrainOverlay(
            currentBuffer,
            width,
            height,
            currentParams.grainIntensity,
          );
        }

        if (currentParams.showRiso) {
          renderRisoPrintOverlay(
            p,
            currentBuffer,
            width,
            height,
            currentParams.risoOffsetPx,
            currentParams.risoIntensity,
          );
        }

        if (currentParams.showCmyk) {
          renderCmykPrintOverlay(
            p,
            currentBuffer,
            width,
            height,
            currentParams.cmykOffsetFactor,
            currentParams.cmykIntensity,
            bgColor,
          );
        }

        if (currentParams.showHalftone) {
          renderHalftoneScreenOverlay(
            p,
            currentBuffer,
            width,
            height,
            currentParams.halftoneSize,
            currentParams.halftoneAngle,
          );
        }

        if (currentParams.showDithering) {
          renderDitheringOverlay(
            p,
            currentBuffer,
            width,
            height,
            currentParams.ditheringScale,
            currentParams.ditheringLevels,
          );
        }

        if (currentParams.showInkBleed) {
          renderInkBleedOverlay(
            p,
            currentBuffer,
            width,
            height,
            currentParams.inkBleedAmount,
            currentParams.inkBleedRoughness,
          );
        }

        if (currentParams.showPaperTexture) {
          renderPaperTextureOverlay(
            p,
            currentBuffer,
            width,
            height,
            currentParams.paperRoughness,
            currentParams.paperColorDensity,
          );
        }

        if (currentParams.showPeripheralBlur) {
          renderPeripheralBlurOverlay(
            p,
            currentBuffer,
            width,
            height,
            currentParams.peripheralBlurAmount,
            currentParams.peripheralBlurRadius,
          );
        }

        if (currentParams.showVignette) {
          renderVignetteOverlay(
            p,
            currentBuffer,
            width,
            height,
            currentParams.vignetteIntensity,
            currentParams.vignetteRadius,
          );
        }

        // 4. Render to canvas with transition if active
        p.clear();
        const transitionProgress =
          currentParams.transitionDurationMs > 0
            ? Math.min(
                1.0,
                (p.millis() - transitionStartTime) /
                  currentParams.transitionDurationMs,
              )
            : 1.0;

        if (
          currentParams.transitionType !== "none" &&
          transitionProgress < 1.0
        ) {
          renderTransition(
            p,
            prevBuffer,
            currentBuffer,
            transitionProgress,
            currentParams.transitionType,
          );
        } else {
          p.image(currentBuffer, 0, 0);
        }
      };
    };

    const instance = new p5(sketch);
    p5InstanceRef.current = instance;

    return () => {
      instance.remove();
      p5InstanceRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* p5 Canvas Container */}
      <div
        ref={p5ContainerRef}
        className="absolute inset-0 w-full h-full z-0 cursor-crosshair"
      />

      {/* Floating Control Panel */}
      <ControlPanel
        onParamChange={handleParamChange}
        onApplyPalette={handleApplyPalette}
        onPickRandomPalette={handlePickRandomPalette}
        onShufflePaletteColors={handleShufflePaletteColors}
        onGenerateGradientTheme={handleGenerateGradientTheme}
        onRandomizeAll={randomizeSelectedParameters}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportJpg={handleExportJpg}
        onExportSvg={handleExportSvg}
        onStartRecord={handleStartRecord}
        onStopRecord={handleStopRecord}
        onImportJson={handleImportJson}
        onExportJson={handleExportJson}
        onStartNLoopRecord={handleStartNLoopRecord}
        onStopNLoopRecord={handleStopNLoopRecord}
      />

      {/* Recording Status Overlay */}
      <RecordingOverlay onStopRecord={handleStopRecord} />

      {/* Debug HUD Overlay */}
      <DebugOverlay />
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
