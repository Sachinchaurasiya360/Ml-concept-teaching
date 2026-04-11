"use client";

import { useMemo, useState } from "react";
import { Trophy, TrendingUp, School } from "lucide-react";
import { useGamification } from "@/utils/gamification";
import {
  getWeeklyLeaderboard,
  leagueFromXp,
  type LeaderboardEntry,
} from "@/data/leaderboardSeed";
import LeaderboardRow from "@/components/leaderboard/LeaderboardRow";

type Tab = "weekly" | "alltime" | "school";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "weekly", label: "Weekly", icon: <Trophy className="w-3.5 h-3.5" /> },
  { id: "alltime", label: "All-time", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: "school", label: "My School", icon: <School className="w-3.5 h-3.5" /> },
];

type DisplayRow =
  | { kind: "entry"; rank: number; entry: LeaderboardEntry }
  | { kind: "divider" };

function buildDisplayRows(list: LeaderboardEntry[]): DisplayRow[] {
  const youIdx = list.findIndex((e) => e.id === "you");
  const rows: DisplayRow[] = [];
  const topN = 20;

  // Always show top 20
  for (let i = 0; i < Math.min(topN, list.length); i++) {
    rows.push({ kind: "entry", rank: i + 1, entry: list[i] });
  }

  if (youIdx >= topN) {
    // Gap
    rows.push({ kind: "divider" });
    // 2 above + you + 2 below
    const start = Math.max(topN, youIdx - 2);
    const end = Math.min(list.length - 1, youIdx + 2);
    for (let i = start; i <= end; i++) {
      rows.push({ kind: "entry", rank: i + 1, entry: list[i] });
    }
  }

  return rows;
}

export default function LeaderboardPage() {
  const g = useGamification();
  const [tab, setTab] = useState<Tab>("weekly");

  const list = useMemo(() => getWeeklyLeaderboard(g.xp, "You"), [g.xp]);
  const youIdx = list.findIndex((e) => e.id === "you");
  const yourRank = youIdx + 1;
  const league = leagueFromXp(g.xp);
  const displayRows = useMemo(() => buildDisplayRows(list), [list]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Home
        </p>
        <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground mt-1">
          <span className="marker-highlight-yellow">Weekly Leaderboard</span>
        </h1>
        <p className="font-hand text-sm text-muted-foreground mt-1">
          Top AI learners across India
        </p>
      </div>

      {/* League badge card */}
      <div
        className="card-sketchy p-4 flex items-center gap-4"
        style={{ background: league.accent }}
      >
        <div
          className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center text-3xl bg-background shrink-0"
          style={{ boxShadow: "3px 3px 0 #2b2a35" }}
          aria-hidden
        >
          {league.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-hand text-[11px] uppercase tracking-wider text-foreground/80">
            Your League
          </p>
          <p className="font-hand text-2xl font-bold text-foreground leading-tight">
            {league.name}
          </p>
          <p className="font-hand text-xs text-foreground/80 mt-0.5">
            Top 10 promote next week · You&apos;re rank{" "}
            <span className="font-bold">#{yourRank}</span>
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-foreground font-hand text-xs font-bold transition-colors"
              style={{
                background: active ? "var(--accent-coral)" : "#fff",
                boxShadow: active ? "2px 2px 0 #2b2a35" : "none",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content for tab */}
      {tab === "weekly" ? (
        <div className="space-y-2">
          {displayRows.map((row, idx) => {
            if (row.kind === "divider") {
              return (
                <div
                  key={`div-${idx}`}
                  className="text-center font-hand text-muted-foreground text-lg py-1"
                >
                  · · ·
                </div>
              );
            }
            return (
              <LeaderboardRow
                key={row.entry.id}
                rank={row.rank}
                entry={row.entry}
                isYou={row.entry.id === "you"}
              />
            );
          })}
        </div>
      ) : (
        <div
          className="card-sketchy p-8 text-center space-y-2"
          style={{ background: "#fff8e7" }}
        >
          <p className="text-4xl" aria-hidden>
            🚧
          </p>
          <p className="font-hand text-lg font-bold text-foreground">
            Coming soon
          </p>
          <p className="font-hand text-sm text-muted-foreground">
            {tab === "alltime"
              ? "All-time rankings will unlock when the season ends."
              : "School leaderboards arrive when school codes launch."}
          </p>
        </div>
      )}
    </div>
  );
}
