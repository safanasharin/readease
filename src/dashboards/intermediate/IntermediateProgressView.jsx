import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Target, BookOpen, Brain, CalendarDays, CheckCircle, Clock, Activity, TrendingUp, Sun, Moon
} from "lucide-react";
import Navbar from "../../components/Navbar";

// Helper functions (same as Beginner)
const getSupportLevelLabel = (supportLevel, dyslexiaLevel) => {
  const sl = (supportLevel || "").toLowerCase();
  const dl = (dyslexiaLevel || "").toLowerCase();
  if (sl === "intensive_support" || dl === "severe" || dl === "level3") return "🚨 Severe Dyslexia Support";
  if (sl === "guided_support"    || dl === "moderate" || dl === "level2") return "🧭 Moderate Dyslexia Support";
  return "⭐ Mild Dyslexia Support";
};

const getActivitySupportLabel = (level) => {
  if (level === 1 || level === "Easy" || level === "1") return "🟢 Mild";
  if (level === 2 || level === "Medium" || level === "2") return "🟡 Moderate";
  if (level === 3 || level === "Hard" || level === "3") return "🔴 Severe";
  return "Not Assessed";
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function IntermediateProgressView({ user, summary }) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("dashboard-theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("dashboard-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const theme = {
    bg: isDarkMode ? "bg-[#0f172a]" : "bg-[#f8fafc]",
    text: isDarkMode ? "text-slate-100" : "text-slate-800",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    cardBg: isDarkMode ? "bg-slate-800/80" : "bg-white",
    cardBorder: isDarkMode ? "border-indigo-500/20" : "border-indigo-100",
    glass: "shadow-lg backdrop-blur-md",
  };

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const dyslexiaLevel = user?.dyslexiaLevel ? user.dyslexiaLevel.toLowerCase() : "mild";

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" } } };

  const FeatureCard = ({ icon, title, colorGradient, children, hasData }) => (
    <motion.div variants={itemVars} className={`relative p-6 rounded-[2rem] border ${theme.cardBorder} ${theme.cardBg} ${theme.glass} overflow-hidden group`}>
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br ${colorGradient} blur-2xl group-hover:opacity-20 transition-opacity`}></div>
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorGradient} shadow-lg flex items-center justify-center text-white flex-shrink-0`}>
          {icon}
        </div>
        <h3 className={`text-lg font-bold ${theme.text}`}>{title}</h3>
      </div>
      <div className="relative z-10 space-y-3">
        {hasData ? children : (
          <div className="flex items-center justify-center py-4 bg-slate-500/10 border border-dashed border-slate-500/30 rounded-xl">
            <p className={`text-sm italic ${theme.textMuted}`}>No activity yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const StatRow = ({ label, value }) => (
    <div className={`flex justify-between items-center py-2 border-b border-slate-500/10 last:border-0`}>
      <span className={`text-sm font-semibold ${theme.textMuted}`}>{label}</span>
      <span className={`text-sm font-black ${theme.text}`}>{value}</span>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} font-sans transition-colors duration-500 overflow-x-hidden relative pb-20`}>
      <h1 style={{ background: "purple", color: "white", padding: "10px", textAlign: "center", position: "relative", zIndex: 9999 }}>INTERMEDIATE VIEW LOADED</h1>
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
      
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-2 p-2 px-4 rounded-xl ${theme.cardBg} border ${theme.cardBorder} shadow-sm ${theme.textMuted} hover:${theme.text} transition-colors`}
          >
            <ArrowLeft size={18} /> <span className="font-bold text-sm">Back to Dashboard</span>
          </button>
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
            <div className="relative w-28 h-28 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] rotate-3 opacity-50"></div>
              <div className={`absolute inset-0 rounded-[2rem] ${theme.cardBg} border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl`}>
                {user?.name?.charAt(0)?.toUpperCase() || "I"}
              </div>
            </div>
            
            <div>
              <h1 className={`text-4xl font-extrabold ${theme.text} mb-2 tracking-tight`}>
                Progress Report
              </h1>
              <p className={`text-lg ${theme.textMuted} mb-4 font-medium`}>
                Track your achievements, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{user?.name || "Student"}</span>!
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
          
          <div className="flex flex-wrap gap-4 z-10">
            <div className={`p-4 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.glass} text-center min-w-[100px]`}>
              <p className="text-xs font-bold text-emerald-500 uppercase mb-1">Completion</p>
              <p className={`text-2xl font-black ${theme.text}`}>{summary?.storyCompletionPercentage || summary?.averageScore || 0}%</p>
            </div>
            <div className={`p-4 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.glass} text-center min-w-[100px]`}>
              <p className="text-xs font-bold text-blue-500 uppercase mb-1">Activities</p>
              <p className={`text-2xl font-black ${theme.text}`}>{summary?.completedSessions || 0}</p>
            </div>
            <div className={`p-4 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.glass} text-center min-w-[100px]`}>
              <p className="text-xs font-bold text-purple-500 uppercase mb-1">Time</p>
              <p className={`text-2xl font-black ${theme.text}`}>{Math.floor((summary?.totalTimeSpent || 0) / 60)}<span className="text-base">m</span></p>
            </div>
            <div className={`p-4 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.glass} text-center min-w-[100px]`}>
              <p className="text-xs font-bold text-amber-500 uppercase mb-1">XP Earned</p>
              <p className={`text-2xl font-black ${theme.text}`}>{summary?.totalXP || 0}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: FEATURE ANALYTICS */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className={`text-2xl font-black ${theme.text} flex items-center gap-3 mb-2`}>
              <Activity className="text-indigo-500" size={28} /> Feature Analytics
            </h2>

            <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FeatureCard 
                icon={<BookOpen size={22} />} 
                title="Reading Practice" 
                colorGradient="from-blue-500 to-indigo-600"
                hasData={!!summary}
              >
                <StatRow label="Reading Accuracy" value={`${summary?.averageScore || 0}%`} />
                <StatRow label="Words Read" value={summary?.wordsRead || 0} />
                <StatRow label="Sessions Completed" value={summary?.completedSessions || 0} />
                <StatRow label="Best Score" value={`${summary?.averageScore || 0}%`} />
                <StatRow label="Support Level" value={getActivitySupportLabel(summary?.currentReadingLevel || 1)} />
              </FeatureCard>

              <FeatureCard 
                icon={<Target size={22} />} 
                title="Vocabulary Builder" 
                colorGradient="from-emerald-400 to-teal-500"
                hasData={!!summary?.vocabularyData}
              >
                <StatRow label="Words Learned" value={summary?.vocabularyData?.wordsLearned || 0} />
                <StatRow label="Mastered Words" value={summary?.vocabularyData?.masteredWords || 0} />
                <StatRow label="Accuracy" value={`${summary?.vocabularyData?.accuracy || 0}%`} />
                <StatRow label="Support Level" value={getActivitySupportLabel(summary?.vocabularyData?.currentLevel || 1)} />
              </FeatureCard>

              <FeatureCard 
                icon={<Brain size={22} />} 
                title="Word Detective" 
                colorGradient="from-violet-500 to-purple-600"
                hasData={!!summary?.wordDetectiveData}
              >
                <StatRow label="Questions Attempted" value={summary?.wordDetectiveData?.attempted || 0} />
                <StatRow label="Correct Answers" value={summary?.wordDetectiveData?.correct || 0} />
                <StatRow label="Accuracy" value={`${summary?.wordDetectiveData?.accuracy || 0}%`} />
                <StatRow label="Support Level" value={getActivitySupportLabel(summary?.wordDetectiveData?.currentLevel || 1)} />
              </FeatureCard>

              <FeatureCard 
                icon={<CalendarDays size={22} />} 
                title="Story Explorer" 
                colorGradient="from-amber-400 to-orange-500"
                hasData={!!summary}
              >
                <StatRow label="Stories Read" value={summary?.completedStoriesCount || 0} />
                <StatRow label="Reading Time" value={`${Math.floor((summary?.storyExplorerTotalTime || 0) / 60)}m`} />
                <StatRow label="Completion %" value={`${summary?.storyCompletionPercentage || 0}%`} />
                <StatRow label="Comprehension Acc" value={`${summary?.storyCompletionPercentage || 0}%`} />
              </FeatureCard>

              <FeatureCard 
                icon={<CheckCircle size={22} />} 
                title="Sentence Adventure" 
                colorGradient="from-pink-500 to-rose-500"
                hasData={!!summary?.sentenceAdventureData}
              >
                <StatRow label="Activities Completed" value={summary?.sentenceAdventureData?.completed || 0} />
                <StatRow label="Voice Practice Acc" value={`${summary?.sentenceAdventureData?.voiceAccuracy || summary?.averageScore || 0}%`} />
                <StatRow label="XP Earned" value={summary?.sentenceAdventureData?.xp || 0} />
                <StatRow label="Support Level" value={getActivitySupportLabel(summary?.sentenceAdventureData?.currentLevel || 1)} />
              </FeatureCard>

            </motion.div>
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="space-y-8">
            
            {/* LEARNING AIDS */}
            <motion.div variants={itemVars} initial="hidden" animate="show">
              <h2 className={`text-xl font-bold ${theme.text} mb-4 flex items-center gap-2`}>
                <Target size={24} className="text-indigo-500" />
                Learning Aids
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { title: '📖 Reading Support', desc: 'Focus on phonics, blending, and reading aloud with accuracy.', color: 'blue' },
                  { title: '💡 Vocabulary Support', desc: 'Review power words and track new vocabulary mastery.', color: 'emerald' },
                  { title: '🔍 Word Recognition', desc: 'Help identifying sight words and decoding tricky letters.', color: 'purple' },
                  { title: '🌍 Story Comprehension', desc: 'Interactive quizzes to ensure understanding of the narrative.', color: 'amber' },
                  { title: '🧩 Sentence Building', desc: 'Guided practice on forming grammatically correct sentences.', color: 'pink' }
                ].map((aid, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${theme.cardBorder} ${theme.cardBg} ${theme.glass} hover:border-${aid.color}-500/30 transition-colors`}>
                    <p className={`font-semibold text-sm text-${aid.color}-500 dark:text-${aid.color}-400`}>{aid.title}</p>
                    <p className={`text-xs mt-1 ${theme.textMuted}`}>{aid.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RECENT ACTIVITY */}
            <motion.div variants={itemVars} initial="hidden" animate="show" className="flex-1">
              <h2 className={`text-xl font-bold ${theme.text} flex items-center gap-2 mb-4`}>
                <Clock size={24} className="text-indigo-500" />
                Recent Activity
              </h2>
              <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.glass}`}>
                {(!summary?.recentActivities || summary.recentActivities.length === 0) ? (
                  <p className={`text-center py-6 italic ${theme.textMuted}`}>No recent activity found.</p>
                ) : (
                  <div className="space-y-4">
                    {summary.recentActivities
                      .filter((activity) => ["reading_practice", "vocabulary_builder", "word_detective", "story_reading", "sentence_builder", "voice-practice", "reader"].includes(activity.activityType))
                      .slice(0, 5)
                      .map((activity, index) => (
                      <div key={index} className={`flex flex-col gap-2 p-4 rounded-xl border border-slate-500/10 hover:bg-slate-500/5 transition-colors`}>
                        <div className="flex justify-between items-start">
                          <span className={`font-bold text-sm truncate pr-2 ${theme.text}`}>
                           {activity.storyTitle || activity.activityType.replace("-", " ").replace("_", " ").toUpperCase()}
                          </span>
                          <span className={`text-xs font-bold whitespace-nowrap ${theme.textMuted}`}>
                            {formatDate(activity.date)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm mt-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            ['voice-practice', 'reading_practice'].includes(activity.activityType) 
                              ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400' 
                              : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                          }`}>
                            {activity.activityType.replace("-", " ").replace("_", " ")}
                          </span>
                          
                          <div className="flex gap-3">
                            {activity.completed ? (
                              <span className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                                <CheckCircle size={14} /> Done
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                                <Clock size={14} /> In Progress
                              </span>
                            )}
                            
                            {activity.score > 0 && (
                              <span className="font-black text-indigo-500 dark:text-indigo-400 text-xs flex items-center gap-1">
                                {activity.score}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}
