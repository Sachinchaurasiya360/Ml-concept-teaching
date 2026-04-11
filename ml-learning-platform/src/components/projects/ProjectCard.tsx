"use client";

import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import type { ProjectDef } from "@/data/projects";
import type { ProjectDraft } from "@/utils/projectDrafts";
import ProjectProgressPill from "./ProjectProgressPill";

interface ProjectCardProps {
  project: ProjectDef;
  draft: ProjectDraft | null;
}

const ACCENT_BG: Record<ProjectDef["accent"], string> = {
  coral: "var(--accent-coral)",
  mint: "var(--accent-mint)",
  yellow: "var(--accent-yellow)",
  lav: "var(--accent-lav)",
  sky: "var(--accent-sky)",
  peach: "var(--accent-peach)",
};

const DIFFICULTY_LABEL: Record<ProjectDef["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const TYPE_LABEL: Record<ProjectDef["type"], string> = {
  guided: "Guided",
  "semi-guided": "Semi-guided",
  "open-ended": "Open-ended",
};

export default function ProjectCard({ project, draft }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={`Open project: ${project.title}`}
      className="card-sketchy flex flex-col h-full overflow-hidden group transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus:outline-none"
      style={{ background: "#fffdf7" }}
    >
      {/* Header strip */}
      <div
        className="px-4 py-3 border-b-2 border-foreground flex items-start gap-3"
        style={{ background: ACCENT_BG[project.accent] }}
      >
        <div
          className="w-12 h-12 rounded-xl border-2 border-foreground flex items-center justify-center text-2xl bg-background shrink-0"
          style={{ boxShadow: "2px 2px 0 #2b2a35" }}
          aria-hidden
        >
          {project.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-hand text-[11px] font-bold uppercase tracking-wider text-foreground/70">
            {TYPE_LABEL[project.type]}
          </p>
          <h3 className="font-hand text-xl font-bold text-foreground leading-tight mt-0.5 line-clamp-2">
            {project.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <p className="font-hand text-sm text-muted-foreground leading-snug line-clamp-3">
          {project.shortDescription}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground/60 font-hand text-[11px] font-bold text-foreground bg-background">
            {DIFFICULTY_LABEL[project.difficulty]}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground/60 font-hand text-[11px] text-muted-foreground bg-background">
            <Clock className="w-3 h-3" />
            {project.estMinutes} min
          </span>
          <ProjectProgressPill project={project} draft={draft} />
        </div>

        <div>
          <p className="font-hand text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Concepts applied
          </p>
          <div className="flex flex-wrap gap-1">
            {project.conceptsApplied.slice(0, 4).map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-foreground/40 font-hand text-[11px] text-foreground bg-background"
              >
                <Sparkles className="w-2.5 h-2.5" />
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-2 flex items-center justify-end">
          <span className="inline-flex items-center gap-1 font-hand text-sm font-bold text-foreground group-hover:gap-2 transition-all">
            Open workspace
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
