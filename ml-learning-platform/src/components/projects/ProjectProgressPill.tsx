"use client";

import { Check, Circle, Pencil } from "lucide-react";
import type { ProjectDraft } from "@/utils/projectDrafts";
import type { ProjectDef } from "@/data/projects";

interface ProjectProgressPillProps {
  project: ProjectDef;
  draft: ProjectDraft | null;
}

const MIN_CHARS = 40;

export type ProjectStatus = "not-started" | "in-progress" | "completed";

export function getProjectStatus(project: ProjectDef, draft: ProjectDraft | null): ProjectStatus {
  if (draft?.completed) return "completed";
  if (!draft) return "not-started";
  const filled = project.sections.some((s) => (draft.sections[s.id]?.trim().length ?? 0) > 0);
  return filled ? "in-progress" : "not-started";
}

export function getSectionsFilledCount(project: ProjectDef, draft: ProjectDraft | null): number {
  if (!draft) return 0;
  return project.sections.reduce((acc, s) => {
    const v = draft.sections[s.id] ?? "";
    return v.length >= MIN_CHARS ? acc + 1 : acc;
  }, 0);
}

export default function ProjectProgressPill({ project, draft }: ProjectProgressPillProps) {
  const status = getProjectStatus(project, draft);

  if (status === "completed") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground font-hand text-[11px] font-bold text-foreground"
        style={{ background: "var(--accent-mint)", boxShadow: "2px 2px 0 #2b2a35" }}
      >
        <Check className="w-3 h-3" />
        Completed
      </span>
    );
  }

  if (status === "in-progress") {
    const done = getSectionsFilledCount(project, draft);
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground font-hand text-[11px] font-bold text-foreground"
        style={{ background: "var(--accent-yellow)", boxShadow: "2px 2px 0 #2b2a35" }}
      >
        <Pencil className="w-3 h-3" />
        In progress &middot; {done}/{project.sections.length}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground/40 font-hand text-[11px] font-bold text-muted-foreground bg-background">
      <Circle className="w-3 h-3" />
      Not started
    </span>
  );
}
