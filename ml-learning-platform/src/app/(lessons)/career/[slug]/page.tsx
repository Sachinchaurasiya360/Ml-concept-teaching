"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarClock,
  Compass,
  GraduationCap,
  Hammer,
  IndianRupee,
  Lightbulb,
  Sparkles,
  Users,
} from "lucide-react";
import { getCareerBySlug, type CareerAccent } from "@/data/careers";
import SkillTree from "@/components/career/SkillTree";

const ACCENT_BG: Record<CareerAccent, string> = {
  coral: "var(--accent-coral)",
  mint: "var(--accent-mint)",
  yellow: "var(--accent-yellow)",
  lav: "var(--accent-lav)",
  sky: "var(--accent-sky)",
  peach: "var(--accent-peach)",
};

export default function CareerDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const career = getCareerBySlug(slug);

  if (!career) {
    return (
      <div className="space-y-4">
        <Link
          href="/career"
          className="inline-flex items-center gap-1.5 font-hand text-sm font-bold text-foreground hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to careers
        </Link>
        <div className="card-sketchy p-6 text-center" style={{ background: "#fff8e7" }}>
          <p className="font-hand text-lg font-bold text-foreground">
            We couldn&apos;t find that career.
          </p>
          <p className="font-hand text-sm text-muted-foreground mt-1">
            Try picking one from the careers page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/career"
        className="inline-flex items-center gap-1.5 font-hand text-sm font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to careers
      </Link>

      {/* Header */}
      <div
        className="card-sketchy p-6"
        style={{ background: ACCENT_BG[career.accent] }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-xl border-2 border-foreground flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: "#fff8e7", boxShadow: "2px 2px 0 #2b2a35" }}
            aria-hidden
          >
            {career.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              {career.name}
            </h1>
            <p className="font-hand text-sm text-foreground/85 mt-2 leading-snug">
              {career.shortDescription}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {career.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-hand text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border-2 border-foreground"
                  style={{ background: "#fff8e7" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Salary bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
          {([
            { label: "Entry", value: career.salaryRange.entry },
            { label: "Mid", value: career.salaryRange.mid },
            { label: "Senior", value: career.salaryRange.senior },
          ] as const).map((row) => (
            <div
              key={row.label}
              className="rounded-lg border-2 border-foreground p-2.5"
              style={{ background: "#fff8e7" }}
            >
              <p className="font-hand text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {row.label}
              </p>
              <div className="flex items-center gap-0.5 font-hand font-bold text-foreground">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>{row.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: content */}
        <div className="lg:col-span-2 space-y-5">
          {/* About */}
          <section className="card-sketchy p-5" style={{ background: "#fff8e7" }}>
            <h2 className="font-hand text-xl font-bold text-foreground mb-3">
              <span className="marker-highlight-yellow">About this role</span>
            </h2>
            <div className="font-hand text-sm text-foreground/85 leading-relaxed space-y-3 whitespace-pre-line">
              {career.longDescription}
            </div>
          </section>

          {/* Day in life */}
          <section
            className="card-sketchy p-5"
            style={{ background: "var(--accent-mint)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-5 h-5 text-foreground" />
              <h2 className="font-hand text-xl font-bold text-foreground">
                A day in the life
              </h2>
            </div>
            <ul className="space-y-2">
              {career.dayInLife.map((item, i) => (
                <li key={i} className="flex items-start gap-2 font-hand text-sm text-foreground/85">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-foreground font-bold text-[10px] flex-shrink-0 mt-0.5"
                    style={{ background: "#fff8e7" }}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Skills (SkillTree) */}
          <section
            className="card-sketchy p-5"
            style={{ background: "var(--accent-lav)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-foreground" />
              <h2 className="font-hand text-xl font-bold text-foreground">
                Skills you&apos;ll need
              </h2>
            </div>
            <SkillTree skills={career.skills} />
          </section>

          {/* Education path */}
          <section
            className="card-sketchy p-5"
            style={{ background: "var(--accent-sky)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-5 h-5 text-foreground" />
              <h2 className="font-hand text-xl font-bold text-foreground">
                The education path
              </h2>
            </div>
            <div className="space-y-3">
              {career.education.map((step, i) => (
                <div
                  key={i}
                  className="rounded-lg border-2 border-foreground p-3"
                  style={{ background: "#fff8e7" }}
                >
                  <p className="font-hand font-bold text-sm text-foreground">
                    {i + 1}. {step.stage}
                  </p>
                  <p className="font-hand text-xs text-foreground/80 mt-0.5 leading-snug">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="font-hand text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                Priority Class 11-12 subjects
              </p>
              <div className="flex flex-wrap gap-1.5">
                {career.subjects.map((s) => (
                  <span
                    key={s}
                    className="font-hand text-xs font-bold px-2 py-0.5 rounded-full border-2 border-foreground"
                    style={{ background: "#fff8e7" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Projects to build */}
          <section
            className="card-sketchy p-5"
            style={{ background: "var(--accent-yellow)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Hammer className="w-5 h-5 text-foreground" />
              <h2 className="font-hand text-xl font-bold text-foreground">
                Projects to build now
              </h2>
            </div>
            <ul className="space-y-2">
              {career.projectsToBuild.map((p, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 font-hand text-sm text-foreground/85"
                >
                  <span className="text-foreground font-bold mt-0.5">→</span>
                  <span className="leading-snug">{p}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Colleges */}
          <section
            className="card-sketchy p-5"
            style={{ background: "var(--accent-peach)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-foreground" />
              <h2 className="font-hand text-xl font-bold text-foreground">
                Top Indian colleges
              </h2>
            </div>
            <ul className="space-y-2">
              {career.colleges.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 font-hand text-sm text-foreground/85"
                >
                  <span className="text-foreground font-bold mt-0.5">•</span>
                  <span className="leading-snug">{c}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Industry outlook */}
          <section
            className="card-sketchy p-5"
            style={{ background: "var(--accent-coral)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-foreground" />
              <h2 className="font-hand text-xl font-bold text-foreground">
                Industry outlook
              </h2>
            </div>
            <p className="font-hand text-sm text-foreground/85 leading-relaxed">
              {career.industryOutlook}
            </p>
          </section>

          {/* Alumni stories */}
          <section
            className="card-sketchy p-5"
            style={{ background: "#fff8e7" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-foreground" />
              <h2 className="font-hand text-xl font-bold text-foreground">
                People on this path
              </h2>
            </div>
            <div className="space-y-3">
              {career.alumniStories.map((a, i) => (
                <div
                  key={i}
                  className="rounded-lg border-2 border-foreground p-3"
                  style={{ background: "var(--accent-mint)" }}
                >
                  <p className="font-hand font-bold text-base text-foreground">
                    {a.name}
                  </p>
                  <p className="font-hand text-xs font-bold uppercase tracking-wider text-foreground/70 mb-1">
                    {a.role}
                  </p>
                  <p className="font-hand text-xs text-foreground/85 leading-snug">
                    {a.background}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: sticky CTAs (desktop) */}
        <aside className="lg:sticky lg:top-6 self-start space-y-4">
          <Link
            href="/career/quiz"
            className="card-sketchy p-5 block group"
            style={{ background: "var(--accent-coral)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-5 h-5 text-foreground" />
              <p className="font-hand font-bold text-base text-foreground">
                Not sure yet?
              </p>
            </div>
            <p className="font-hand text-xs text-foreground/85 leading-snug mb-3">
              Take the 15-question quiz to see how this role scores for you.
            </p>
            <div
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-foreground font-hand text-xs font-bold"
              style={{
                background: "var(--accent-yellow)",
                boxShadow: "2px 2px 0 #2b2a35",
              }}
            >
              Take the quiz
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <div
            className="card-sketchy p-4 flex items-start gap-2"
            style={{ background: "var(--accent-mint)" }}
          >
            <Lightbulb className="w-4 h-4 text-foreground flex-shrink-0 mt-0.5" />
            <p className="font-hand text-xs text-foreground/85 leading-snug">
              <span className="font-bold">Tip:</span> start with one project
              from the list above. Shipping beats planning every time.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
