import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MascotGuide from "../components/explorer/MascotGuide";
import RewardPopup from "../components/explorer/RewardPopup";
import { 
  Star, Trophy, Zap, Clock, Users, Lock, BookOpen, Activity, 
  LogOut, Type, Search, Map, AlignLeft, Brain, Target, 
  TrendingUp, Award, PlayCircle, Flame, MapPin, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ALL_ACTIVITIES = [
  "reading-practice",
  "vocabulary-builder",
  "word-detective",
  "story-explorer",
  "sentence-builder"
];

const ACTIVITY_UI_MAP = {
  "reading-practice": { title: "Reading Practice", desc: "Read aloud & check fluency", icon: <BookOpen size={36} />, color: "bg-blue-100 text-blue-700 border-blue-200", hover: "hover:shadow-blue-200" },
  "vocabulary-builder": { title: "Vocabulary Builder", desc: "Learn new power words", icon: <Type size={36} />, color: "bg-emerald-100 text-emerald-700 border-emerald-200", hover: "hover:shadow-emerald-200" },
  "word-detective": { title: "Word Detective", desc: "Find the missing letters", icon: <Search size={36} />, color: "bg-purple-100 text-purple-700 border-purple-200", hover: "hover:shadow-purple-200" },
  "story-explorer": { title: "Story Explorer", desc: "Interactive story quests", icon: <Map size={36} />, color: "bg-amber-100 text-amber-700 border-amber-200", hover: "hover:shadow-amber-200" },
  "sentence-builder": { title: "Sentence Builder", desc: "Construct full sentences", icon: <AlignLeft size={36} />, color: "bg-pink-100 text-pink-700 border-pink-200", hover: "hover:shadow-pink-200" }
};

const ACHIEVEMENTS = [
  { id: "reading_star", title: "Reading Star", icon: <Star size={24} />, color: "text-yellow-500 bg-yellow-100", unlocked: true },
  { id: "vocab_master", title: "Vocabulary Master", icon: <Type size={24} />, color: "text-emerald-500 bg-emerald-100", unlocked: true },
  { id: "story_explorer", title: "Story Explorer", icon: <Map size={24} />, color: "text-amber-500 bg-amber-100", unlocked: false },
  { id: "daily_streak", title: "Daily Streak", icon: <Flame size={24} />, color: "text-orange-500 bg-orange-100", unlocked: true },
  { id: "memory_champ", title: "Memory Champion", icon: <Brain size={24} />, color: "text-purple-500 bg-purple-100", unlocked: false },
];

export default function SecondAgeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const firstName = user?.name?.split(" ")[0] || "Learner";
  
  const [progressSummary, setProgressSummary] = useState(null);
  
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("token");
        const userId = user._id || user.id;
        const res = await fetch(`http://localhost:5000/api/child-progress/summary/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProgressSummary(data);
        } else {
          setProgressSummary(null);
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };
    fetchProgress();
  }, [user]);

  // Derived user-specific data (defaulting to 0 for new users)
  const totalXP = progressSummary?.totalXP || 0;
  // Calculate total stars based on activities (or use a stored value if available)
  const totalStars = progressSummary?.totalStars || Math.floor(totalXP / 100); 
  const streak = user?.streak || 0;
  
  const severity = user?.dyslexiaLevel ? user.dyslexiaLevel.toLowerCase() : "moderate";
  
  const getSeverityLabel = (sev) => {
    if (sev === "mild") return "🟢 Mild Dyslexia Support";
    if (sev === "severe") return "🔴 Severe Dyslexia Support";
    return "🟡 Moderate Dyslexia Support";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <RewardPopup />

      {/* ── Top Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={28} className="text-blue-600" />
          <div>
            <h1 className="font-black text-xl text-slate-900 leading-tight">ReadEase</h1>
            <span className="text-[10px] uppercase tracking-wider bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded-full">Beginner</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full px-4 py-1.5 shadow-sm">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-black text-yellow-700">{totalStars}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-full px-4 py-1.5 shadow-sm">
              <Zap size={16} className="text-indigo-500" />
              <span className="text-sm font-black text-indigo-700">{totalXP} XP</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/parent")}
              className="hidden md:flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-blue-300 rounded-xl px-4 py-2 text-sm font-black text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm cursor-pointer"
            >
              <Users size={16} /> Parent View
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex items-center gap-2 bg-red-50 border-2 border-red-100 hover:border-red-300 rounded-xl px-4 py-2 text-sm font-black text-red-600 hover:bg-red-100 transition-all shadow-sm cursor-pointer"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ── Premium Hero Section ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-200 relative overflow-hidden mb-10 group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 opacity-10 select-none leading-none -translate-x-8 translate-y-12 rotate-12">
            <Star size={180} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl">
                <div className="w-full h-full bg-gradient-to-br from-sky-200 to-blue-300 rounded-full flex items-center justify-center text-4xl border-4 border-white">
                  👦
                </div>
              </div>
              <div>
                <p className="text-blue-100 font-bold uppercase tracking-wider text-sm mb-1">Great progress today!</p>
                <h2 className="text-4xl md:text-5xl font-black mb-3">Hi, {firstName}! 👋</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2">
                    <span className="text-sm font-black">{getSeverityLabel(severity)}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2">
                    <Flame size={16} className="text-orange-300" />
                    <span className="text-sm font-black">{streak} Day Streak</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2">
                    <span className="text-sm font-black">Beginner Learner</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <MascotGuide activity="thinking" mood="happy" />
            </div>
          </div>
        </div>

        <div className="space-y-10">
            
          {/* ── Feature Grid ─────────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Activity className="text-blue-500" /> Learning Activities
              </h2>
            </div>
            <div className="flex flex-col gap-4 items-center">
              {/* Row 1: Reading Practice, Vocabulary Builder, Word Detective */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {ALL_ACTIVITIES.slice(0, 3).map((actId) => {
                  const ui = ACTIVITY_UI_MAP[actId];
                  const unlocked = true; // All activities unlocked
                  
                  return (
                    <motion.button
                      key={actId}
                      whileHover={unlocked ? { scale: 1.03, y: -4 } : {}}
                      whileTap={unlocked ? { scale: 0.97 } : {}}
                      onClick={() => unlocked && navigate(`/activity/${actId}`)}
                      className={`relative flex flex-col items-start justify-center p-6 rounded-3xl border-2 transition-all duration-300 ${
                        unlocked 
                          ? `${ui.color} ${ui.hover} shadow-sm cursor-pointer` 
                          : "bg-slate-50 border-slate-200 text-slate-400 opacity-70 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex justify-between w-full items-start mb-4">
                        <div className={`p-3 rounded-2xl bg-white/50 backdrop-blur-sm border ${unlocked ? "border-white" : "border-slate-200"}`}>
                          {ui.icon}
                        </div>

                      </div>
                      <span className="font-black text-lg leading-tight mb-1">{ui.title}</span>
                      <span className="text-sm font-semibold opacity-80 text-left">{ui.desc}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Row 2: Story Explorer, Sentence Adventure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-2/3">
                {ALL_ACTIVITIES.slice(3, 5).map((actId) => {
                  const ui = ACTIVITY_UI_MAP[actId];
                  const unlocked = true; // All activities unlocked
                  
                  return (
                    <motion.button
                      key={actId}
                      whileHover={unlocked ? { scale: 1.03, y: -4 } : {}}
                      whileTap={unlocked ? { scale: 0.97 } : {}}
                      onClick={() => unlocked && navigate(`/activity/${actId}`)}
                      className={`relative flex flex-col items-start justify-center p-6 rounded-3xl border-2 transition-all duration-300 ${
                        unlocked 
                          ? `${ui.color} ${ui.hover} shadow-sm cursor-pointer` 
                          : "bg-slate-50 border-slate-200 text-slate-400 opacity-70 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex justify-between w-full items-start mb-4">
                        <div className={`p-3 rounded-2xl bg-white/50 backdrop-blur-sm border ${unlocked ? "border-white" : "border-slate-200"}`}>
                          {ui.icon}
                        </div>

                      </div>
                      <span className="font-black text-lg leading-tight mb-1">{ui.title}</span>
                      <span className="text-sm font-semibold opacity-80 text-left">{ui.desc}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
