"use client";

import { Award, Lock } from "lucide-react";
import {
  ACCENT_VAR,
  type CertificateDef,
} from "@/data/certificatesCatalog";

interface CertificateCardProps {
  cert: CertificateDef;
  earned: boolean;
  progressText?: string;
  onView?: () => void;
}

const KIND_LABEL: Record<CertificateDef["kind"], string> = {
  module: "Module Certificate",
  track: "Track Certificate",
  project: "Project Certificate",
  "exam-prep": "Exam Prep Certificate",
};

export default function CertificateCard({
  cert,
  earned,
  progressText,
  onView,
}: CertificateCardProps) {
  const accent = ACCENT_VAR[cert.accent];

  return (
    <div
      className="card-sketchy p-4 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: earned ? accent : "#f4f4f2",
        opacity: earned ? 1 : 0.75,
      }}
    >
      {!earned && (
        <div
          className="absolute top-2 right-2 w-7 h-7 rounded-full border-2 border-foreground flex items-center justify-center bg-background"
          aria-hidden
        >
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}

      {/* Emoji badge */}
      <div
        className="w-14 h-14 rounded-full border-2 border-foreground flex items-center justify-center text-3xl bg-background shrink-0"
        style={{ boxShadow: "3px 3px 0 #2b2a35" }}
        aria-hidden
      >
        {earned ? cert.emoji : "🔒"}
      </div>

      {/* Title & subtitle */}
      <div className="space-y-0.5">
        <p className="font-hand text-[10px] uppercase tracking-wider text-foreground/70">
          {KIND_LABEL[cert.kind]}
        </p>
        <h3 className="font-hand text-lg font-bold text-foreground leading-tight">
          {cert.title}
        </h3>
        <p className="font-hand text-xs text-foreground/80">{cert.subtitle}</p>
      </div>

      {/* Requirement / progress footer */}
      <div className="mt-auto pt-2 border-t-2 border-dashed border-foreground/40">
        {earned ? (
          <button
            onClick={onView}
            className="btn-sketchy w-full flex items-center justify-center gap-1.5 font-hand text-xs font-bold py-1.5"
            type="button"
          >
            <Award className="w-3.5 h-3.5" />
            View &amp; Download
          </button>
        ) : (
          <div className="space-y-1">
            <p className="font-hand text-[11px] font-bold text-muted-foreground">
              Requirement
            </p>
            <p className="font-hand text-xs text-foreground/80 leading-snug">
              {cert.requirement}
            </p>
            {progressText && (
              <p className="font-hand text-[11px] text-foreground/70 italic">
                {progressText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
