"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  Coins,
  PartyPopper,
  RotateCcw,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { getProjectBySlug, type ProjectDef } from "@/data/projects";
import {
  useProjectDraft,
  updateDraftSection,
  markProjectComplete,
  resetDraft,
} from "@/utils/projectDrafts";
import SectionEditor from "@/components/projects/SectionEditor";

const MIN_CHARS = 40;

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

export default function ProjectWorkspacePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (!project) {
    return <ProjectNotFound />;
  }
  return <ProjectWorkspace project={project} />;
}

function ProjectNotFound() {
  return (
    <div className="space-y-4">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 font-hand text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>
      <div className="card-sketchy p-6 text-center space-y-2" style={{ background: "#fff8e7" }}>
        <h1 className="font-hand text-2xl font-bold text-foreground">Project not found</h1>
        <p className="font-hand text-muted-foreground">
          We couldn't find that project. It may have been moved or renamed.
        </p>
      </div>
    </div>
  );
}

function ProjectWorkspace({ project }: { project: ProjectDef }) {
  const draft = useProjectDraft(project.slug);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const sectionsDone = useMemo(
    () =>
      project.sections.reduce(
        (n, s) => ((draft.sections[s.id]?.length ?? 0) >= MIN_CHARS ? n + 1 : n),
        0,
      ),
    [project.sections, draft.sections],
  );
  const total = project.sections.length;
  const canComplete = sectionsDone === total && !draft.completed;
  const alreadyDone = draft.completed;

  function handleMarkComplete() {
    if (!canComplete) return;
    markProjectComplete(project.slug);
    setShowCelebration(true);
  }

  function handleReset() {
    resetDraft(project.slug);
    setShowResetConfirm(false);
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 font-hand text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      {/* Header */}
      <header className="card-sketchy overflow-hidden" style={{ background: "#fffdf7" }}>
        <div
          className="px-4 py-4 border-b-2 border-foreground flex items-start gap-3"
          style={{ background: ACCENT_BG[project.accent] }}
        >
          <div
            className="w-14 h-14 rounded-xl border-2 border-foreground flex items-center justify-center text-3xl bg-background shrink-0"
            style={{ boxShadow: "2px 2px 0 #2b2a35" }}
            aria-hidden
          >
            {project.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-hand text-[11px] font-bold uppercase tracking-wider text-foreground/70">
              Project workspace
            </p>
            <h1 className="font-hand text-2xl sm:text-3xl font-bold text-foreground leading-tight mt-0.5">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground font-hand text-[11px] font-bold text-foreground bg-background">
                {DIFFICULTY_LABEL[project.difficulty]}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground/60 font-hand text-[11px] text-foreground bg-background">
                <Clock className="w-3 h-3" />
                {project.estMinutes} min
              </span>
              {alreadyDone && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-foreground font-hand text-[11px] font-bold text-foreground"
                  style={{ background: "var(--accent-mint)", boxShadow: "2px 2px 0 #2b2a35" }}
                >
                  <Check className="w-3 h-3" />
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="p-4 space-y-3">
          <p className="font-hand text-[15px] text-foreground leading-snug">
            {project.shortDescription}
          </p>

          <div>
            <p className="font-hand text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              What you'll deliver
            </p>
            <ul className="space-y-1">
              {project.deliverables.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-2 font-hand text-sm text-foreground"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0"
                    aria-hidden
                  />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-hand text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Concepts you'll use
            </p>
            <div className="flex flex-wrap gap-1">
              {project.conceptsApplied.map((c) => (
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
        </div>
      </header>

      {/* Sections */}
      <div className="space-y-4">
        {project.sections.map((section) => (
          <SectionEditor
            key={section.id}
            section={section}
            value={draft.sections[section.id] ?? ""}
            onChange={(v) => updateDraftSection(project.slug, section.id, v)}
          />
        ))}
      </div>

      {/* Sticky bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 lg:left-auto lg:right-0 z-20 border-t-2 border-foreground bg-background/95 backdrop-blur"
        style={{ boxShadow: "0 -2px 0 rgba(43,42,53,0.08)" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <p className="font-hand text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Progress
            </p>
            <p className="font-hand text-sm font-bold text-foreground">
              {sectionsDone} / {total} sections filled
              <span className="text-muted-foreground font-normal">
                {" "}(40+ chars each)
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={
              !Object.values(draft.sections).some((v) => v.length > 0) && !draft.completed
            }
            className="btn-sketchy-outline text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Reset draft"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={!canComplete}
            className="btn-sketchy text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={
              alreadyDone
                ? "Project already marked complete"
                : canComplete
                  ? "Mark project complete"
                  : "Fill all sections to enable"
            }
            title={
              alreadyDone
                ? "Already completed"
                : canComplete
                  ? "Mark this project complete"
                  : "Each section needs 40+ characters"
            }
          >
            <Check className="w-4 h-4" />
            {alreadyDone ? "Completed" : "Mark complete"}
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <ResetConfirmModal
          projectTitle={project.title}
          onCancel={() => setShowResetConfirm(false)}
          onConfirm={handleReset}
        />
      )}

      {showCelebration && (
        <CelebrationModal
          projectTitle={project.title}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}

function ResetConfirmModal({
  projectTitle,
  onCancel,
  onConfirm,
}: {
  projectTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-title"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-foreground/40"
    >
      <div
        className="card-sketchy max-w-sm w-full p-5 space-y-3 bg-background"
        style={{ background: "#fffdf7" }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="reset-title" className="font-hand text-xl font-bold text-foreground">
            Reset this draft?
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="p-1 rounded hover:bg-accent-yellow/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="font-hand text-sm text-muted-foreground">
          This will permanently delete everything you've written in{" "}
          <span className="font-bold text-foreground">{projectTitle}</span>. This cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button type="button" onClick={onCancel} className="btn-sketchy-outline text-xs">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-sketchy text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset draft
          </button>
        </div>
      </div>
    </div>
  );
}

function CelebrationModal({
  projectTitle,
  onClose,
}: {
  projectTitle: string;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebrate-title"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-foreground/40"
    >
      <div
        className="card-sketchy max-w-sm w-full p-6 space-y-4 text-center"
        style={{ background: "#fff8e7" }}
      >
        <div
          className="mx-auto w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center text-3xl"
          style={{ background: "var(--accent-mint)", boxShadow: "2px 2px 0 #2b2a35" }}
          aria-hidden
        >
          <PartyPopper className="w-8 h-8 text-foreground" />
        </div>
        <div>
          <h2 id="celebrate-title" className="font-hand text-2xl font-bold text-foreground">
            <span className="marker-highlight-coral">Project complete!</span>
          </h2>
          <p className="font-hand text-sm text-muted-foreground mt-1">
            You finished <span className="font-bold text-foreground">{projectTitle}</span>. That's
            a real AI project you can show off.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div
            className="p-3 rounded-md border-2 border-foreground flex flex-col items-center"
            style={{ background: "var(--accent-yellow)", boxShadow: "2px 2px 0 #2b2a35" }}
          >
            <Star className="w-5 h-5 text-foreground" />
            <p className="font-hand text-lg font-bold text-foreground leading-none mt-1">
              +300 XP
            </p>
          </div>
          <div
            className="p-3 rounded-md border-2 border-foreground flex flex-col items-center"
            style={{ background: "var(--accent-peach)", boxShadow: "2px 2px 0 #2b2a35" }}
          >
            <Coins className="w-5 h-5 text-foreground" />
            <p className="font-hand text-lg font-bold text-foreground leading-none mt-1">
              +50 coins
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
          <Link
            href="/projects"
            onClick={onClose}
            className="btn-sketchy text-sm w-full sm:w-auto justify-center"
          >
            Back to projects
          </Link>
          <button type="button" onClick={onClose} className="btn-sketchy-outline text-xs">
            Stay here
          </button>
        </div>
      </div>
    </div>
  );
}
