import { useNavigate } from "react-router-dom";
import {
  Brain,
  Cpu,
  Axis3D,
  Sparkles,
  Target,
  Layers,
  Zap,
  TrendingDown,
  ImageIcon,
  ChevronRight,
  Play,
  BookOpen,
  Users,
  Star,
} from "lucide-react";
import { playClick } from "../utils/sounds";

const LEVEL_CARDS = [
  {
    level: 1,
    title: "What Are Machines & Data?",
    desc: "Start from the very basics \u2014 what machines do, how computers think in 0s and 1s, and what data really means.",
    icon: <Cpu className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    lessons: 3,
    path: "/level1/machines",
  },
  {
    level: 2,
    title: "Seeing Patterns in Data",
    desc: "Learn to plot data on graphs, spot trends and clusters, and sort information like a computer.",
    icon: <Axis3D className="w-6 h-6" />,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    lessons: 3,
    path: "/level2/coordinates",
  },
  {
    level: 3,
    title: "From Patterns to Predictions",
    desc: "Make predictions from data, draw the best-fit line, and understand what algorithms are.",
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    lessons: 4,
    path: "/level3/predictions",
  },
  {
    level: 4,
    title: "Introduction to ML",
    desc: "Dive into supervised learning, K-Nearest Neighbors, decision trees, and how to measure model success.",
    icon: <Target className="w-6 h-6" />,
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    lessons: 4,
    path: "/level4/supervised-learning",
  },
  {
    level: 5,
    title: "Unsupervised Learning",
    desc: "Discover how machines find hidden groups in data without labels using K-Means clustering.",
    icon: <Layers className="w-6 h-6" />,
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
    lessons: 3,
    path: "/level5/unsupervised-learning",
  },
  {
    level: 6,
    title: "Neural Networks",
    desc: "Build neurons, stack them into layers, and learn how backpropagation teaches a network.",
    icon: <Zap className="w-6 h-6" />,
    color: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    lessons: 4,
    path: "/level6/perceptron",
  },
  {
    level: 7,
    title: "Training & Optimization",
    desc: "Master gradient descent, learning rates, overfitting, and the difference between SGD and batch training.",
    icon: <TrendingDown className="w-6 h-6" />,
    color: "from-red-500 to-orange-500",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    lessons: 4,
    path: "/level7/gradient-descent",
  },
  {
    level: 8,
    title: "Computer Vision & CNNs",
    desc: "See how computers see \u2014 pixels, filters, convolution, pooling, and build a mini CNN from scratch.",
    icon: <ImageIcon className="w-6 h-6" />,
    color: "from-slate-600 to-slate-800",
    bg: "bg-slate-50",
    border: "border-slate-300",
    text: "text-slate-700",
    lessons: 4,
    path: "/level8/images-as-data",
  },
];

