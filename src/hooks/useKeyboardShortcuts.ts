import { useEffect } from "react";

interface Handlers {
  onRandomizeAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePanel: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onExportImage: () => void;
}

/**
 * Registers global keyboard shortcuts for the studio:
 * - Space: Randomize
 * - H: Toggle Panel
 * - U: Undo
 * - Ctrl+Z: Undo / Ctrl+Shift+Z or Ctrl+Y: Redo
 * - R: Start Record / S: Stop Record
 * - P: Export High-Res PNG
 */
export function useKeyboardShortcuts({
  onRandomizeAll,
  onUndo,
  onRedo,
  onTogglePanel,
  onStartRecord,
  onStopRecord,
  onExportImage,
}: Handlers): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        onRandomizeAll();
      } else if (e.key === "h" || e.key === "H") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onTogglePanel();
        }
      } else if (e.key === "u" || e.key === "U") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onUndo();
        }
      } else if (e.key === "r" || e.key === "R") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onStartRecord();
        }
      } else if (e.key === "s" || e.key === "S") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onStopRecord();
        }
      } else if (e.key === "p" || e.key === "P") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onExportImage();
        }
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" || e.key === "Z") {
          if (e.shiftKey) {
            e.preventDefault();
            onRedo();
          } else {
            e.preventDefault();
            onUndo();
          }
        } else if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          onRedo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onRandomizeAll,
    onUndo,
    onRedo,
    onTogglePanel,
    onStartRecord,
    onStopRecord,
    onExportImage,
  ]);
}
