import { useEffect, useRef, useState } from "react";
import { mobileKeys } from "./inputState";

const BASE_R = 44;   // joystick base radius (px)
const THUMB_R = 22;  // thumb radius (px)
const MAX_DIST = 38; // max thumb travel from center (px)
const THRESHOLD = 0.35; // fraction of MAX_DIST to activate a direction

export const MobileControls = ({ onRestart }: { onRestart?: () => void }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const activeTouchId = useRef<number | null>(null);
  const baseCenter = useRef({ x: 0, y: 0 });
  const [portrait, setPortrait] = useState(false);

  // Portrait detection
  useEffect(() => {
    const check = () => setPortrait(window.innerHeight > window.innerWidth);
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    const getCenter = () => {
      const r = base.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    const updateStick = (cx: number, cy: number) => {
      const { x, y } = baseCenter.current;
      let dx = cx - x;
      let dy = cy - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MAX_DIST) { dx = (dx / dist) * MAX_DIST; dy = (dy / dist) * MAX_DIST; }
      if (thumbRef.current) thumbRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      const fx = dx / MAX_DIST;
      const fy = dy / MAX_DIST;
      mobileKeys.forward  = fy < -THRESHOLD;
      mobileKeys.backward = fy >  THRESHOLD;
      mobileKeys.left     = fx < -THRESHOLD;
      mobileKeys.right    = fx >  THRESHOLD;
    };

    const resetStick = () => {
      if (thumbRef.current) thumbRef.current.style.transform = "translate(0px, 0px)";
      mobileKeys.forward = mobileKeys.backward = mobileKeys.left = mobileKeys.right = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (activeTouchId.current !== null) return;
      const touch = e.changedTouches[0];
      activeTouchId.current = touch.identifier;
      baseCenter.current = getCenter();
      updateStick(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === activeTouchId.current) updateStick(touch.clientX, touch.clientY);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === activeTouchId.current) { activeTouchId.current = null; resetStick(); }
      }
    };

    base.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      base.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      resetStick();
    };
  }, []);

  return (
    <>
      {/* Portrait warning — only on touch devices in portrait */}
      {portrait && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 lg:hidden">
          <div className="text-5xl mb-4">📱</div>
          <p className="text-white text-xl font-bold">Rotate your device</p>
          <p className="text-white/60 text-sm mt-1">Play in landscape for controls</p>
        </div>
      )}

      {/* Joystick — hidden on large screens (desktop), shown on touch devices */}
      <div className="pointer-events-none fixed inset-0 z-30 lg:hidden">
        <div
          ref={baseRef}
          className="pointer-events-auto absolute flex items-center justify-center"
          style={{
            bottom: 36,
            left: 36,
            width: BASE_R * 2,
            height: BASE_R * 2,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "2px solid rgba(255,255,255,0.22)",
          }}
        >
          <div
            ref={thumbRef}
            style={{
              width: THUMB_R * 2,
              height: THUMB_R * 2,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.30)",
              border: "2px solid rgba(255,255,255,0.55)",
              willChange: "transform",
            }}
          />
        </div>

        {/* Restart button — bottom right */}
        {onRestart && (
          <button
            className="pointer-events-auto absolute text-white/50 text-sm font-bold tracking-widest uppercase"
            style={{ bottom: 44, right: 36 }}
            onTouchEnd={(e) => { e.preventDefault(); onRestart(); }}
          >
            Restart
          </button>
        )}
      </div>
    </>
  );
};
