import { useAtom } from "jotai";
import type p5 from "p5";
import type React from "react";
import { useEffect, useRef } from "react";
import { PALETTES } from "../constants/palettes";
import {
  type SketchConfigFile,
  exportJsonSettings,
} from "../core/exporter";
import {
  autoRandomIntervalMsAtom,
  historyPointerAtom,
  historyStackAtom,
  isAutoRandomActiveAtom,
  isPanelOpenAtom,
  randomTargetsAtom,
  sketchParamsAtom,
} from "../state/sketchStore";
import type { SketchParamValue, SketchParameters } from "../types/sketch";
import { buildRandomizedParameters } from "../utils/randomizerUtils";

interface UseSketchHandlersResult {
  handleParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
  handleApplyPalette: (paletteIndex: number) => void;
  handlePickRandomPalette: () => void;
  handleShufflePaletteColors: () => void;
  handleGenerateGradientTheme: (baseHex: string) => void;
  randomizeSelectedParameters: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleImportJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleExportJson: () => void;
}

export function useSketchHandlers(
  p5InstanceRef: React.RefObject<p5 | null>,
): UseSketchHandlersResult {
  const [params, setParams] = useAtom(sketchParamsAtom);
  const [historyStack, setHistoryStack] = useAtom(historyStackAtom);
  const [historyPointer, setHistoryPointer] = useAtom(historyPointerAtom);
  useAtom(isPanelOpenAtom);

  const [randomTargets, setRandomTargets] = useAtom(randomTargetsAtom);
  const [intervalMs] = useAtom(autoRandomIntervalMsAtom);
  const [isAutoRandomActive] = useAtom(isAutoRandomActiveAtom);

  const paramsRef = useRef(params);
  const randomTargetsRef = useRef(randomTargets);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    randomTargetsRef.current = randomTargets;
  }, [randomTargets]);

  const pushHistory = (newParams: SketchParameters) => {
    setHistoryStack((prev) => {
      const sliced = prev.slice(0, historyPointer + 1);
      const updated = [...sliced, JSON.parse(JSON.stringify(newParams))];
      if (updated.length > 50) updated.shift();
      return updated;
    });
    setHistoryPointer((prev) => Math.min(prev + 1, 49));
  };

  const handleParamChange = (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => {
    setParams((prev) => {
      const next = { ...prev, [key]: val };
      pushHistory(next);
      return next;
    });
  };

  const handleApplyPalette = (paletteIndex: number) => {
    const pal = PALETTES[paletteIndex] || PALETTES[0];
    const colors = pal.colors;

    setParams((prev) => {
      const next: SketchParameters = {
        ...prev,
        paletteIndex,
        useSingleColorMode: false,
        useGradientTheme: false,
        backgroundColorIndex: 0,
        backgroundColor: colors[0]?.hex || "#FFFFFF",
        primaryColor: colors[1]?.hex || "#000000",
        secondaryColor: colors[2]?.hex || colors[1]?.hex || "#888888",
        accentColor: colors[3]?.hex || colors[0]?.hex || "#FF0055",
      };
      pushHistory(next);
      return next;
    });
  };

  const handlePickRandomPalette = () => {
    const palIdx = Math.floor(Math.random() * PALETTES.length);
    handleApplyPalette(palIdx);
  };

  const handleShufflePaletteColors = () => {
    const pal = PALETTES[params.paletteIndex] || PALETTES[0];
    const shuffled = [...pal.colors].sort(() => Math.random() - 0.5);

    setParams((prev) => {
      const next: SketchParameters = {
        ...prev,
        backgroundColor: shuffled[0]?.hex || "#FFFFFF",
        primaryColor: shuffled[1]?.hex || "#000000",
        secondaryColor: shuffled[2]?.hex || shuffled[1]?.hex || "#888888",
        accentColor: shuffled[3]?.hex || shuffled[0]?.hex || "#FF0055",
      };
      pushHistory(next);
      return next;
    });
  };

  const handleGenerateGradientTheme = (baseHex: string) => {
    setParams((prev) => {
      const next: SketchParameters = {
        ...prev,
        useGradientTheme: true,
        useSingleColorMode: false,
        gradientBaseColor: baseHex,
      };
      pushHistory(next);
      return next;
    });
  };

  const randomizeSelectedParameters = () => {
    const { nextParams } = buildRandomizedParameters(
      paramsRef.current,
      randomTargetsRef.current,
      p5InstanceRef.current || undefined,
    );

    setParams(nextParams);
    pushHistory(nextParams);
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const nextPointer = historyPointer - 1;
      const targetParams = historyStack[nextPointer];
      setHistoryPointer(nextPointer);
      setParams(JSON.parse(JSON.stringify(targetParams)));
    }
  };

  const handleRedo = () => {
    if (historyPointer < historyStack.length - 1) {
      const nextPointer = historyPointer + 1;
      const targetParams = historyStack[nextPointer];
      setHistoryPointer(nextPointer);
      setParams(JSON.parse(JSON.stringify(targetParams)));
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text) as SketchConfigFile;
        if (data.params) {
          setParams(data.params);
          pushHistory(data.params);
        }
        if (data.randomTargets) {
          setRandomTargets(data.randomTargets);
        }
      } catch (err) {
        console.error("Failed to import JSON file", err);
      }
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    exportJsonSettings(params, undefined, randomTargets);
  };

  // Auto random interval loop
  useEffect(() => {
    if (!isAutoRandomActive) return;

    const timer = setInterval(() => {
      randomizeSelectedParameters();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAutoRandomActive, intervalMs]);

  return {
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
  };
}
