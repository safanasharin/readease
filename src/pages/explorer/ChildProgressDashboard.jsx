import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { 
  Trophy, Pencil, Volume2, Puzzle, BoxSelect, BookOpen, Search, Layers, Brain, Star, Clock, Activity, ArrowLeft, History
} from "lucide-react";

const EmptyState = () => (
  <div className="flex items-center justify-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
    <p className="text-slate-400 font-bold italic">No activity yet</p>
  </div>
);

// Maps internal support/dyslexia levels → parent-friendly labels
const getSupportLevelLabel = (supportLevel, dyslexiaLevel) => {
  const sl = (supportLevel || "").toLowerCase();
  const dl = (dyslexiaLevel || "").toLowerCase();
  if (sl === "intensive_support" || dl === "severe" || dl === "level3") return "🔴 Severe Dyslexia Support";
  if (sl === "guided_support"    || dl === "moderate" || dl === "level2") return "🟡 Moderate Dyslexia Support";
  return "🟢 Mild Dyslexia Support";
};

const FeatureCard = ({ icon, title, color, children, hasData }) => (
  <div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all`}>
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-${color}-500 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
    <div className="flex items-center gap-3 mb-6 relative z-10">
      <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-800">{title}</h3>
    </div>
    <div className="relative z-10">
      {hasData ? children : <EmptyState />}
    </div>
  </div>
);

const StatRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
    <span className="text-sm font-semibold text-slate-500">{label}</span>
    <span className="text-base font-black text-slate-800">{value}</span>
  </div>
);

export default function ChildProgressDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user || !token) {
      navigate("/");
      return;
    }

    const fetchChildProgress = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/child-progress/summary/${user._id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to fetch child progress", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildProgress();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  // Format Time Helper
  const formatTime = (seconds) => {
    if (!seconds) return "0m";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const getRecentActivityTitle = (act) => {
    if (act.activityType === "letter_tracing") return `Completed Letter ${act.letter || ''}`;
    if (act.activityType === "sound_matching") return `Played Sound Matching`;
    if (act.activityType === "memory_game") return `Finished Memory Game`;
    if (act.activityType === "shape_sorting") return `Solved Shape Sorting`;
    if (act.activityType === "story_reading") return `Read ${act.storyTitle || 'a story'}`;
    if (act.activityType === "letter_detection") return `Played Letter Detective`;
    if (act.activityType === "sequencing") return `Solved Sequencing`;
    if (act.activityType === "visual_detective") return `Completed Visual Detective`;
    return "Completed Activity";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/explorer")}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-indigo-600"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Parent Dashboard
              </h1>
              <p className="text-sm font-bold text-slate-400">Explorer Learning Stage</p>
            </div>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user?.name?.[0] || "E"}
            </div>
            <div>
              <p className="text-sm font-black text-indigo-900">{user?.name || "Explorer"}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{getSupportLevelLabel(user?.supportLevel, user?.dyslexiaLevel)}</p>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="pt-24 px-6 max-w-7xl mx-auto">


        {/* OVERVIEW SECTION */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="relative w-32 h-32 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full animate-spin" style={{animationDuration: "10s"}}></div>
            <div className="absolute inset-2 rounded-full bg-slate-50 flex items-center justify-center text-5xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-indigo-600 to-purple-600">
              {user?.name?.charAt(0)?.toUpperCase() || "E"}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-800 mb-2">{user?.name || "Explorer"}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                Stage: Explorer
              </span>
              <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                {getSupportLevelLabel(user?.supportLevel, user?.dyslexiaLevel)}
              </span>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center min-w-[120px]">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Completion</p>
              <p className="text-3xl font-black text-emerald-700">{summary?.overallCompletion || 0}%</p>
            </div>
            <div className="flex-1 md:flex-none bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center min-w-[120px]">
              <p className="text-xs font-bold text-blue-600 uppercase mb-1">Activities</p>
              <p className="text-3xl font-black text-blue-700">{summary?.totalActivities || 0}</p>
            </div>
            <div className="flex-1 md:flex-none bg-orange-50 border border-orange-100 p-4 rounded-2xl text-center min-w-[120px]">
              <p className="text-xs font-bold text-orange-600 uppercase mb-1">Total Time</p>
              <p className="text-3xl font-black text-orange-700">{Math.floor((summary?.totalTimeSpent || 0) / 60)}<span className="text-lg">m</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Activity className="text-indigo-500" size={28} /> Feature Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LETTER TRACING */}
              <FeatureCard 
                icon={<Pencil size={24} />} 
                title="Letter Tracing" 
                color="pink"
                hasData={summary?.letterTracing?.totalAttempts > 0}
              >
                <StatRow label="Completed Letters" value={summary?.letterTracing?.completedLetters?.length || 0} />
                <StatRow label="Unlocked Letters" value={summary?.letterTracing?.unlockedLetters || 0} />
                <StatRow label="Current Letter" value={summary?.letterTracing?.currentLetter || "None"} />
                <StatRow label="Best Score" value={summary?.letterTracing?.bestScore || 0} />
                <StatRow label="Total Attempts" value={summary?.letterTracing?.totalAttempts || 0} />
              </FeatureCard>

              {/* SOUND MATCHING */}
              <FeatureCard 
                icon={<Volume2 size={24} />} 
                title="Sound Matching" 
                color="purple"
                hasData={summary?.soundMatching?.sessionsPlayed > 0}
              >
                <StatRow label="Sessions Played" value={summary?.soundMatching?.sessionsPlayed || 0} />
                <StatRow label="Correct Answers" value={summary?.soundMatching?.correctAnswers || 0} />
                <StatRow label="Accuracy %" value={`${summary?.soundMatching?.accuracy || 0}%`} />
                <StatRow label="Best Accuracy" value={`${summary?.soundMatching?.bestAccuracy || 0}%`} />
              </FeatureCard>

              {/* MEMORY GAME */}
              <FeatureCard 
                icon={<Puzzle size={24} />} 
                title="Memory Game" 
                color="blue"
                hasData={summary?.memoryGame?.levelsCompleted > 0}
              >
                <StatRow label="Levels Completed" value={summary?.memoryGame?.levelsCompleted || 0} />
                <StatRow label="Matches Found" value={summary?.memoryGame?.matchesFound || 0} />
                <StatRow label="Best Score" value={summary?.memoryGame?.bestScore || 0} />
                <StatRow label="Average Accuracy" value={`${summary?.memoryGame?.averageAccuracy || 0}%`} />
              </FeatureCard>

              {/* SHAPE SORTING */}
              <FeatureCard 
                icon={<BoxSelect size={24} />} 
                title="Shape Sorting" 
                color="emerald"
                hasData={summary?.shapeSorting?.shapesSorted > 0}
              >
                <StatRow label="Shapes Sorted" value={summary?.shapeSorting?.shapesSorted || 0} />
                <StatRow label="Accuracy %" value={`${summary?.shapeSorting?.accuracy || 0}%`} />
                <StatRow label="Best Session" value={`${summary?.shapeSorting?.bestSession || 0}%`} />
              </FeatureCard>

              {/* STORY READING */}
              <FeatureCard 
                icon={<BookOpen size={24} />} 
                title="Story Reading" 
                color="orange"
                hasData={summary?.storyReading?.storiesCompleted > 0}
              >
                <StatRow label="Stories Completed" value={summary?.storyReading?.storiesCompleted || 0} />
                <StatRow label="Total Reading Time" value={formatTime(summary?.storyReading?.totalReadingTime)} />
                <StatRow label="Favorite Category" value={summary?.storyReading?.favoriteCategory || "None"} />
                <StatRow label="Last Story Read" value={summary?.storyReading?.lastStoryRead || "None"} />
              </FeatureCard>

              {/* LETTER DETECTIVE */}
              <FeatureCard 
                icon={<Search size={24} />} 
                title="Letter Detective" 
                color="cyan"
                hasData={summary?.letterDetective?.lettersFound > 0}
              >
                <StatRow label="Letters Found" value={summary?.letterDetective?.lettersFound || 0} />
                <StatRow label="Best Score" value={summary?.letterDetective?.bestScore || 0} />
                <StatRow label="Accuracy %" value={`${summary?.letterDetective?.accuracy || 0}%`} />
              </FeatureCard>

              {/* SEQUENCING */}
              <FeatureCard 
                icon={<Layers size={24} />} 
                title="Sequencing" 
                color="amber"
                hasData={summary?.sequencing?.sequencesSolved > 0}
              >
                <StatRow label="Sequences Solved" value={summary?.sequencing?.sequencesSolved || 0} />
                <StatRow label="Average Score" value={summary?.sequencing?.averageScore || 0} />
                <StatRow label="Best Accuracy" value={`${summary?.sequencing?.bestAccuracy || 0}%`} />
              </FeatureCard>

              {/* VISUAL DETECTIVE */}
              <FeatureCard 
                icon={<Brain size={24} />} 
                title="Visual Detective" 
                color="teal"
                hasData={summary?.visualDetective?.mysteriesSolved > 0}
              >
                <StatRow label="Mysteries Solved" value={summary?.visualDetective?.mysteriesSolved || 0} />
                <StatRow label="Clues Found" value={summary?.visualDetective?.cluesFound || 0} />
                <StatRow label="Accuracy %" value={`${summary?.visualDetective?.accuracy || 0}%`} />
              </FeatureCard>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <History className="text-slate-500" size={24} />
                <h2 className="text-xl font-black text-slate-800">Recent Activity</h2>
              </div>
              
              {(!summary?.recentActivities || summary.recentActivities.length === 0) ? (
                <EmptyState />
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
                  {summary.recentActivities.map((actItem, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-50 shadow-sm shrink-0 relative z-10 text-indigo-500">
                         <Star size={16} />
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="font-bold text-slate-800 text-sm leading-tight">
                          {getRecentActivityTitle(actItem)}
                        </p>
                        <p className="text-xs font-semibold text-slate-400 mt-1">
                          {new Date(actItem.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
