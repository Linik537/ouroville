import { useEffect } from "react";
import Lenis from "lenis";
import { SCROLL_TO_TOP_EVENT } from "@/lib/scroll";

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    const resetScroll = () => lenis.scrollTo(0, { immediate: true, force: true });

    window.addEventListener(SCROLL_TO_TOP_EVENT, resetScroll);

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(SCROLL_TO_TOP_EVENT, resetScroll);
      lenis.destroy();
    };
  }, []);

  return null;
}
