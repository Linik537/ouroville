import { useEffect, useRef, useState } from "react";

const IMG_W = 1920;
const IMG_H = 1088;
const DOWN_TRIGGER_PX = 10;
const UP_OFFSET_PX = 10;

// Headlight bar positions as fractions of the source image (two LED bars per side).
const LIGHTS = [
  { left: 0.398, top: 0.526, width: 0.156, height: 0.02 },
  { left: 0.398, top: 0.558, width: 0.156, height: 0.02 },
  { left: 0.874, top: 0.526, width: 0.045, height: 0.02 },
  { left: 0.874, top: 0.558, width: 0.045, height: 0.02 },
];

function getHeaderHeight() {
  const header = document.querySelector("header");
  if (!header) return 104;
  const rect = header.getBoundingClientRect();
  return Math.round(rect.height);
}

/**
 * Overlay that matches the hero image's object-cover rendering box and
 * flashes white over each headlight twice whenever the user crosses a
 * scroll threshold (down past 10px, or back up to 10px from the header bottom).
 */
export function HeroHeadlights() {
  const ref = useRef<HTMLDivElement>(null);
  const [flash, setFlash] = useState(0);
  const belowRef = useRef(false);
  const aboveRef = useRef(true);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const headerHeight = getHeaderHeight();
      const upTrigger = Math.max(DOWN_TRIGGER_PX, headerHeight - UP_OFFSET_PX);

      const nowBelow = y > DOWN_TRIGGER_PX;
      const nowAbove = y < upTrigger;

      if (nowBelow && !belowRef.current && y > lastScrollRef.current) {
        setFlash((f) => f + 1);
      }
      if (nowAbove && !aboveRef.current && y < lastScrollRef.current) {
        setFlash((f) => f + 1);
      }

      belowRef.current = nowBelow;
      aboveRef.current = nowAbove;
      lastScrollRef.current = y;
    };

    const onResize = () => {
      lastScrollRef.current = window.scrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (flash === 0) return;
    const t = setTimeout(() => setFlash(0), 900);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <CoverBox>
        {flash > 0 &&
          LIGHTS.map((l, i) => (
            <div
              key={`${flash}-${i}`}
              className="hero-headlight absolute rounded-full"
              style={{
                left: `${l.left * 100}%`,
                top: `${l.top * 100}%`,
                width: `${l.width * 100}%`,
                height: `${l.height * 100}%`,
              }}
            />
          ))}
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
        <div
          className="absolute"
          style={{ width: box.w, height: box.h, left: box.x, top: box.y }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
