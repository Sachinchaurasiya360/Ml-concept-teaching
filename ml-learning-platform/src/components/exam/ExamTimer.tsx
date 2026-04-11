"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

export interface ExamTimerProps {
  seconds: number;
  onExpire: () => void;
}

function format(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Countdown timer driven by a single `setInterval`. The `onExpire` callback
 * is held in a ref so updates from parent props don't reset the timer loop.
 * Pulses red during the final two minutes.
 */
export default function ExamTimer({ seconds, onExpire }: ExamTimerProps) {
  const [remaining, setRemaining] = useState<number>(seconds);
  const expireRef = useRef<() => void>(onExpire);
  const firedRef = useRef<boolean>(false);

  // Keep the callback ref current without resetting the interval
  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setRemaining(seconds);
    firedRef.current = false;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          if (!firedRef.current) {
            firedRef.current = true;
            // Defer so React doesn't complain about setState-in-setState paths
            queueMicrotask(() => expireRef.current());
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [seconds]);

  const critical = remaining <= 120; // last two minutes

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-foreground font-hand font-bold ${critical ? "animate-pulse" : ""}`}
      style={{
        background: critical ? "var(--accent-coral)" : "var(--accent-yellow)",
        boxShadow: "3px 3px 0 #2b2a35",
      }}
      aria-live="polite"
      role="timer"
    >
      <Clock className="w-4 h-4" />
      <span className="tabular-nums text-base">{format(remaining)}</span>
    </div>
  );
}
