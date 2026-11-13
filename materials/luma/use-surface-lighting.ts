import { useLayoutEffect, useRef } from "react";
export type ScreenLight = {
  /** Right, up and out of the screen, respectively. */
  direction: { x: number; y: number; z: number };
  strength: number;
};

const fixedDirection = 1 / Math.sqrt(3);

/** One upper-left source keeps material, reflection and contact shadow coherent. */
export const fixedSurfaceLight: ScreenLight = {
  direction: { x: -fixedDirection, y: fixedDirection, z: fixedDirection },
  strength: 1,
};

/** Surface rendering only: subscribes to neither location nor device sensors. */
export function useSurfaceLighting(
  host: HTMLElement | null,
  light: ScreenLight | null | undefined,
) {
  const displayed = useRef<ScreenLight>(fixedSurfaceLight);
  const target = useRef<ScreenLight>(fixedSurfaceLight);
  const wake = useRef<(() => void) | null>(null);
  const enabled = light !== undefined;
  const { x, y, z } = light?.direction ?? fixedSurfaceLight.direction;
  const strength = light?.strength ?? fixedSurfaceLight.strength;

  useLayoutEffect(() => {
    target.current = {
      direction: { x, y, z },
      strength: Math.max(0, Math.min(1, strength)),
    };
    wake.current?.();
  }, [x, y, z, strength]);

  useLayoutEffect(() => {
    const element = host;
    if (!element || !enabled) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | undefined;
    let previousTime: number | undefined;

    function paint(value: ScreenLight) {
      // CSS Y points down. A bounded, normalized placement keeps the highlight
      // on the surface even when the source is close to the screen's tangent.
      element?.style.setProperty(
        "--light-x",
        `${50 + value.direction.x * 46}%`,
      );
      element?.style.setProperty(
        "--light-y",
        `${50 - value.direction.y * 46}%`,
      );
      element?.style.setProperty("--light-strength", String(value.strength));
      // Derive every finish from the same smoothed vector. Interpolating an
      // angle separately would take a full turn across the 359°→0° boundary.
      element?.style.setProperty(
        "--light-angle",
        `${(Math.atan2(value.direction.x, value.direction.y) * 180) / Math.PI + 180}deg`,
      );
      element?.style.setProperty(
        "--light-shadow-x",
        String(-value.direction.x),
      );
      element?.style.setProperty("--light-shadow-y", String(value.direction.y));
      element?.style.setProperty(
        "--light-directionality",
        String(Math.hypot(value.direction.x, value.direction.y)),
      );
    }

    function stop() {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      previousTime = undefined;
    }

    function animate(time: number) {
      frame = undefined;
      const current = displayed.current;
      const latest = target.current;
      // A ~100ms time-based filter smooths manual changes and future sensor
      // input without averaging Euler angles across the 359°→0° boundary.
      const step =
        1 - Math.exp(-Math.min(64, time - (previousTime ?? time - 16)) / 100);
      previousTime = time;
      const mix = (from: number, to: number) => from + (to - from) * step;
      const next = {
        direction: {
          x: mix(current.direction.x, latest.direction.x),
          y: mix(current.direction.y, latest.direction.y),
          z: mix(current.direction.z, latest.direction.z),
        },
        strength: mix(current.strength, latest.strength),
      };
      const distance = Math.max(
        Math.abs(next.direction.x - latest.direction.x),
        Math.abs(next.direction.y - latest.direction.y),
        Math.abs(next.direction.z - latest.direction.z),
        Math.abs(next.strength - latest.strength),
      );
      displayed.current = distance < 0.001 ? latest : next;
      paint(displayed.current);
      if (distance >= 0.001) frame = requestAnimationFrame(animate);
      else previousTime = undefined;
    }

    function requestPaint() {
      if (document.visibilityState !== "visible") {
        stop();
        return;
      }
      if (motion.matches) {
        stop();
        displayed.current = fixedSurfaceLight;
        paint(fixedSurfaceLight);
      } else if (frame === undefined) frame = requestAnimationFrame(animate);
    }

    function synchronize() {
      stop();
      requestPaint();
    }

    // Paint a new host before the browser presents it; starting at the fallback
    // would briefly illuminate the wrong side when explicit light is supplied.
    displayed.current = motion.matches ? fixedSurfaceLight : target.current;
    paint(displayed.current);
    // Keep one paint loop alive while targets change. Cancelling it for every
    // sensor frame can skip in-flight paints and repeatedly reset the filter.
    wake.current = requestPaint;
    motion.addEventListener("change", synchronize);
    document.addEventListener("visibilitychange", synchronize);
    return () => {
      stop();
      wake.current = null;
      motion.removeEventListener("change", synchronize);
      document.removeEventListener("visibilitychange", synchronize);
      element.style.removeProperty("--light-x");
      element.style.removeProperty("--light-y");
      element.style.removeProperty("--light-strength");
      element.style.removeProperty("--light-angle");
      element.style.removeProperty("--light-shadow-x");
      element.style.removeProperty("--light-shadow-y");
      element.style.removeProperty("--light-directionality");
    };
  }, [host, enabled]);
}
