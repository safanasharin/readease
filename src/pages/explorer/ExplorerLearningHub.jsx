/* eslint-disable */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDailyJourney } from "../../recommendationEngine/useDailyJourney";
import { useActivityProgress } from "../../activityEngine/useActivityProgress";
import { getStories } from "../../services/storyService";
import MascotGuide from "../../components/explorer/MascotGuide";
import RewardPopup from "../../components/explorer/RewardPopup";
import { 
  Star, Trophy, Zap, ArrowLeft, Clock, Users, 
  ChevronRight, Lock, BookOpen, Activity, PlayCircle, 
  Flame, CheckCircle, LogOut 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ALL_ACTIVITIES = [
  "tracing",
  "sound-matching",
  "memory",
  "sorting",
  "story",
  "letter-confusion",
  "sequencing"
];

const ACTIVITY_UI_MAP = {
  "tracing": { title: "Letter Tracing", icon: "✍️", color: "bg-pink-100 text-pink-700 border-pink-200", hover: "hover:shadow-pink-200" },
  "sound-matching": { title: "Sound Matching", icon: "🎵", color: "bg-blue-100 text-blue-700 border-blue-200", hover: "hover:shadow-blue-200" },
  "memory": { title: "Memory Game", icon: "🧠", color: "bg-purple-100 text-purple-700 border-purple-200", hover: "hover:shadow-purple-200" },
  "sorting": { title: "Shape Sorting", icon: "🟦", color: "bg-amber-100 text-amber-700 border-amber-200", hover: "hover:shadow-amber-200" },
  "story": { title: "Story Reading", icon: "📖", color: "bg-emerald-100 text-emerald-700 border-emerald-200", hover: "hover:shadow-emerald-200" },
  "letter-confusion": { title: "Letter Detective", icon: "🔍", color: "bg-indigo-100 text-indigo-700 border-indigo-200", hover: "hover:shadow-indigo-200" },
  "sequencing": { title: "Sequencing", icon: "🔢", color: "bg-orange-100 text-orange-700 border-orange-200", hover: "hover:shadow-orange-200" }
};

const SUPPORT_CONFIG = {
  emerging_support: {
    label: "🌱 Emerging Support",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    sessionLimit: 20,
  },
  guided_support: {
    label: "🌿 Guided Support",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    sessionLimit: 15,
  },
  intensive_support: {
    label: "🌳 Intensive Support",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    sessionLimit: 10,
  },
};

// Maps internal support/dyslexia levels → parent-friendly labels
const getSupportLevelLabel = (supportLevel, dyslexiaLevel) => {
  const sl = (supportLevel || "").toLowerCase();
  const dl = (dyslexiaLevel || "").toLowerCase();
  if (sl === "intensive_support" || dl === "severe" || dl === "level3") return "🔴 Severe Dyslexia Support";
  if (sl === "guided_support"    || dl === "moderate" || dl === "level2") return "🟡 Moderate Dyslexia Support";
  return "🟢 Mild Dyslexia Support";
};

const CATEGORY_ICONS = {
  "Animals": "🦁",
  "Adventure": "🗺️",
  "Nature": "🌿",
  "Friendship": "🤝",
  "Fantasy": "🧚",
  "Learning": "📚"
};

// ─── Session Limit Overlay ────────────────────────────────────────────────────
function SessionLimitOverlay({ childName, sessionLimit, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
      >
        <div className="text-7xl mb-4">⏰</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Great Work Today! 🌟</h2>
        <p className="text-gray-500 font-semibold mb-4">
          {childName} has reached today's {sessionLimit}-minute learning limit. Time for a break!
        </p>
        <p className="text-sm text-indigo-500 font-bold mb-6">
          Come back tomorrow for more adventures! 🦁
        </p>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black px-8 py-3 rounded-full shadow-md hover:scale-105 transition cursor-pointer"
        >
          Got it! 👍
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Inner Hub ────────────────────────────────────────────────────────────────
function ExplorerHubInner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { gamification } = useDailyJourney();
  const { isUnlocked } = useActivityProgress();
  
  const [showSessionLimit, setShowSessionLimit] = useState(false);


  const firstName = user?.name?.split(" ")[0] || "Explorer";
  const totalXP = gamification?.totalXP || 0;
  const totalStars = gamification?.totalStars || 0;
  const level = gamification?.level || 1;
  const badges = gamification?.badges || [];

  const supportLevel = user?.supportLevel || "guided_support";
  const sc = SUPPORT_CONFIG[supportLevel] || SUPPORT_CONFIG.guided_support;

  // Streak simulation (mocking since user model streak needs backend)
  const streak = 3; 

  // Check if session limit reached
  const dailySession = user?.dailySession || {};
  const sessionStartTime = dailySession.sessionStart ? new Date(dailySession.sessionStart) : null;
  const sessionMinutes = sessionStartTime
    ? Math.floor((Date.now() - sessionStartTime.getTime()) / 60000)
    : 0;
  const sessionLimitReached = sessionMinutes >= sc.sessionLimit;

  // Show overlay once if session limit reached
  useEffect(() => {
    if (sessionLimitReached) {
      setShowSessionLimit(true);
    }
  }, [sessionLimitReached]);



  // Progress summary mock stats based on XP/Level
  const progressStats = {
    storiesRead: Math.floor(totalXP / 30) || 0,
    lessonsCompleted: Math.floor(totalXP / 15) || 0,
    readingTime: Math.floor(totalXP / 5) || 0
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <RewardPopup />

      {/* Session Limit Overlay */}
      <AnimatePresence>
        {showSessionLimit && (
          <SessionLimitOverlay
            childName={firstName}
            sessionLimit={sc.sessionLimit}
            onClose={() => setShowSessionLimit(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Top Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🦁</span>
          <div>
            <h1 className="font-black text-xl text-indigo-900 leading-tight">ReadEase</h1>
            <span className="text-[10px] uppercase tracking-wider bg-pink-100 text-pink-600 font-black px-2 py-0.5 rounded-full">Explorer</span>
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
              onClick={() => {
                if (user?.ageGroup === 1) {
                  navigate("/child-parent");
                } else {
                  navigate("/parent");
                }
              }}
              className="hidden md:flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-indigo-300 rounded-xl px-4 py-2 text-sm font-black text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer shadow-sm"
            >
              <Users size={16} /> Parent View
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex items-center gap-2 bg-red-50 border-2 border-red-100 hover:border-red-300 rounded-xl px-4 py-2 text-sm font-black text-red-600 hover:bg-red-100 transition-all cursor-pointer shadow-sm"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ── Premium Hero Section ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden mb-10 group">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 text-[180px] opacity-10 select-none leading-none -translate-x-8 translate-y-12 rotate-12">🌟</div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl">
                <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center text-4xl border-4 border-white">
                  👦
                </div>
              </div>
              <div>
                <p className="text-indigo-100 font-bold uppercase tracking-wider text-sm mb-1">Welcome back, Explorer!</p>
                <h2 className="text-4xl md:text-5xl font-black mb-3">Hi, {firstName}! 👋</h2>
                <div className="flex flex-wrap items-center gap-3">

                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2">
                    <Clock size={16} className="text-indigo-100" />
                    <span className="text-sm font-black">{sc.sessionLimit} min/day</span>
                  </div>
                  <div className={`inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2`}>
                    <span className="text-sm font-black">{getSupportLevelLabel(user?.supportLevel, user?.dyslexiaLevel)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <MascotGuide activity="thinking" mood="happy" />
            </div>
          </div>
        </div>

        {/* ── Main Layout ─────────────────────────────────────────────────── */}
        <div className="space-y-10">
            
            {/* Feature Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                  <Activity className="text-indigo-500" /> Learning Activities
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {ALL_ACTIVITIES.map((actId) => {
                  const ui = ACTIVITY_UI_MAP[actId] || { title: actId, icon: "🎮", color: "bg-gray-100 text-gray-700 border-gray-200" };
                  const unlocked = isUnlocked(actId);
                  
                  return (
                    <motion.button
                      key={actId}
                      whileHover={unlocked ? { scale: 1.05, y: -5 } : {}}
                      whileTap={unlocked ? { scale: 0.95 } : {}}
                      onClick={() => unlocked && navigate(`/explorer/activity/${actId}`)}
                      className={`relative flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-300 ${
                        unlocked 
                          ? `${ui.color} ${ui.hover} shadow-sm cursor-pointer` 
                          : "bg-gray-50 border-gray-200 text-gray-400 opacity-70 cursor-not-allowed"
                      }`}
                    >
                      <div className="text-4xl mb-3 drop-shadow-sm">{ui.icon}</div>
                      <span className="font-black text-sm text-center leading-tight">{ui.title}</span>
                      
                      {!unlocked && (
                        <div className="absolute top-3 right-3 bg-white/80 p-1.5 rounded-full shadow-sm backdrop-blur-sm">
                          <Lock size={12} className="text-gray-400" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* Mascot Sidekick */}
            <div className="mt-8 scale-90 origin-top flex justify-center">
              <MascotGuide activity="idle" mood="happy" />
            </div>


      </div>
    </div>
  </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function ExplorerLearningHub() {
  return (
    <ExplorerHubInner />
  );
}
