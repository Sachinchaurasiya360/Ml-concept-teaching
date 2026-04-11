"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Hammer,
  Rocket,
  Trophy,
} from "lucide-react";
import {
  XpBar,
  StreakFlame,
  CoinCounter,
  BadgeCard,
  MissionCard,
} from "@/components/gamification";
import { useGamification, levelFromXp, BADGES } from "@/utils/gamification";
import { useProgress } from "@/utils/progress";
import { LEVELS, ALL_LESSONS, ALL_LESSONS_META } from "@/components/Sidebar";

const QUICK_LINKS: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  bg: string;
}[] = [
  {
    href: "/projects",
    label: "Projects",
    description: "Build something real",
    icon: <Hammer className="w-5 h-5" />,
    bg: "var(--accent-peach)",
  },
  {
    href: "/exam-prep",
    label: "Exam Prep",
    description: "Ace your boards",
    icon: <GraduationCap className="w-5 h-5" />,
    bg: "var(--accent-sky)",
  },
  {
    href: "/career",
    label: "Career",
    description: "Discover AI paths",
    icon: <Briefcase className="w-5 h-5" />,
    bg: "var(--accent-lav)",
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    description: "See who's top",
    icon: <Trophy className="w-5 h-5" />,
    bg: "var(--accent-mint)",
  },
];

const LEVEL_COLORS = [
  "var(--accent-coral)",
  "var(--accent-mint)",
  "var(--accent-yellow)",
  "var(--accent-lav)",
  "var(--accent-sky)",
  "var(--accent-peach)",
  "var(--accent-coral)",
  "var(--accent-mint)",
  "var(--accent-yellow)",
];

