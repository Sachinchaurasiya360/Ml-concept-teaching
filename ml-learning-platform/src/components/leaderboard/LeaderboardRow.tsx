"use client";

import { Flame } from "lucide-react";
import type { LeaderboardEntry } from "@/data/leaderboardSeed";

interface LeaderboardRowProps {
  rank: number;
  entry: LeaderboardEntry;
  isYou: boolean;
}

function rankBadge(rank: number): { label: string; bg: string; border: string } {
  if (rank === 1) return { label: "🥇", bg: "var(--accent-yellow)", border: "#d4a017" };
  if (rank === 2) return { label: "🥈", bg: "#e5e7eb", border: "#9ca3af" };
  if (rank === 3) return { label: "🥉", bg: "var(--accent-peach)", border: "#c97b4a" };
  return { label: `#${rank}`, bg: "#fff", border: "var(--foreground)" };
}

export default function LeaderboardRow({
  rank,
  entry,
  isYou,
}: LeaderboardRowProps) {
  const badge = rankBadge(rank);
  const topThree = rank <= 3;

  return (
    <div
      className="card-sketchy flex items-center gap-3 px-3 py-2.5"
      style={{
        background: isYou
          ? "var(--accent-coral)"
          : topThree
            ? "#fff8e7"
            : "#fff",
        borderWidth: isYou ? 3 : 2,
      }}
    >
      {/* Rank badge */}
      <div
        className="shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-hand font-bold text-sm"
        style={{
          background: badge.bg,
          borderColor: badge.border,
          boxShadow: "2px 2px 0 #2b2a35",
        }}
      >
        {badge.label}
      </div>

      {/* Avatar */}
      <div
        className="shrink-0 w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center text-xl bg-background"
        aria-hidden
      >
        {entry.avatar}
      </div>

      {/* Name + city */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-hand font-bold text-sm truncate ${
            isYou ? "text-foreground" : "text-foreground"
          }`}
        >
          {entry.name}
          {isYou && (
            <span className="ml-2 text-[10px] uppercase tracking-wider bg-foreground text-background px-1.5 py-0.5 rounded">
              You
            </span>
          )}
        </p>
        <p
          className={`font-hand text-[11px] truncate ${
            isYou ? "text-foreground/80" : "text-muted-foreground"
          }`}
        >
          {entry.city}
          {entry.school ? ` · ${entry.school}` : ""}
        </p>
      </div>

      {/* Streak */}
      {entry.streak > 0 && (
        <div className="hidden sm:flex items-center gap-0.5 font-hand text-xs font-bold text-foreground">
          <Flame className="w-3.5 h-3.5" style={{ color: "var(--accent-coral)" }} />
          {entry.streak}
        </div>
      )}

      {/* XP pill */}
      <div
        className="shrink-0 px-2.5 py-1 rounded-full border-2 border-foreground font-hand text-xs font-bold"
        style={{
          background: isYou ? "#fff" : "var(--accent-yellow)",
          boxShadow: "2px 2px 0 #2b2a35",
        }}
      >
        {entry.xp.toLocaleString()} XP
      </div>
    </div>
  );
}
