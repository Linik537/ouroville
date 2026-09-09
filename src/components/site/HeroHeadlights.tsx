import { useEffect, useRef, useState } from "react";

const IMG_W = 1920;
const IMG_H = 1088;
const DOWN_TRIGGER_PX = 10;
const UP_TRIGGER_PX = 300;

// Headlight bar positions as fractions of the source image (two LED bars per side).
const LIGHTS = [
  { left: 0.404, top: 0.534, width: 0.156, height: 0.02, rotate: 5 },
  { left: 0.404, top: 0.566, width: 0.156, height: 0.02, rotate: 5 },
  { left: 0.869, top: 0.531, width: 0.045, height: 0.02, rotate: -7 },
  { left: 0.869, top: 0.563, width: 0.045, height: 0.02, rotate: -7 },
];

/**
 * Overlay that matches the hero image's object-cover rendering box and
 * flashes white over each headlight twice whenever the user crosses a
 * scroll threshold (down past 10px, or back up past 300px).
 */
export function HeroHeadlights() {
  const flashRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const belowRef = useRef(false);
  const aboveRef = useRef(true);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const initialY = window.scrollY;
    belowRef.current = initialY > DOWN_TRIGGER_PX;
    aboveRef.current = initialY < UP_TRIGGER_PX;
    lastScrollRef.current = initialY;
    let frame = 0;

    const flash = () => {
      const layer = flashRef.current;
      if (!layer) return;
      animationRef.current?.cancel();
      animationRef.current = layer.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: 1, offset: 0.015 },
          { opacity: 1, offset: 0.09 },
          { opacity: 0.4, offset: 0.17 },
          { opacity: 0.2, offset: 0.215 },
          { opacity: 0, offset: 0.25 },
          { opacity: 0, offset: 0.27 },
          { opacity: 1, offset: 0.285 },
          { opacity: 1, offset: 0.36 },
          { opacity: 0.4, offset: 0.44 },
          { opacity: 0.2, offset: 0.485 },
          { opacity: 0, offset: 0.52 },
          { opacity: 0, offset: 1 },
        ],
        { duration: 650, easing: "linear", fill: "both" },
      );
    };

    const evaluateScroll = () => {
      frame = 0;
      const y = window.scrollY;
      const nowBelow = y > DOWN_TRIGGER_PX;
      const nowAbove = y < UP_TRIGGER_PX;

      if (nowBelow && !belowRef.current && y > lastScrollRef.current) flash();
      if (nowAbove && !aboveRef.current && y < lastScrollRef.current) flash();

      belowRef.current = nowBelow;
      aboveRef.current = nowAbove;
      lastScrollRef.current = y;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(evaluateScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      animationRef.current?.cancel();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <CoverBox>
        <div ref={flashRef} className="hero-headlights-flash absolute inset-0">
          {LIGHTS.map((l, i) => (
            <div
              key={i}
              className="hero-headlight absolute rounded-full"
              style={{
                left: `${l.left * 100}%`,
                top: `${l.top * 100}%`,
                width: `${l.width * 100}%`,
                height: `${l.height * 100}%`,
                transform: `rotate(${l.rotate}deg)`,
              }}
            />
          ))}
        </div>
      </CoverBox>
    </div>
  );
}

function CoverBox({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const update = () => {
      const cw = parent.clientWidth;
      const ch = parent.clientHeight;
      const scale = Math.max(cw / IMG_W, ch / IMG_H);
      const w = IMG_W * scale;
      const h = IMG_H * scale;
      setBox({ w, h, x: (cw - w) / 2, y: (ch - h) / 2 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {box && (
        <div className="absolute" style={{ width: box.w, height: box.h, left: box.x, top: box.y }}>
          {children}
        </div>
      )}
    </div>
  );
}