export default function DashboardPage() {
  const g = useGamification();
  const progress = useProgress();
  const lvl = levelFromXp(g.xp);

  // Find next unlocked lesson (first lesson not yet in progress.lessons)
  const nextLessonPath = ALL_LESSONS.find((p) => !progress.lessons.includes(p));
  const nextLessonMeta = nextLessonPath
    ? ALL_LESSONS_META.find((m) => m.path === nextLessonPath)
    : undefined;
  const nextLessonLevel = nextLessonPath
    ? LEVELS.find((lv) => lv.lessons.some((ls) => ls.path === nextLessonPath))
    : undefined;

  // Recent badges: last 6 earned from g.badges
  const recentBadgeDefs = g.badges
    .slice(-6)
    .reverse()
    .map((id) => BADGES.find((b) => b.id === id))
    .filter((b): b is (typeof BADGES)[number] => Boolean(b));

  return (
    <div className="space-y-6">
      {/* 1. Hero greeting */}
      <div>
        <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Dashboard
        </p>
        <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground mt-1">
          Welcome back,{" "}
          <span className="marker-highlight-yellow">explorer!</span>
        </h1>
        <p className="font-hand text-sm text-muted-foreground mt-1">
          You&apos;re a{" "}
          <span className="font-bold text-foreground">{lvl.title}</span> on
          Level {lvl.level}. Let&apos;s keep that brain buzzing.
        </p>

        {/* Riku dialogue bubble */}
        <div
          className="mt-4 flex items-start gap-3 card-sketchy p-4"
          style={{ background: "#fff8e7" }}
        >
          <div
            className="w-11 h-11 shrink-0 rounded-full border-2 border-foreground flex items-center justify-center text-2xl"
            style={{
              background: "var(--accent-peach)",
              boxShadow: "2px 2px 0 #2b2a35",
            }}
            aria-hidden
          >
            &#x1F43C;
          </div>
          <div className="flex-1">
            <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Riku says
            </p>
            <p className="font-hand text-base text-foreground leading-snug mt-0.5">
              {g.streak.current > 0
                ? `Wah! ${g.streak.current}-day streak going strong. One lesson today and we keep the fire alive!`
                : "Ready to learn something new today? Even 10 minutes counts. Let's go!"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <XpBar />
        <StreakFlame />
        <CoinCounter />
      </div>

      {/* 3. Daily missions */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="font-hand text-xl font-bold text-foreground">
              <span className="marker-highlight-coral">Today&apos;s Missions</span>
            </h2>
            <p className="font-hand text-xs text-muted-foreground mt-1">
              Knock out 3 quick tasks for bonus XP and coins.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {g.missions.list.map((m) => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </div>
        <p className="font-hand text-[11px] text-muted-foreground mt-2 italic">
          Resets at midnight &middot; new missions every day
        </p>
      </section>

      {/* 4. Continue learning */}
      <section>
        <h2 className="font-hand text-xl font-bold text-foreground mb-3">
          <span className="marker-highlight-mint">Continue Learning</span>
        </h2>
        {nextLessonPath && nextLessonMeta ? (
          <Link
            href={nextLessonPath}
            className="card-sketchy p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform"
            style={{ background: "#eafff5" }}
          >
            <div
              className="w-14 h-14 shrink-0 rounded-full border-2 border-foreground flex items-center justify-center"
              style={{
                background: "var(--accent-mint)",
                boxShadow: "2px 2px 0 #2b2a35",
              }}
            >
              <BookOpen className="w-7 h-7 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-hand text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {nextLessonLevel
                  ? `Level ${nextLessonLevel.level} \u00B7 ${nextLessonLevel.title}`
                  : "Up next"}
              </p>
              <p className="font-hand text-lg font-bold text-foreground truncate">
                {nextLessonMeta.label}
              </p>
            </div>
            <span className="btn-sketchy text-sm font-hand shrink-0">
              Continue
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ) : (
          <div
            className="card-sketchy p-5 flex items-center gap-4"
            style={{ background: "#fff3d9" }}
          >
            <div
              className="w-14 h-14 shrink-0 rounded-full border-2 border-foreground flex items-center justify-center"
              style={{
                background: "var(--accent-yellow)",
                boxShadow: "2px 2px 0 #2b2a35",
              }}
            >
              <Rocket className="w-7 h-7 text-foreground" />
            </div>
            <div>
              <p className="font-hand text-lg font-bold text-foreground">
                You&apos;ve completed all lessons!
              </p>
              <p className="font-hand text-xs text-muted-foreground">
                Time to build something wild in the Projects lab.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 5. Progress by level */}
      <section>
        <h2 className="font-hand text-xl font-bold text-foreground mb-3">
          <span className="marker-highlight-yellow">Your Journey</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEVELS.map((level, i) => {
            const total = level.lessons.length;
            const done = level.lessons.filter((ls) =>
              progress.lessons.includes(ls.path)
            ).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const complete = pct === 100;
            return (
              <div
                key={level.level}
                className="card-sketchy p-3 space-y-2"
                style={{ background: complete ? "#e8fff5" : "#fff" }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="w-8 h-8 shrink-0 rounded-full border-2 border-foreground flex items-center justify-center font-hand font-bold text-sm"
                    style={{
                      background: LEVEL_COLORS[i] ?? "var(--accent-yellow)",
                      boxShadow: "2px 2px 0 #2b2a35",
                    }}
                  >
                    {level.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-hand text-sm font-bold text-foreground leading-tight truncate">
                      {level.title}
                    </p>
                    <p className="font-hand text-[10px] text-muted-foreground uppercase tracking-wider">
                      {done}/{total} lessons
                    </p>
                  </div>
                  <span className="font-hand text-xs font-bold text-foreground">
                    {pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full border-2 border-foreground overflow-hidden bg-background">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: complete
                        ? "var(--accent-mint)"
                        : "var(--accent-coral)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Recent badges */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-hand text-xl font-bold text-foreground">
            <span className="marker-highlight-coral">Recent Badges</span>
          </h2>
          <Link
            href="/achievements"
            className="font-hand text-sm font-bold text-foreground hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentBadgeDefs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {recentBadgeDefs.map((b) => (
              <BadgeCard key={b.id} badge={b} earned />
            ))}
          </div>
        ) : (
          <div
            className="card-sketchy p-5 text-center"
            style={{ background: "#fff8e7" }}
          >
            <Award
              className="w-8 h-8 mx-auto mb-2"
              style={{ color: "var(--accent-coral)" }}
            />
            <p className="font-hand text-base font-bold text-foreground">
              Keep learning to unlock badges!
            </p>
            <p className="font-hand text-xs text-muted-foreground mt-1">
              Finish your first lesson to earn the First Steps badge.
            </p>
          </div>
        )}
      </section>

      {/* 7. Quick links */}
      <section>
        <h2 className="font-hand text-xl font-bold text-foreground mb-3">
          <span className="marker-highlight-mint">Explore More</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="card-sketchy p-4 flex flex-col items-start gap-2 hover:-translate-y-0.5 transition-transform"
              style={{ background: "#fff" }}
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center text-foreground"
                style={{
                  background: link.bg,
                  boxShadow: "2px 2px 0 #2b2a35",
                }}
              >
                {link.icon}
              </div>
              <div>
                <p className="font-hand text-base font-bold text-foreground leading-tight">
                  {link.label}
                </p>
                <p className="font-hand text-[11px] text-muted-foreground">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
