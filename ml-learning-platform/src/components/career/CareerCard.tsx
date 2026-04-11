"use client";

import Link from "next/link";
import { ArrowRight, IndianRupee } from "lucide-react";
import type { Career, CareerAccent } from "@/data/careers";

interface CareerCardProps {
  career: Career;
}

const ACCENT_BG: Record<CareerAccent, string> = {
  coral: "var(--accent-coral)",
  mint: "var(--accent-mint)",
  yellow: "var(--accent-yellow)",
  lav: "var(--accent-lav)",
  sky: "var(--accent-sky)",
  peach: "var(--accent-peach)",
};

export default function CareerCard({ career }: CareerCardProps) {
  const topTags = career.tags.slice(0, 3);

  return (
    <Link
      href={`/career/${career.slug}`}
      className="group card-sketchy p-5 block transition-transform hover:-translate-y-0.5"
      style={{ background: ACCENT_BG[career.accent] }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl border-2 border-foreground flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: "#fff8e7", boxShadow: "2px 2px 0 #2b2a35" }}
          aria-hidden
        >
          {career.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-hand text-xl font-bold text-foreground leading-tight">
            {career.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 font-hand text-[11px] text-foreground/70">
            <IndianRupee className="w-3 h-3" />
            <span className="font-bold">{career.salaryRange.entry}</span>
            <span className="text-foreground/50">entry</span>
          </div>
        </div>
      </div>

      <p className="font-hand text-sm text-foreground/85 leading-snug mb-3 min-h-[2.5rem]">
        {career.shortDescription}
      </p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {topTags.map((tag) => (
            <span
              key={tag}
              className="font-hand text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border-2 border-foreground"
              style={{ background: "#fff8e7" }}
            >
              {tag}
            </span>
          ))}
        </div>
        <ArrowRight className="w-4 h-4 text-foreground flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
