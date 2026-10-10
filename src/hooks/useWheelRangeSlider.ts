import { useEffect } from "react";

/**
 * Registers a global wheel event listener for range sliders (input[type="range"]).
 * When hovering over any slider, mouse wheel scrolling increments or decrements the value by step
 * and prevents the background/panel from scrolling.
 */
export function useWheelRangeSlider(): void {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        'input[type="range"]',
      ) as HTMLInputElement | null;

      if (!target || target.disabled) return;

      // Prevent page/panel scrolling while adjusting slider value
      e.preventDefault();

      const min = target.min !== "" ? Number.parseFloat(target.min) : 0;
      const max = target.max !== "" ? Number.parseFloat(target.max) : 100;
      const stepAttr = target.step;
      const step =
        stepAttr && stepAttr !== "any" ? Number.parseFloat(stepAttr) : 1;
      const currentVal = Number.parseFloat(target.value);

      if (Number.isNaN(currentVal)) return;

      // Scroll up (deltaY < 0) increases value; scroll down (deltaY > 0) decreases value
      const direction = e.deltaY < 0 ? 1 : -1;

      // Determine decimal precision based on step (e.g., 0.1 -> 1, 0.05 -> 2)
      const stepStr = step.toString();
      const decimalPlaces = stepStr.includes(".")
        ? stepStr.split(".")[1].length
        : 0;

      let nextVal = currentVal + direction * step;
      nextVal = Math.min(max, Math.max(min, nextVal));
      if (decimalPlaces > 0) {
        nextVal = Number.parseFloat(nextVal.toFixed(decimalPlaces));
      } else {
        nextVal = Math.round(nextVal);
      }

      if (nextVal !== currentVal) {
        // Use native value setter so React synthetic events pick up the state change
        const valueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;

        if (valueSetter) {
          valueSetter.call(target, String(nextVal));
        } else {
          target.value = String(nextVal);
        }

        // Dispatch input and change events for full framework compatibility
        target.dispatchEvent(new Event("input", { bubbles: true }));
        target.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);
}
