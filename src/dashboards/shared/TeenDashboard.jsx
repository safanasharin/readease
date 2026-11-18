import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import { 
  Moon, Sun, BookOpen, Mic, Bookmark, TrendingUp, 
  Activity, Trophy, Star, Clock, CheckCircle 
} from "lucide-react";

export default function TeenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("dashboard-theme") === "dark"
  );
  
  const [progressStats, setProgressStats] = useState({
    lessonsCompleted: user?.exerciseHistory?.length || 0,
    storiesRead: 0,
    readingTime: Math.floor((user?.dailySession?.totalMinutes || 0)),
    streak: user?.gamification?.streak || user?.currentStreak || 0,
    recentActivity: []
  });

  useEffect(() => {
    localStorage.setItem("dashboard-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    if (!user || !user._id) return;
    const token = localStorage.getItem("token");
    
    async function fetchProgress() {
      try {
        const res = await fetch(`http://localhost:5000/api/progress/summary/${user._id}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProgressStats(prev => ({
            ...prev,
            lessonsCompleted: data.totalSessions || prev.lessonsCompleted,
            storiesRead: data.completedStoriesCount || prev.storiesRead,
            readingTime: data.totalReadingTime ? Math.floor(data.totalReadingTime / 60) : prev.readingTime,
            recentActivity: data.recentActivity || []
          }));
        }
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    }
    fetchProgress();
  }, [user]);

  // Derived Values
  const dyslexiaLevel = user?.dyslexiaLevel ? user.dyslexiaLevel.toLowerCase() : "mild";
  
  // Theme classes
  const theme = {
    bg: isDarkMode ? "bg-slate-900" : "bg-slate-50",
    text: isDarkMode ? "text-slate-100" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-600",
    cardBg: isDarkMode ? "bg-slate-800/40" : "bg-white/70",
    cardBorder: isDarkMode ? "border-slate-700/50" : "border-white/50",
    glass: "backdrop-blur-xl shadow-xl",
  };

  // Level Specific Colors (For Badges Only)
  let levelColor = "text-green-500";
  let levelBg = "bg-green-500/10 border-green-500/20";
  
  if (dyslexiaLevel === "moderate") {
    levelColor = "text-orange-500";
    levelBg = "bg-orange-500/10 border-orange-500/20";
  } else if (dyslexiaLevel === "severe") {
    levelColor = "text-red-500";
    levelBg = "bg-red-500/10 border-red-500/20";
  }

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const formattedDate = user?.assessmentDate 
    ? new Date(user.assessmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : "Recent";

  // Learning Features Section
  const modules = [
    {
      title: "AI Reading Assistant",
      desc: "Practice reading aloud and improve pronunciation.",
      icon: <Mic size={24} className="text-purple-500" />,
      path: "/voice-practice",
      btnText: "Start Practice",
      glow: isDarkMode ? "hover:shadow-purple-500/20" : "hover:shadow-purple-500/10"
    },
    {
      title: "Reader Module",
      desc: "Read passages and improve comprehension skills.",
      icon: <BookOpen size={24} className="text-blue-500" />,
      path: "/reader",
      btnText: "Start Reading",
      glow: isDarkMode ? "hover:shadow-blue-500/20" : "hover:shadow-blue-500/10"
    },
    {
      title: "Story Module",
      desc: "Explore interactive stories and reading adventures.",
      icon: <Bookmark size={24} className="text-emerald-500" />,
      path: "/stories",
      btnText: "Read Stories",
      glow: isDarkMode ? "hover:shadow-emerald-500/20" : "hover:shadow-emerald-500/10"
    },
    {
      title: "Progress Dashboard",
      desc: "Track learning achievements and growth.",
      icon: <TrendingUp size={24} className="text-orange-500" />,
      path: "/progress",
      btnText: "View Progress",
      glow: isDarkMode ? "hover:shadow-orange-500/20" : "hover:shadow-orange-500/10"
    },
    {
      title: "Rewards",
      desc: "View badges and achievements earned.",
      icon: <Trophy size={24} className="text-yellow-500" />,
      path: "/rewards",
      btnText: "View Rewards",
      glow: isDarkMode ? "hover:shadow-yellow-500/20" : "hover:shadow-yellow-500/10"
    },
    {
      title: "Daily Challenges",
      desc: "Complete daily activities and earn points.",
      icon: <Star size={24} className="text-pink-500" />,
      path: "/challenges",
      btnText: "Start Challenge",
      glow: isDarkMode ? "hover:shadow-pink-500/20" : "hover:shadow-pink-500/10"
    }
  ];

  return (
    <div className={`min-h-screen ${theme.bg} font-sans transition-colors duration-500 overflow-x-hidden relative pb-20`}>
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse pointer-events-none" style={{animationDelay: "2s"}}></div>
      
      <Navbar />
      
      <div className="pt-24 max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Controls */}
        <div className="flex justify-end mb-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-full ${theme.cardBg} border ${theme.cardBorder} ${theme.glass} ${theme.text}`}
          >
            {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-500" />}
          </motion.button>
        </div>

        {/* 1. TOP WELCOME HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`w-full p-8 md:p-10 rounded-3xl border ${theme.cardBorder} bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 ${theme.glass} flex flex-col md:flex-row items-center justify-between gap-8 mb-8`}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Avatar */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full animate-spin" style={{animationDuration: "8s"}}></div>
              <div className={`absolute inset-1 rounded-full ${theme.bg} flex items-center justify-center text-4xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-indigo-500 to-purple-500`}>
                {user?.name?.charAt(0)?.toUpperCase() || "L"}
              </div>
            </div>
            
            {/* Profile Details */}
            <div>
              <h1 className={`text-3xl md:text-4xl font-extrabold ${theme.text} mb-2`}>
                Welcome Back, {user?.name || "Student"}! 👋
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium">
                <span className={`px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20`}>
                  Age: {user?.age || "N/A"}
                </span>
                <span className={`px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20`}>
                  Age Group: {capitalize(user?.ageGroup)} Learner
                </span>
                <span className={`px-3 py-1 rounded-full ${levelBg} ${levelColor}`}>
                  Dyslexia Level: {capitalize(dyslexiaLevel)}
                </span>
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="max-w-xs text-center md:text-right">
            <p className={`text-lg font-medium italic ${theme.textMuted}`}>
              "Every reading session helps build stronger skills and confidence."
            </p>
          </div>
        </motion.div>

        {/* SPLIT LAYOUT (SIDEBAR + MAIN GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDEBAR (1/3) */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Assessment Information Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={`p-6 rounded-3xl border ${theme.cardBorder} ${theme.cardBg} ${theme.glass}`}
            >
              <div className="flex items-center gap-3 mb-5">
                <Activity size={20} className={theme.text} />
                <h3 className={`text-lg font-bold ${theme.text}`}>Assessment Result</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                  <span className={`${theme.textMuted} font-medium text-sm`}>Dyslexia Level</span>
                  <span className={`font-bold px-3 py-1 rounded-lg text-sm ${levelBg} ${levelColor}`}>
                    {capitalize(dyslexiaLevel)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                  <span className={`${theme.textMuted} font-medium text-sm`}>Assessment Date</span>
                  <span className={`font-semibold ${theme.text} text-sm`}>{formattedDate}</span>
                </div>
              </div>
            </motion.div>

            {/* Progress Summary Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`p-6 rounded-3xl border ${theme.cardBorder} ${theme.cardBg} ${theme.glass}`}
            >
              <h3 className={`text-lg font-bold ${theme.text} mb-4 flex items-center gap-2`}>
                <TrendingUp size={20} className="text-orange-500" /> Progress Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-2xl border ${theme.cardBorder} bg-indigo-500/5`}>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>Lessons</p>
                  <p className={`text-xl font-black ${theme.text}`}>{progressStats.lessonsCompleted}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${theme.cardBorder} bg-emerald-500/5`}>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>Stories</p>
                  <p className={`text-xl font-black ${theme.text}`}>{progressStats.storiesRead}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${theme.cardBorder} bg-blue-500/5`}>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>Reading Time</p>
                  <p className={`text-xl font-black ${theme.text}`}>{progressStats.readingTime} <span className="text-xs">m</span></p>
                </div>
                <div className={`p-4 rounded-2xl border ${theme.cardBorder} bg-orange-500/5`}>
                  <p className={`text-xs ${theme.textMuted} mb-1`}>Streak</p>
                  <p className={`text-xl font-black text-orange-500 flex items-center gap-1`}>
                    {progressStats.streak} <span className="text-sm">🔥</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity Timeline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className={`p-6 rounded-3xl border ${theme.cardBorder} ${theme.cardBg} ${theme.glass}`}
            >
              <h3 className={`text-lg font-bold ${theme.text} mb-5 flex items-center gap-2`}>
                <Clock size={20} className="text-teal-500" /> Recent Activity
              </h3>
              <div className="space-y-4">
                {progressStats.recentActivity && progressStats.recentActivity.length > 0 ? (
                  progressStats.recentActivity.slice(0, 3).map((act, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center mt-1">
                        <div className={`w-2 h-2 rounded-full ${act.completed ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                        {i !== 2 && <div className="w-0.5 h-10 bg-gray-200 dark:bg-gray-700 mt-1"></div>}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${theme.text}`}>{act.storyTitle || "Reading Practice"}</p>
                        <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                          {act.activityType === 'voice-practice' ? 'Voice Session' : 'Reading Session'} • {new Date(act.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${theme.textMuted} italic text-center py-4`}>
                    No recent activity yet. Start a module!
                  </p>
                )}
              </div>
            </motion.div>

          </div>

          {/* MAIN AREA (2/3) - LEARNING FEATURES GRID */}
          <div className="lg:col-span-2 space-y-6">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className={`text-2xl font-bold ${theme.text} pl-2`}
            >
              Learning Features
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {modules.map((mod, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.1 + (idx * 0.05) }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(mod.path)}
                  className={`p-6 rounded-3xl border ${theme.cardBorder} ${theme.cardBg} ${theme.glass} cursor-pointer transition-shadow ${mod.glow} flex flex-col h-full`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-black/10 flex items-center justify-center border border-white/5 flex-shrink-0 shadow-sm">
                      {mod.icon}
                    </div>
                    <h3 className={`text-lg font-bold ${theme.text} leading-tight`}>{mod.title}</h3>
                  </div>
                  <p className={`text-sm ${theme.textMuted} mb-6 flex-grow leading-relaxed`}>{mod.desc}</p>
                  
                  <div className="mt-auto">
                    <button className={`w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2`}>
                      {mod.btnText}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
