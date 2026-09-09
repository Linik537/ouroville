import { type ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { PLACEHOLDER_CAR } from "@/lib/supabase";

export function ResilientImage({ src, onError, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const originalSrc = typeof src === "string" ? src : "";
  const [attempt, setAttempt] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setAttempt(0);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [originalSrc]);

  const displayedSrc =
    attempt === 0
      ? originalSrc
      : attempt <= 3 && originalSrc && !originalSrc.startsWith("data:")
        ? `${originalSrc}${originalSrc.includes("?") ? "&" : "?"}retry=${attempt}`
        : PLACEHOLDER_CAR;

  return (
    <img
      {...props}
      src={displayedSrc}
      onError={(event) => {
        onError?.(event);
        if (displayedSrc === PLACEHOLDER_CAR || timer.current !== null) return;
        timer.current = window.setTimeout(
          () => {
            timer.current = null;
            setAttempt((current) => current + 1);
          },
          Math.min(400 * 2 ** attempt, 1_600),
        );
      }}
    />
  );
}
