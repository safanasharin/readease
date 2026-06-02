/* eslint-disable */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useIntervention } from "../../context/InterventionContext";
import { BookOpen, Volume2, Mic, Star, Zap, Trophy, ChevronRight, ArrowLeft, Eye, Type } from "lucide-react";
import AidToolbar from "../../aids/AidToolbar";

const ACTIVITIES = [
  {
    id: "phonics-drill",
    emoji: "🔤",
    label: "Phonics Drill",
    desc: "Practice letter sounds A–Z",
    color: "from-indigo-500 to-purple-500",
    glow: "shadow-indigo-200",
    difficulty: "starter",
  },
  {
    id: "word-recognition",
    emoji: "👁️",
    label: "Word Recognition",
    desc: "Spot the correct word quickly",
    color: "from-pink-500 to-rose-500",
    glow: "shadow-pink-200",
    difficulty: "starter",
  },
  {
    id: "syllable-match",
    emoji: "🎵",
    label: "Syllable Matching",
    desc: "Break words into sound chunks",
    color: "from-amber-500 to-orange-500",
    glow: "shadow-amber-200",
    difficulty: "intermediate",
  },
  {
    id: "simple-story",
    emoji: "📖",
    label: "Read a Story",
    desc: "Short, fun reading with audio help",
    color: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-200",
    difficulty: "intermediate",
  },
  {
    id: "spelling-practice",
    emoji: "✏️",
    label: "Spelling Practice",
    desc: "Hear a word and spell it out",
    color: "from-violet-500 to-indigo-500",
    glow: "shadow-violet-200",
    difficulty: "advanced",
  },
];

function ActivityCard({ activity, isSevere }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/beginner/activity/${activity.id}`)}
      className={`bg-gradient-to-br ${activity.color} ${activity.glow} rounded-2xl p-5 text-white cursor-pointer
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

export default function BeginnerHub() {
  const { user } = useAuth();
  const { aids, uiSettings, severity, isSevere, isModerate } = useIntervention();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("activities");

  const firstName = user?.name?.split(" ")[0] || "Learner";

  // Severe users see one activity at a time
  const visibleActivities = isSevere ? [ACTIVITIES[0]] : ACTIVITIES;

  const speakWelcome = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Welcome back ${firstName}! Ready to practise reading today?`);
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div
      className={`min-h-screen font-sans pb-24 ${
        uiSettings.isDarkMode
          ? "bg-slate-900 text-white"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-800"
      }`}
    >
      {/* Top nav */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-indigo-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-bold text-sm cursor-pointer">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-1">
          <span className="text-xl">📚</span>
          <span className="font-black text-lg text-indigo-700">ReadEase</span>
          <span className="text-xs bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full ml-1">Beginner</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span>{user?.gamification?.totalStars || 0}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Welcome banner */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 mb-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[100px] opacity-10 select-none leading-none">📚</div>
          <p className="text-sm font-bold opacity-80 mb-1">Welcome back!</p>
          <h1 className={`font-black mb-1 ${isSevere ? "text-3xl" : "text-2xl"}`}>Hi, {firstName}! 📚</h1>
          <p className="text-sm font-semibold opacity-90 mb-4">Let's practise reading and spelling today.</p>

          {/* Severity badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-3 py-1.5">
            <Trophy size={14} className="text-yellow-300" />
            <span className="text-xs font-black capitalize">
              {severity} level · Beginner
            </span>
          </div>

          {/* Audio welcome for moderate/severe */}
          {(aids.audioInstructions || aids.textToSpeech) && (
            <button
              onClick={speakWelcome}
              className="mt-3 ml-3 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer"
            >
              <Volume2 size={12} /> Hear Instructions
            </button>
          )}
        </div>

        {/* Aid hints for severe users */}
        {isSevere && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3 items-start">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-black text-amber-800 text-sm">Personalised Support Active</p>
              <p className="text-amber-700 text-xs font-semibold mt-0.5">
                We've enabled reading aids to help you. Use the toolbar at the bottom-right to control them anytime.
              </p>
            </div>
          </div>
        )}

        {/* Aid badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {aids.readingRuler    && <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Eye size={10}/>Reading Ruler ON</span>}
          {aids.textToSpeech    && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Volume2 size={10}/>Text-to-Speech ON</span>}
          {aids.dyslexiaFont    && <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Type size={10}/>Dyslexia Font ON</span>}
          {aids.syllableBreakdown && <span className="bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">🎵 Syllables ON</span>}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-100 gap-1">
          {["activities", "progress", "aids"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-black transition-all cursor-pointer capitalize
                ${activeTab === tab
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab === "activities" ? "🎮 Activities" : tab === "progress" ? "📈 Progress" : "🔧 My Aids"}
            </button>
          ))}
        </div>

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-800">
                {isSevere ? "🎯 Today's Focus Activity" : "🎮 Learning Activities"}
              </h2>
              {isSevere && (
                <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-full">
                  One at a time
                </span>
              )}
            </div>

            <div className={`grid gap-4 ${isSevere ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
              {visibleActivities.map(act => (
                <ActivityCard key={act.id} activity={act} isSevere={isSevere} />
              ))}
            </div>

            {isSevere && ACTIVITIES.length > 1 && (
              <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center">
                <p className="text-indigo-700 font-bold text-sm">
                  ✨ Complete this activity to unlock the next one!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-gray-800 mb-2">📈 Your Progress</h2>
            {[
              { label: "Words Read", value: user?.readingMetrics?.length ? `${user.readingMetrics.length * 12} words` : "0 words", emoji: "📖" },
              { label: "Spelling Score", value: "—", emoji: "✏️" },
              { label: "Sessions", value: user?.completedActivities?.length || 0, emoji: "⚡" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <span className="text-3xl">{stat.emoji}</span>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">{stat.label}</p>
                  <p className="text-xl font-black text-gray-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aids Tab */}
        {activeTab === "aids" && (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-gray-800 mb-2">🔧 Your Learning Aids</h2>
            <p className="text-sm text-gray-500 font-semibold mb-4">
              These aids are personalised for your learning profile. You can toggle them using the toolbar (bottom-right corner).
            </p>
            {[
              { key: "textToSpeech",      label: "Text-to-Speech",    desc: "Reads text aloud for you",               emoji: "🔊" },
              { key: "readingRuler",      label: "Reading Ruler",     desc: "Highlights the line you're reading",      emoji: "📏" },
              { key: "dyslexiaFont",      label: "Dyslexia Font",     desc: "Easier-to-read letter shapes",            emoji: "🔤" },
              { key: "syllableBreakdown", label: "Syllable Helper",   desc: "Breaks words into sound chunks",          emoji: "🎵" },
              { key: "guidedReading",     label: "Guided Reading",    desc: "Shows one sentence at a time",            emoji: "👁️" },
              { key: "predictiveSpelling", label: "Spelling Hints",   desc: "Suggests correct spellings as you type",  emoji: "✏️" },
            ].map(aid => (
              <div key={aid.key} className={`bg-white rounded-xl p-4 border flex items-center gap-4 ${aids[aid.key] ? "border-indigo-300 bg-indigo-50" : "border-gray-100"}`}>
                <span className="text-2xl">{aid.emoji}</span>
                <div className="flex-1">
                  <p className="font-black text-sm text-gray-800">{aid.label}</p>
                  <p className="text-xs text-gray-500">{aid.desc}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${aids[aid.key] ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {aids[aid.key] ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Aid Toolbar */}
      <AidToolbar />
    </div>
  );
}
