import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import QuizCard from "./QuizCard";
import { ALL_LESSONS } from "./Sidebar";
import { playClick } from "../utils/sounds";

interface TabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface LessonShellProps {
  title: string;
  level: number;
  lessonNumber: number;
  tabs: TabDef[];
  quiz: QuizQuestion[];
  nextLessonHint?: string;
  story?: React.ReactNode;
}

export default function LessonShell({ title, level, lessonNumber, tabs, quiz, nextLessonHint, story }: LessonShellProps) {
  const allTabs = [
    ...tabs,
    {
      id: "__quiz",
      label: "Challenge",
      icon: <BookOpen className="w-4 h-4" />,
      content: null,
    },
  ];
  const [activeTab, setActiveTab] = useState(allTabs[0].id);

  const location = useLocation();
  const navigate = useNavigate();
  const currentIdx = ALL_LESSONS.indexOf(location.pathname);
  const prevPath = currentIdx > 0 ? ALL_LESSONS[currentIdx - 1] : null;
  const nextPath = currentIdx < ALL_LESSONS.length - 1 ? ALL_LESSONS[currentIdx + 1] : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Level {level} &middot; Lesson {lessonNumber}
        </p>
        <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground mt-1">
          <span className="marker-highlight-yellow">{title}</span>
        </h1>
      </div>

      {/* Story section */}
      {story}

      {/* Tab bar */}
      <div className="flex gap-2 p-1.5 overflow-x-auto card-sketchy">
        {allTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              playClick();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-hand text-sm font-bold whitespace-nowrap transition-all border-2 ${
              activeTab === tab.id
                ? "bg-accent-yellow text-foreground border-foreground shadow-[2px_2px_0_#2b2a35]"
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent-mint/30"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "__quiz" ? (
          <div className="space-y-4">
            <QuizCard questions={quiz} />
            {nextLessonHint && (
              <div className="card-sketchy p-4 text-center" style={{ background: "#fff8e7" }}>
                <p className="font-hand text-base text-foreground font-bold">{nextLessonHint}</p>
              </div>
            )}
          </div>
        ) : (
          tabs.find((t) => t.id === activeTab)?.content
        )}
      </div>

      {/* Previous / Next navigation */}
      <div className="flex items-center justify-between pt-5 border-t-2 border-dashed border-foreground/30">
        {prevPath ? (
          <button
            onClick={() => { playClick(); navigate(prevPath); }}
            className="btn-sketchy-outline text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
        ) : (
          <div />
        )}
        {nextPath ? (
          <button
            onClick={() => { playClick(); navigate(nextPath); }}
            className="btn-sketchy text-sm"
          >
            Next Lesson
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div
            className="px-4 py-2.5 rounded-lg font-hand text-sm font-bold text-foreground border-2 border-foreground"
            style={{ background: "var(--accent-mint)", boxShadow: "2px 2px 0 #2b2a35" }}
          >
            🎉 You've completed all lessons!
          </div>
        )}
      </div>
    </div>
  );
}
