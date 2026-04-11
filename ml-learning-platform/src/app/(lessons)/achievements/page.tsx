"use client";

import { XpBar, BadgeCard } from "@/components/gamification";
import { useGamification, BADGES, type BadgeDef } from "@/utils/gamification";

const CATEGORIES: {
  key: BadgeDef["category"];
  title: string;
  highlight: string;
}[] = [
  { key: "learning", title: "Learning", highlight: "marker-highlight-yellow" },
  { key: "streak", title: "Streaks", highlight: "marker-highlight-coral" },
  { key: "project", title: "Projects", highlight: "marker-highlight-mint" },
  { key: "special", title: "Special", highlight: "marker-highlight-yellow" },
];

export default function AchievementsPage() {
  const g = useGamification();
  const earnedCount = g.badges.length;
  const totalCount = BADGES.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Home
        </p>
        <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground mt-1">
          <span className="marker-highlight-coral">Achievements</span>
        </h1>
        <p className="font-hand text-sm text-muted-foreground mt-1">
          {earnedCount} of {totalCount} badges earned. Keep collecting!
        </p>
      </div>

      {/* XP bar at top */}
      <XpBar />

      {/* Badge categories */}
      {CATEGORIES.map((cat) => {
        const badges = BADGES.filter((b) => b.category === cat.key);
        if (badges.length === 0) return null;
        const earnedInCat = badges.filter((b) =>
          g.badges.includes(b.id)
        ).length;
        return (
          <section key={cat.key}>
            <div className="flex items-end justify-between mb-3">
              <h2 className="font-hand text-xl font-bold text-foreground">
                <span className={cat.highlight}>{cat.title}</span>
              </h2>
              <span className="font-hand text-xs text-muted-foreground">
                {earnedInCat} / {badges.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {badges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  earned={g.badges.includes(badge.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
