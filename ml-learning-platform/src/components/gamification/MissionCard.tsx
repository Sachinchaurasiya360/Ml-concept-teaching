"use client";

import { CheckCircle2, Target, Star, Coins } from "lucide-react";
import type { Mission } from "../../utils/gamification";

interface MissionCardProps {
  mission: Mission;
}

export default function MissionCard({ mission }: MissionCardProps) {
  const pct = Math.min(100, Math.round((mission.progress / mission.target) * 100));
  const done = mission.claimed;

  return (
    <div
      className="card-sketchy p-3 space-y-2"
      style={{ background: done ? "#e8fff5" : "#fff" }}
    >
      <div className="flex items-start gap-2">
        {done ? (
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--accent-mint)" }} />
        ) : (
          <Target className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--accent-coral)" }} />
        )}
        <p className="font-hand text-sm font-bold text-foreground leading-tight flex-1">
          {mission.label}
        </p>
      </div>

      <div className="h-2 rounded-full border-2 border-foreground overflow-hidden bg-background">
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, background: done ? "var(--accent-mint)" : "var(--accent-yellow)" }}
        />
      </div>

      <div className="flex items-center justify-between font-hand text-[11px] text-muted-foreground">
        <span>
          {mission.progress} / {mission.target}
        </span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3" /> {mission.xp}
          </span>
          <span className="flex items-center gap-0.5">
            <Coins className="w-3 h-3" /> {mission.coins}
          </span>
        </span>
      </div>
    </div>
  );
}
