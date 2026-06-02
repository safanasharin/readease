import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useIntervention } from "../../../context/InterventionContext";
import { BookOpen, Volume2, Mic, Star, Zap, Trophy, ChevronRight, ArrowLeft, Eye, Type } from "lucide-react";
import AidToolbar from "../../../aids/AidToolbar";

const ACTIVITIES = [
  {
    id: "reading-fluency",
    emoji: "📖",
    label: "Reading Fluency",
    desc: "Read paragraphs smoothly and clearly",
    color: "from-sky-500 to-blue-500",
    glow: "shadow-sky-200",
    difficulty: "intermediate",
  },
  {
    id: "comprehension-check",
    emoji: "🤔",
    label: "Comprehension Check",
    desc: "Answer questions about the story",
    color: "from-violet-500 to-purple-500",
    glow: "shadow-violet-200",
    difficulty: "intermediate",
  },
  {
    id: "sequence-builder",
    emoji: "🧩",
    label: "Sequence Builder",
    desc: "Put the events in the right order",
    color: "from-teal-500 to-emerald-500",
    glow: "shadow-teal-200",
    difficulty: "intermediate",
  },
  {
    id: "spelling-correction",
    emoji: "✅",
    label: "Spelling Correction",
    desc: "Find and fix spelling mistakes",
    color: "from-amber-500 to-orange-500",
    glow: "shadow-amber-200",
    difficulty: "advanced",
  },
  {
    id: "structured-writing",
    emoji: "✍️",
    label: "Structured Writing",
    desc: "Write short sentences with guidance",
    color: "from-indigo-500 to-blue-600",
    glow: "shadow-indigo-200",
    difficulty: "advanced",
  },
];

function ActivityCard({ activity, isSevere }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/intermediate/activity/${activity.id}`)}
      className={`bg-gradient-to-br ${activity.color} ${activity.glow} rounded-xl p-5 text-white cursor-pointer
        shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-200 active:scale-95 select-none
        ${isSevere ? "p-6" : "p-5"}`}
    >
      <div className={`${isSevere ? "text-6xl" : "text-4xl"} mb-3`}>{activity.emoji}</div>
      <h3 className={`font-black ${isSevere ? "text-xl" : "text-lg"} leading-tight mb-1`}>{activity.label}</h3>
      <p className={`text-white/80 font-semibold ${isSevere ? "text-base" : "text-sm"} leading-snug`}>{activity.desc}</p>
      <div className="mt-3 inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs font-bold">
        Start <ChevronRight size={12} />
      </div>
    </div>
  );
}

export default function IntermediateHub() {
  const { user } = useAuth();
  const { aids, uiSettings, severity, isSevere } = useIntervention();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("activities");

  const firstName = user?.name?.split(" ")[0] || "Student";

  const visibleActivities = isSevere ? [ACTIVITIES[0], ACTIVITIES[1]] : ACTIVITIES;

  const speakWelcome = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Welcome back ${firstName}! Let's focus on reading fluency today.`);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div
      className={`min-h-screen font-sans pb-24 ${
        uiSettings.isDarkMode
          ? "bg-slate-900 text-white"
          : "bg-gradient-to-br from-sky-50 via-slate-50 to-violet-50 text-slate-800"
      }`}
    >
      {/* Top nav */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-sky-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-bold text-sm cursor-pointer">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-1">
          <span className="text-xl">📚</span>
          <span className="font-black text-lg text-sky-700">ReadEase</span>
          <span className="text-xs bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full ml-1">Intermediate</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-sky-600">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span>{user?.gamification?.totalStars || 0}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-br from-sky-500 via-blue-500 to-violet-500 rounded-xl p-6 mb-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[100px] opacity-10 select-none leading-none">📖</div>
          <p className="text-sm font-bold opacity-80 mb-1">Welcome back!</p>
          <h1 className={`font-black mb-1 ${isSevere ? "text-3xl" : "text-2xl"}`}>Hello, {firstName}.</h1>
          <p className="text-sm font-medium opacity-90 mb-4">Improve your reading fluency and comprehension.</p>

          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-3 py-1.5">
            <Trophy size={14} className="text-yellow-300" />
            <span className="text-xs font-black capitalize">
              {severity} level · Intermediate
            </span>
          </div>

          {(aids.audioInstructions || aids.textToSpeech) && (
            <button
              onClick={speakWelcome}
              className="mt-3 ml-3 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer"
            >
              <Volume2 size={12} /> Read Instructions
            </button>
          )}
        </div>

        {/* Aid hints for severe users */}
        {isSevere && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3 items-start">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-bold text-blue-800 text-sm">Personalised Reading Mode Active</p>
              <p className="text-blue-700 text-sm font-medium mt-0.5">
                We've simplified the layout and enabled reading aids to help you focus. Use the toolbar at the bottom-right.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white rounded-lg p-1 mb-6 shadow-sm border border-gray-100 gap-1">
          {["activities", "progress", "aids"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all cursor-pointer capitalize
                ${activeTab === tab
                  ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab === "activities" ? "Tasks" : tab === "progress" ? "Progress" : "Aids"}
            </button>
          ))}
        </div>

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                {isSevere ? "Recommended Tasks" : "All Tasks"}
              </h2>
            </div>
            <div className={`grid gap-4 ${isSevere ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {visibleActivities.map(act => (
                <ActivityCard key={act.id} activity={act} isSevere={isSevere} />
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Your Progress</h2>
            {[
              { label: "Words Read", value: user?.readingMetrics?.length ? `${user.readingMetrics.length * 12} words` : "0 words", emoji: "📖" },
              { label: "Comprehension", value: "—", emoji: "🤔" },
              { label: "Tasks Completed", value: user?.completedActivities?.length || 0, emoji: "✅" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <span className="text-3xl">{stat.emoji}</span>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aids Tab */}
        {activeTab === "aids" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Learning Aids</h2>
            <p className="text-sm text-gray-600 mb-4">
              Personalised aids are managed via the floating toolbar.
            </p>
            {[
              { key: "textToSpeech",      label: "Text-to-Speech",    desc: "Reads text aloud for you" },
              { key: "readingRuler",      label: "Reading Ruler",     desc: "Highlights the line you're reading" },
              { key: "dyslexiaFont",      label: "Dyslexia Font",     desc: "Easier-to-read letter shapes" },
              { key: "focusMode",         label: "Focus Mode",        desc: "Dims the rest of the screen" },
              { key: "comprehensionHints",label: "Comprehension Hints",desc: "Provides clues during reading" },
            ].map(aid => (
              <div key={aid.key} className={`bg-white rounded-lg p-4 border flex items-center gap-4 ${aids[aid.key] ? "border-sky-300 bg-sky-50" : "border-gray-100"}`}>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">{aid.label}</p>
                  <p className="text-sm text-gray-500">{aid.desc}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${aids[aid.key] ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {aids[aid.key] ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <AidToolbar />
    </div>
  );
}
