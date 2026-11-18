import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";
import { 
  Moon, Sun, BookOpen, Mic, Bookmark, TrendingUp, 
  Activity, Trophy, Star, Clock, CheckCircle 
} from "lucide-react";

export default function IntermediateDashboard() {
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
  
  // Theme classes - Indigo/Purple/Blue palette
  const theme = {
    bg: isDarkMode ? "bg-[#0f172a]" : "bg-[#f8fafc]",
    text: isDarkMode ? "text-slate-100" : "text-slate-800",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    cardBg: isDarkMode ? "bg-slate-800/80" : "bg-white",
    cardBorder: isDarkMode ? "border-indigo-500/20" : "border-indigo-100",
    glass: "shadow-lg backdrop-blur-md",
  };

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const formattedDate = user?.assessmentDate 
    ? new Date(user.assessmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : "Recent";

  const modules = [
    {
      title: "AI Reading Assistant",
      desc: "Practice reading aloud and improve pronunciation.",
      icon: <Mic size={26} className="text-white" />,
      path: "/voice-practice",
      btnText: "Start Practice",
      gradient: "from-violet-500 to-purple-600",
      glow: isDarkMode ? "hover:shadow-purple-500/30" : "hover:shadow-purple-500/20"
    },
    {
      title: "Reader Module",
      desc: "Read passages and improve comprehension skills.",
      icon: <BookOpen size={26} className="text-white" />,
      path: "/reader",
      btnText: "Start Reading",
      gradient: "from-blue-500 to-indigo-600",
      glow: isDarkMode ? "hover:shadow-blue-500/30" : "hover:shadow-blue-500/20"
    },
    {
      title: "Story Module",
      desc: "Explore interactive stories and reading adventures.",
      icon: <Bookmark size={26} className="text-white" />,
      path: "/stories",
      btnText: "Read Stories",
      gradient: "from-emerald-400 to-teal-500",
      glow: isDarkMode ? "hover:shadow-emerald-500/30" : "hover:shadow-emerald-500/20"
    },
    {
      title: "Rewards",
      desc: "View badges and achievements earned.",
      icon: <Trophy size={26} className="text-white" />,
      path: "/rewards",
      btnText: "View Rewards",
      gradient: "from-amber-400 to-orange-500",
      glow: isDarkMode ? "hover:shadow-amber-500/30" : "hover:shadow-amber-500/20"
    },
    {
      title: "Daily Challenges",
      desc: "Complete daily activities and earn points.",
      icon: <Star size={26} className="text-white" />,
      path: "/challenges",
      btnText: "Start Challenge",
      gradient: "from-pink-500 to-rose-500",
      glow: isDarkMode ? "hover:shadow-pink-500/30" : "hover:shadow-pink-500/20"
    }
  ];

  // Animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className={`min-h-screen ${theme.bg} font-sans transition-colors duration-500 overflow-x-hidden relative pb-20`}>
      {/* Soft Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
      
      <Navbar />
      
      <div className="pt-24 max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Controls */}
        <div className="flex justify-end mb-6">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm ${theme.text}`}
          >
            {isDarkMode ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} className="text-indigo-600" />}
          </motion.button>
        </div>

        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className={`w-full p-8 md:p-10 rounded-[2rem] border ${theme.cardBorder} bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-blue-600/10 ${theme.glass} flex flex-col md:flex-row items-center justify-between gap-8 mb-10 overflow-hidden relative`}
        >
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left z-10">
            <div className="relative w-32 h-32 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] rotate-3 opacity-50"></div>
              <div className={`absolute inset-0 rounded-[2rem] ${theme.cardBg} border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl`}>
                {user?.name?.charAt(0)?.toUpperCase() || "L"}
              </div>
            </div>
            
            <div>
              <h1 className={`text-4xl md:text-5xl font-extrabold ${theme.text} mb-3 tracking-tight`}>
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{user?.name || "Learner"}</span>!
              </h1>
              <p className={`text-lg ${theme.textMuted} mb-4 font-medium`}>
                Ready to continue your learning journey today?
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-semibold">
                <span className={`px-4 py-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300`}>
                  {capitalize(user?.ageGroup)} Level
                </span>
                <span className={`px-4 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300`}>
                  Dyslexia: {capitalize(dyslexiaLevel)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block z-10 bg-white/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-white/20 backdrop-blur-sm">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <p className={`text-sm font-bold ${theme.textMuted}`}>Current Streak</p>
                  <p className={`text-2xl font-black text-orange-500`}>{progressStats.streak} Days</p>
                </div>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - STATS & PROGRESS */}
          <div className="lg:col-span-4 space-y-8">
            
            <motion.div 
              variants={itemVars} initial="hidden" animate="show"
              className={`p-7 rounded-[2rem] border ${theme.cardBorder} ${theme.cardBg} ${theme.glass}`}
            >
              <h3 className={`text-xl font-bold ${theme.text} mb-6 flex items-center gap-3`}>
                <Activity size={24} className="text-indigo-500" /> 
                Progress Overview
              </h3>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${theme.textMuted}`}>Lessons</p>
                      <p className={`text-lg font-bold ${theme.text}`}>{progressStats.lessonsCompleted}</p>
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{width: `${Math.min((progressStats.lessonsCompleted / 20) * 100, 100)}%`}}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                      <Bookmark size={18} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${theme.textMuted}`}>Stories</p>
                      <p className={`text-lg font-bold ${theme.text}`}>{progressStats.storiesRead}</p>
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{width: `${Math.min((progressStats.storiesRead / 10) * 100, 100)}%`}}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <Clock size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${theme.textMuted}`}>Minutes Read</p>
                      <p className={`text-lg font-bold ${theme.text}`}>{progressStats.readingTime}</p>
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{width: `${Math.min((progressStats.readingTime / 120) * 100, 100)}%`}}></div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVars} initial="hidden" animate="show"
              className={`p-7 rounded-[2rem] border ${theme.cardBorder} ${theme.cardBg} ${theme.glass}`}
            >
              <h3 className={`text-xl font-bold ${theme.text} mb-6 flex items-center gap-3`}>
                <Clock size={24} className="text-teal-500" /> 
                Recent Activity
              </h3>
              <div className="space-y-5">
                {progressStats.recentActivity && progressStats.recentActivity.length > 0 ? (
                  progressStats.recentActivity.slice(0, 3).map((act, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className="flex flex-col items-center mt-1">
                        <div className={`w-3 h-3 rounded-full ${act.completed ? 'bg-teal-500 ring-4 ring-teal-500/20' : 'bg-indigo-400 ring-4 ring-indigo-400/20'}`}></div>
                        {i !== 2 && <div className="w-0.5 h-12 bg-indigo-100 dark:bg-slate-700 mt-2"></div>}
                      </div>
                      <div>
                        <p className={`text-base font-bold ${theme.text} group-hover:text-indigo-500 transition-colors`}>
                          {act.storyTitle || "Reading Practice"}
                        </p>
                        <p className={`text-sm font-medium ${theme.textMuted} mt-1`}>
                          {act.activityType === 'voice-practice' ? 'Voice Session' : 'Reading Session'} • {new Date(act.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-6 px-4 rounded-xl border border-dashed ${theme.cardBorder} bg-slate-50/50 dark:bg-slate-800/50`}>
                    <p className={`text-sm font-medium ${theme.textMuted}`}>
                      No recent activity yet. Select a module to begin!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN - MODULES */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6 pl-2">
              <h2 className={`text-2xl font-extrabold ${theme.text}`}>
                Learning Modules
              </h2>
            </div>
            
            <motion.div 
              variants={containerVars} initial="hidden" animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {modules.map((mod, idx) => (
                <motion.div 
                  variants={itemVars}
                  key={idx}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(mod.path)}
                  className={`relative p-6 rounded-[2rem] border ${theme.cardBorder} ${theme.cardBg} ${theme.glass} cursor-pointer transition-all duration-300 ${mod.glow} flex flex-col h-full overflow-hidden group`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mod.gradient} opacity-10 rounded-bl-[100px] transition-opacity group-hover:opacity-20`}></div>
                  
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.gradient} shadow-lg flex items-center justify-center flex-shrink-0 text-white transform group-hover:rotate-6 transition-transform`}>
                      {mod.icon}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-indigo-500 font-bold">→</span>
                    </div>
                  </div>
                  
                  <h3 className={`text-xl font-bold ${theme.text} mb-3 relative z-10`}>{mod.title}</h3>
                  <p className={`text-sm font-medium ${theme.textMuted} mb-6 flex-grow leading-relaxed relative z-10`}>{mod.desc}</p>
                  
                  <div className="mt-auto relative z-10">
                    <button className={`w-full py-3.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 ${theme.text} transition-colors flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:${mod.gradient} group-hover:text-white`}>
                      {mod.btnText}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
