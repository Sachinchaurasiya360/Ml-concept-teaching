"use client";

import { Star } from "lucide-react";
import { useGamification, levelFromXp } from "../../utils/gamification";

interface XpBarProps {
  compact?: boolean;
}

export default function XpBar({ compact = false }: XpBarProps) {
  const g = useGamification();
  const lvl = levelFromXp(g.xp);

  if (compact) {
    return (
      <div className="flex items-center gap-2 font-hand">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground text-[11px] font-bold"
          style={{ background: "var(--accent-yellow)", boxShadow: "2px 2px 0 #2b2a35" }}
        >
          <Star className="w-3 h-3" />
          L{lvl.level}
        </div>
        <span className="text-[11px] text-muted-foreground">{g.xp.toLocaleString()} XP</span>
      </div>
    );
  }

  return (
    <div className="card-sketchy p-4 space-y-2" style={{ background: "#fff8e7" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center font-hand font-bold text-lg"
            style={{ background: "var(--accent-yellow)", boxShadow: "2px 2px 0 #2b2a35" }}
          >
            {lvl.level}
          </div>
          <div>
            <p className="font-hand text-sm font-bold text-foreground leading-tight">{lvl.title}</p>
            <p className="font-hand text-[11px] text-muted-foreground">Level {lvl.level}</p>
          </div>
        </div>
        <div className="text-right font-hand">
          <p className="text-xl font-bold text-foreground leading-none">{g.xp.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total XP</p>
        </div>
      </div>

      <div className="h-3 rounded-full border-2 border-foreground overflow-hidden bg-background">
        <div
          className="h-full transition-all"
          style={{
            width: `${lvl.progressPct}%`,
            background: "var(--accent-coral)",
          }}
        />
      </div>
      {lvl.xpToNext > 0 ? (
        <p className="font-hand text-[11px] text-muted-foreground">
          {lvl.xpToNext} XP to next level
        </p>
      ) : (
        <p className="font-hand text-[11px] text-foreground font-bold">Max level reached! 🐼👑</p>
      )}
    </div>
  );
}