const FEATURES = [
  {
    icon: <Play className="w-5 h-5 text-indigo-600" />,
    title: "Fully Interactive",
    desc: "Every lesson has hands-on SVG activities \u2014 click, drag, and explore concepts visually.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-amber-600" />,
    title: "Story-Driven",
    desc: "Follow Aru & her robot friend Byte as they discover ML concepts through real-world adventures.",
  },
  {
    icon: <Users className="w-5 h-5 text-emerald-600" />,
    title: "Beginner Friendly",
    desc: "Starts from \"What is a machine?\" \u2014 no coding or math prerequisites needed.",
  },
  {
    icon: <Star className="w-5 h-5 text-pink-600" />,
    title: "Quiz Challenges",
    desc: "Test your understanding with quizzes at the end of every lesson.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Animated background dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-0 left-0 w-full h-full opacity-[0.04]" viewBox="0 0 800 600">
            {Array.from({ length: 40 }, (_, i) => (
              <circle
                key={i}
                cx={50 + (i % 10) * 80}
                cy={40 + Math.floor(i / 10) * 140}
                r={3 + (i % 5) * 2}
                fill="currentColor"
                className="text-indigo-600"
              />
            ))}
            {/* Connection lines */}
            {Array.from({ length: 20 }, (_, i) => {
              const x1 = 50 + (i % 10) * 80;
              const y1 = 40 + Math.floor(i / 10) * 140;
              const x2 = 50 + ((i + 1) % 10) * 80;
              const y2 = 40 + Math.floor((i + 1) / 10) * 140;
              return (
                <line
                  key={`l-${i}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="currentColor"
                  strokeWidth={0.5}
                  className="text-indigo-400"
                />
              );
            })}
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 mb-6">
            <Brain className="w-3.5 h-3.5" />
            29 Interactive Lessons &middot; 8 Levels
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Learn Machine Learning
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              From Scratch
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A hands-on interactive journey from &ldquo;What is a machine?&rdquo; all the way to
            building neural networks and CNNs. No prior knowledge needed &mdash; just curiosity.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                playClick();
                navigate("/level1/machines");
              }}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4" />
              Start Learning
            </button>
            <a
              href="#levels"
              onClick={() => playClick()}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Browse Curriculum
            </a>
          </div>

          {/* Hero visual — mini neural network SVG */}
          <div className="mt-12 flex justify-center">
            <svg viewBox="0 0 400 160" className="w-full max-w-md">
              {/* Input layer */}
              {[40, 80, 120].map((y, i) => (
                <g key={`in-${i}`}>
                  <circle cx={60} cy={y} r={14} fill="#e0e7ff" stroke="#6366f1" strokeWidth={2} />
                  <text x={60} y={y + 4} textAnchor="middle" className="text-[10px] fill-indigo-600 font-bold">
                    {["x1", "x2", "x3"][i]}
                  </text>
                </g>
              ))}
              {/* Hidden layer */}
              {[50, 90, 130].map((y, i) => (
                <g key={`h-${i}`}>
                  <circle cx={200} cy={y} r={14} fill="#fae8ff" stroke="#a855f7" strokeWidth={2} />
                  <text x={200} y={y + 4} textAnchor="middle" className="text-[10px] fill-purple-600 font-bold">
                    {["h1", "h2", "h3"][i]}
                  </text>
                </g>
              ))}
              {/* Output */}
              <circle cx={340} cy={80} r={16} fill="#dcfce7" stroke="#22c55e" strokeWidth={2} />
              <text x={340} y={84} textAnchor="middle" className="text-[10px] fill-green-700 font-bold">
                y
              </text>
              {/* Connections input→hidden */}
              {[40, 80, 120].map((y1) =>
                [50, 90, 130].map((y2) => (
                  <line
                    key={`c1-${y1}-${y2}`}
                    x1={74} y1={y1} x2={186} y2={y2}
                    stroke="#c7d2fe" strokeWidth={1.5}
                  />
                ))
              )}
              {/* Connections hidden→output */}
              {[50, 90, 130].map((y) => (
                <line
                  key={`c2-${y}`}
                  x1={214} y1={y} x2={324} y2={80}
                  stroke="#d8b4fe" strokeWidth={1.5}
                />
              ))}
              {/* Layer labels */}
              <text x={60} y={152} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">Input</text>
              <text x={200} y={152} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">Hidden</text>
              <text x={340} y={152} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">Output</text>
            </svg>
          </div>
        </div>
      </header>

      {/* Features row */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Levels grid */}
      <section id="levels" className="max-w-5xl mx-auto px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Your Learning Path
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            8 levels &middot; 29 lessons &middot; From absolute beginner to building CNNs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LEVEL_CARDS.map((card) => (
            <button
              key={card.level}
              onClick={() => {
                playClick();
                navigate(card.path);
              }}
              className={`group text-left ${card.bg} border ${card.border} rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-sm`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Level {card.level}
                    </p>
                    <h3 className={`text-sm font-bold ${card.text}`}>{card.title}</h3>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
              </div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{card.desc}</p>
              <div className="mt-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {card.lessons} lessons
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Meet the characters */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800 text-center mb-4">Meet Your Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex gap-3 items-start">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                <span className="text-xl">&#128567;</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-pink-700">Aru</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                  A curious 12-year-old who loves asking &ldquo;why?&rdquo; &mdash; she discovers ML concepts through
                  everyday adventures like packing for trips, finding lost dogs, and predicting rain.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-xl">&#129302;</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-700">Byte</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                  Aru&apos;s friendly robot companion who explains how computers think, learn, and see the world &mdash;
                  one step at a time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Ready to begin?</h2>
          <p className="text-indigo-200 text-sm mt-2">
            Start from the very first lesson and work your way up. It&apos;s free and fun!
          </p>
          <button
            onClick={() => {
              playClick();
              navigate("/level1/machines");
            }}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            <Play className="w-4 h-4" />
            Start Level 1
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Brain className="w-4 h-4" />
            <span className="font-semibold">ML Learning Path</span>
          </div>
          <p className="text-slate-500 text-[10px]">
            From Machines to Machine Learning &middot; 29 Interactive Lessons
          </p>
        </div>
      </footer>
    </div>
  );
}
