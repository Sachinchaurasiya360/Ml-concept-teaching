"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import type { ProjectSection } from "@/data/projects";

interface SectionEditorProps {
  section: ProjectSection;
  value: string;
  onChange: (v: string) => void;
}

const MIN_CHARS = 40;

const ACCENT_HEADER = "var(--accent-yellow)";

export default function SectionEditor({ section, value, onChange }: SectionEditorProps) {
  const [showExample, setShowExample] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hintId = useId();
  const labelId = useId();

  // Auto-grow textarea up to a sensible max so long answers don't get cramped
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 12 * 24 + 24; // ~12 lines
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value]);

  const chars = value.length;
  const isDone = chars >= MIN_CHARS;

  return (
    <section
      aria-labelledby={labelId}
      className="card-sketchy overflow-hidden"
      style={{ background: "#fffdf7" }}
    >
      {/* Colored header */}
      <header
        className="px-4 py-3 border-b-2 border-foreground flex items-start gap-3"
        style={{ background: ACCENT_HEADER }}
      >
        <div className="flex-1 min-w-0">
          <p className="font-hand text-[11px] font-bold uppercase tracking-wider text-foreground/70">
            Section &middot; {section.id}
          </p>
          <h3
            id={labelId}
            className="font-hand text-xl sm:text-2xl font-bold text-foreground leading-tight mt-0.5"
          >
            {section.title}
          </h3>
        </div>
        {isDone && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-background border-2 border-foreground shrink-0"
            style={{ boxShadow: "2px 2px 0 #2b2a35" }}
            aria-label="Section meets minimum length"
          >
            <Check className="w-3.5 h-3.5 text-foreground" />
            <span className="font-hand text-[11px] font-bold">Done</span>
          </div>
        )}
      </header>

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="font-hand text-[15px] text-foreground leading-snug">{section.prompt}</p>
        {section.hint && (
          <p id={hintId} className="font-hand text-sm italic text-muted-foreground leading-snug">
            {section.hint}
          </p>
        )}

        {section.example && (
          <div>
            <button
              type="button"
              onClick={() => setShowExample((v) => !v)}
              aria-expanded={showExample}
              className="inline-flex items-center gap-1.5 font-hand text-xs font-bold text-foreground px-2.5 py-1.5 rounded-md border-2 border-foreground bg-background hover:bg-accent-mint/40 transition-colors"
              style={{ boxShadow: "2px 2px 0 #2b2a35" }}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {showExample ? "Hide example" : "See an example"}
              {showExample ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {showExample && (
              <div
                className="mt-2 p-3 rounded-md border-2 border-dashed border-foreground/40 font-hand text-sm text-muted-foreground leading-snug"
                style={{ background: "#fff8e7" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 mb-1">
                  Example answer
                </p>
                {section.example}
              </div>
            )}
          </div>
        )}

        <label className="sr-only" htmlFor={`ta-${section.id}`}>
          {section.title}
        </label>
        <textarea
          id={`ta-${section.id}`}
          ref={textareaRef}
          rows={4}
          aria-describedby={section.hint ? hintId : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your answer here..."
          className="w-full min-h-[6rem] resize-none p-3 rounded-md border-2 border-foreground font-hand text-[15px] leading-snug bg-background text-foreground focus:outline-none focus:bg-accent-yellow/20"
          style={{ boxShadow: "2px 2px 0 #2b2a35" }}
        />

        <div className="flex items-center justify-between text-[11px] font-hand">
          <span className={isDone ? "text-foreground font-bold" : "text-muted-foreground"}>
            {chars} characters &middot; {MIN_CHARS} minimum to mark section done
          </span>
          {!isDone && chars > 0 && (
            <span className="text-muted-foreground">
              {MIN_CHARS - chars} more to go
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
