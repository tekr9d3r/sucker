import { useEffect, useRef, useState } from "react";
import { mobileKeys } from "./inputState";

const BASE_R = 44;
const THUMB_R = 22;
const MAX_DIST = 38;
const THRESHOLD = 0.35;

type AnyDoc = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};
type AnyEl = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

const requestFullscreen = () => {
  const el = document.documentElement as AnyEl;
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
};

const exitFullscreen = () => {
  const doc = document as AnyDoc;
  if (doc.exitFullscreen) return doc.exitFullscreen();
  if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
};

const isFullscreen = () => {
  const doc = document as AnyDoc;
  return !!(doc.fullscreenElement || doc.webkitFullscreenElement);
};

export const MobileControls = ({ onRestart }: { onRestart?: () => void }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const activeTouchId = useRef<number | null>(null);
  const baseCenter = useRef({ x: 0, y: 0 });
  const [portrait, setPortrait] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Portrait + fullscreen state
  useEffect(() => {
    const checkOrientation = () => setPortrait(window.innerHeight > window.innerWidth);
    const checkFullscreen = () => setFullscreen(isFullscreen());
    checkOrientation();
    checkFullscreen();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
    };
  }, []);

  // Joystick touch handling
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

  const toggleFullscreen = () => {
    if (isFullscreen()) exitFullscreen();
    else requestFullscreen();
  };

  return (
    <>
      {/* Portrait warning */}
      {portrait && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 lg:hidden">
          <div className="text-5xl mb-4">📱</div>
          <p className="text-white text-xl font-bold">Rotate your device</p>
          <p className="text-white/60 text-sm mt-1">Play in landscape for controls</p>
        </div>
      )}

      {/* Mobile overlay — hidden on desktop */}
      <div className="pointer-events-none fixed inset-0 z-30 lg:hidden">

        {/* Joystick — bottom left */}
        <div
          ref={baseRef}
          className="pointer-events-auto absolute flex items-center justify-center"
          style={{
            bottom: 36, left: 36,
            width: BASE_R * 2, height: BASE_R * 2,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "2px solid rgba(255,255,255,0.22)",
          }}
        >
          <div
            ref={thumbRef}
            style={{
              width: THUMB_R * 2, height: THUMB_R * 2,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.30)",
              border: "2px solid rgba(255,255,255,0.55)",
              willChange: "transform",
            }}
          />
        </div>

        {/* Fullscreen button — bottom right */}
        <button
          className="pointer-events-auto absolute flex items-center justify-center rounded-full"
          style={{
            bottom: 36, right: 36,
            width: 48, height: 48,
            background: "rgba(255,255,255,0.10)",
            border: "2px solid rgba(255,255,255,0.25)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 20,
          }}
          onTouchEnd={(e) => { e.preventDefault(); toggleFullscreen(); }}
          onClick={toggleFullscreen}
          aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {fullscreen ? "⤓" : "⤢"}
        </button>

        {/* Restart button — above fullscreen button */}
        {onRestart && (
          <button
            className="pointer-events-auto absolute text-white/45 text-xs font-bold tracking-widest uppercase"
            style={{ bottom: 96, right: 36 }}
            onTouchEnd={(e) => { e.preventDefault(); onRestart(); }}
          >
            Restart
          </button>
        )}
      </div>
    </>
  );
};
