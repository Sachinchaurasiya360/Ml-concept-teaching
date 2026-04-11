"use client";

import { Flame } from "lucide-react";
import { useGamification } from "../../utils/gamification";

interface StreakFlameProps {
  compact?: boolean;
}

export default function StreakFlame({ compact = false }: StreakFlameProps) {
  const g = useGamification();
  const n = g.streak.current;
  const active = n > 0;

  if (compact) {
    return (
      <div
        className="flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground font-hand text-[11px] font-bold"
        style={{
          background: active ? "#ffe3e3" : "#f3efe6",
          boxShadow: "2px 2px 0 #2b2a35",
        }}
      >
        <Flame
          className="w-3 h-3"
          style={{ color: active ? "var(--accent-coral)" : "#b8b4c0" }}
        />
        {n}
      </div>
    );
  }

  return (
    <div className="card-sketchy p-4 flex items-center gap-3" style={{ background: active ? "#ffe3e3" : "#f3efe6" }}>
      <div
        className="w-12 h-12 rounded-full border-2 border-foreground flex items-center justify-center"
        style={{ background: active ? "var(--accent-coral)" : "#d1cdd8", boxShadow: "2px 2px 0 #2b2a35" }}
      >
        <Flame className="w-6 h-6" style={{ color: "#fff" }} />
      </div>
      <div className="flex-1">
        <p className="font-hand text-2xl font-bold text-foreground leading-none">{n}</p>
        <p className="font-hand text-[11px] text-muted-foreground uppercase tracking-wider">Day streak</p>
      </div>
      {g.streak.longest > n && (
        <div className="text-right">
          <p className="font-hand text-sm font-bold text-foreground">{g.streak.longest}</p>
          <p className="font-hand text-[10px] text-muted-foreground">longest</p>
        </div>
      )}
    </div>
  );
}
