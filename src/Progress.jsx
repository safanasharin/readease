import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Target, BookOpen, Brain, CalendarDays, CheckCircle, Clock, TrendingUp, Activity
} from "lucide-react";
import IntermediateProgressView from "./dashboards/intermediate/IntermediateProgressView";
import AdvancedProgressView from "./dashboards/advanced/AdvancedProgressView";

const EmptyState = () => (
  <div className="flex items-center justify-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
    <p className="text-slate-400 font-bold italic">No activity yet</p>
  </div>
);

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

export default function Progress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user || !token) {
      navigate("/");
      return;
    }

    const userId = user._id;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const summaryRes = await fetch(
          `http://localhost:5000/api/child-progress/summary/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const summaryData = await summaryRes.json();
        if (!summaryRes.ok) throw new Error(summaryData.message || "Failed to fetch summary");

        setSummary(summaryData);

      } catch (err) {
        console.error("Progress fetch error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/beginner")}
            className="w-full bg-teal-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-teal-700 transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  console.log("User:", user);
  console.log("Age Group:", user?.ageGroup);
  
  const ageGroup = String(user?.ageGroup).toLowerCase();

  // Uncomment the line below to FORCE-TEST the Advanced view if necessary
  // return <AdvancedProgressView user={user} summary={summary} />;

  if (ageGroup === "3" || ageGroup === "intermediate") {
    return <IntermediateProgressView user={user} summary={summary} />;
  }

  if (ageGroup === "4" || ageGroup === "advanced") {
    return <AdvancedProgressView user={user} summary={summary} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <h1 style={{ background: "red", color: "white", padding: "10px", textAlign: "center", position: "relative", zIndex: 9999 }}>BEGINNER VIEW LOADED</h1>
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/beginner")}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-teal-600 cursor-pointer"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Parent Dashboard
              </h1>
              <p className="text-sm font-bold text-slate-400">Beginner Learning Stage</p>
            </div>
          </div>
          <div className="bg-teal-50 px-4 py-2 rounded-xl border border-teal-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 font-bold text-sm">
              {user?.name?.[0] || "B"}
            </div>
            <div>
              <p className="text-sm font-black text-teal-900">{user?.name || "Beginner"}</p>
              <p className="text-[10px] font-bold text-teal-500 uppercase tracking-wider">{getSupportLevelLabel(user?.supportLevel, user?.dyslexiaLevel)}</p>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="pt-10 px-6 max-w-7xl mx-auto">

        {/* OVERVIEW SECTION */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="relative w-32 h-32 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-blue-500 rounded-full animate-spin" style={{animationDuration: "10s"}}></div>
            <div className="absolute inset-2 rounded-full bg-slate-50 flex items-center justify-center text-5xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-teal-600 to-blue-600">
              {user?.name?.charAt(0)?.toUpperCase() || "B"}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-800 mb-2">{user?.name || "Beginner"}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 font-bold text-sm">
                Stage: Beginner
              </span>
              <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                {getSupportLevelLabel(user?.supportLevel, user?.dyslexiaLevel)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center min-w-[100px]">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Completion</p>
              <p className="text-2xl font-black text-emerald-700">{summary?.storyCompletionPercentage || summary?.averageScore || 0}%</p>
            </div>
            <div className="flex-1 md:flex-none bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center min-w-[100px]">
              <p className="text-xs font-bold text-blue-600 uppercase mb-1">Activities</p>
              <p className="text-2xl font-black text-blue-700">{summary?.completedSessions || 0}</p>
            </div>
            <div className="flex-1 md:flex-none bg-purple-50 border border-purple-100 p-4 rounded-2xl text-center min-w-[100px]">
              <p className="text-xs font-bold text-purple-600 uppercase mb-1">Time</p>
              <p className="text-2xl font-black text-purple-700">{Math.floor((summary?.totalTimeSpent || 0) / 60)}<span className="text-base">m</span></p>
            </div>
            <div className="flex-1 md:flex-none bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center min-w-[100px]">
              <p className="text-xs font-bold text-amber-600 uppercase mb-1">XP</p>
              <p className="text-2xl font-black text-amber-700">{summary?.totalXP || 0}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: FEATURE ANALYTICS */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Activity className="text-teal-500" size={28} /> Feature Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* READING PRACTICE */}
              <FeatureCard 
                icon={<BookOpen size={24} />} 
                title="Reading Practice" 
                color="blue"
                hasData={!!summary}
              >
                <StatRow label="Reading Accuracy" value={`${summary?.averageScore || 0}%`} />
                <StatRow label="Words Read" value={summary?.wordsRead || 0} />
                <StatRow label="Sessions Completed" value={summary?.completedSessions || 0} />
                <StatRow label="Best Score" value={`${summary?.averageScore || 0}%`} />
                <StatRow label="Support Level" value={getActivitySupportLabel(summary?.currentReadingLevel || 1)} />
              </FeatureCard>

              {/* VOCABULARY BUILDER */}
              <FeatureCard 
                icon={<Target size={24} />} 
                title="Vocabulary Builder" 
                color="emerald"
                hasData={!!summary?.vocabularyData}
              >
                <StatRow label="Words Learned" value={summary?.vocabularyData?.wordsLearned || 0} />
                <StatRow label="Mastered Words" value={summary?.vocabularyData?.masteredWords || 0} />
                <StatRow label="Accuracy" value={`${summary?.vocabularyData?.accuracy || 0}%`} />
                <StatRow label="Support Level" value={getActivitySupportLabel(summary?.vocabularyData?.currentLevel || 1)} />
              </FeatureCard>

              {/* WORD DETECTIVE */}
              <FeatureCard 
                icon={<Brain size={24} />} 
                title="Word Detective" 
                color="purple"
                hasData={!!summary?.wordDetectiveData}
              >
                <StatRow label="Questions Attempted" value={summary?.wordDetectiveData?.attempted || 0} />
                <StatRow label="Correct Answers" value={summary?.wordDetectiveData?.correct || 0} />
                <StatRow label="Accuracy" value={`${summary?.wordDetectiveData?.accuracy || 0}%`} />
                <StatRow label="Support Level" value={getActivitySupportLabel(summary?.wordDetectiveData?.currentLevel || 1)} />
              </FeatureCard>

              {/* STORY EXPLORER */}
              <FeatureCard 
                icon={<CalendarDays size={24} />} 
                title="Story Explorer" 
                color="amber"
                hasData={!!summary}
              >
                <StatRow label="Stories Read" value={summary?.completedStoriesCount || 0} />
                <StatRow label="Reading Time" value={`${Math.floor((summary?.storyExplorerTotalTime || 0) / 60)}m`} />
                <StatRow label="Completion %" value={`${summary?.storyCompletionPercentage || 0}%`} />
                <StatRow label="Comprehension Acc" value={`${summary?.storyCompletionPercentage || 0}%`} />
              </FeatureCard>

              {/* SENTENCE ADVENTURE */}
              <FeatureCard 
                icon={<CheckCircle size={24} />} 
                title="Sentence Adventure" 
                color="pink"
                hasData={!!summary?.sentenceAdventureData}
              >
                <StatRow label="Activities Completed" value={summary?.sentenceAdventureData?.completed || 0} />
                <StatRow label="Voice Practice Acc" value={`${summary?.sentenceAdventureData?.voiceAccuracy || summary?.averageScore || 0}%`} />
                <StatRow label="XP Earned" value={summary?.sentenceAdventureData?.xp || 0} />
                <StatRow label="Support Level" value={getActivitySupportLabel(summary?.sentenceAdventureData?.currentLevel || 1)} />
              </FeatureCard>
            </div>
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="space-y-8">
            
            {/* LEARNING AIDS */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target size={24} className="text-teal-600" />
                Learning Aids
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-default">
                  <p className="text-blue-800 font-semibold text-sm">📖 Reading Support</p>
                  <p className="text-blue-600 text-xs mt-1">Focus on phonics, blending, and reading aloud with accuracy.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-default">
                  <p className="text-emerald-800 font-semibold text-sm">💡 Vocabulary Support</p>
                  <p className="text-emerald-600 text-xs mt-1">Review power words and track new vocabulary mastery.</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-default">
                  <p className="text-purple-800 font-semibold text-sm">🔍 Word Recognition Support</p>
                  <p className="text-purple-600 text-xs mt-1">Help identifying sight words and decoding tricky letters.</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-default">
                  <p className="text-amber-800 font-semibold text-sm">🌍 Story Comprehension Support</p>
                  <p className="text-amber-600 text-xs mt-1">Interactive quizzes to ensure understanding of the narrative.</p>
                </div>
                <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-default">
                  <p className="text-pink-800 font-semibold text-sm">🧩 Sentence Building Support</p>
                  <p className="text-pink-600 text-xs mt-1">Guided practice on forming grammatically correct sentences.</p>
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Activity size={24} className="text-teal-600" />
                Recent Activity
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                {(!summary?.recentActivities || summary.recentActivities.length === 0) ? (
                  <p className="text-slate-500 text-center py-6 italic">No recent activity found.</p>
                ) : (
                  <div className="space-y-4">
                    {summary.recentActivities
                      .filter((activity) => ["reading_practice", "vocabulary_builder", "word_detective", "story_reading", "sentence_builder", "voice-practice", "reader"].includes(activity.activityType))
                      .map((activity, index) => (
                      <div key={index} className="flex flex-col gap-2 p-4 hover:bg-slate-50 rounded-xl transition border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 text-sm truncate pr-2">
                           {activity.storyTitle || activity.activityType.replace("-", " ").replace("_", " ").toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                            {formatDate(activity.date)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm mt-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            ['voice-practice', 'reading_practice'].includes(activity.activityType) ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {activity.activityType.replace("-", " ").replace("_", " ")}
                          </span>
                          
                          <div className="flex gap-3">
                            {activity.completed ? (
                              <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                                <CheckCircle size={14} /> Done
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                                <Clock size={14} /> In Progress
                              </span>
                            )}
                            
                            {activity.score > 0 && (
                              <span className="font-black text-teal-700 text-xs flex items-center gap-1">
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
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}