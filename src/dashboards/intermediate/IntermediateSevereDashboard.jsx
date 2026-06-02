import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { Volume2, Mic, HandHeart, PenTool, ClipboardList, TrendingUp } from "lucide-react";

export default function IntermediateSevereDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    readingAccuracy: "0%",
    voiceAccuracy: "0%",
    writingAccuracy: "0%",
    practiceTime: "0 mins",
    weeklyImprovement: "+0%",
    monthlyImprovement: "+0%",
    currentStreak: 0,
    progressPercentage: 0,
  });

  useEffect(() => {
    if (!user || !user._id) return;
    const token = localStorage.getItem("token");
    
    async function fetchProgress() {
      try {
        const summaryRes = await fetch(`http://localhost:5000/api/progress/summary/${user._id}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        });
        const summaryData = summaryRes.ok ? await summaryRes.json() : {};
        
        const weeklyRes = await fetch(`http://localhost:5000/api/progress/weekly/${user._id}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        });
        const weeklyData = weeklyRes.ok ? await weeklyRes.json() : [];
        const parsedWeekly = Array.isArray(weeklyData) ? weeklyData : [];

        const avgScore = summaryData.averageScore || 0;
        const readTimeMins = Math.floor((summaryData.totalReadingTime || 0) / 60);
        
        let weeklyImp = 0;
        if (parsedWeekly.length >= 2) {
            weeklyImp = (parsedWeekly[0].averageScore || 0) - (parsedWeekly[1].averageScore || 0);
        }

        setStats({
          readingAccuracy: `${avgScore}%`,
          voiceAccuracy: `${avgScore}%`,
          writingAccuracy: `${avgScore}%`,
          practiceTime: `${readTimeMins} mins`,
          weeklyImprovement: `${weeklyImp > 0 ? '+' : ''}${weeklyImp}%`,
          monthlyImprovement: `+${Math.floor(weeklyImp * 2)}%`, // Approximate
          currentStreak: summaryData.totalSessions || 0,
          progressPercentage: Math.min(avgScore, 100),
        });
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    }
    fetchProgress();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-8">
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
              Welcome Back, {user?.name || "Student"} 👋
            </h1>
            <p className="text-emerald-700 font-medium mb-4">
              "Structured academic support to help you excel at your own pace."
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-emerald-800 font-semibold">
                Learning Goal: 40 Minutes Practice
              </div>
              <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 text-orange-800 font-semibold">
                Current Streak: {stats.currentStreak} Days
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-blue-800 font-semibold">
                Weekly Progress: {stats.progressPercentage}%
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-4">Academic Modules</h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div
              onClick={() => navigate("/reader")}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-400 hover:shadow transition-all group"
            >
              <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <Volume2 className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Text-to-Speech Reader</h3>
              <p className="text-slate-500 text-sm font-medium">Listen and read along</p>
            </div>

            <div
              onClick={() => navigate("/voice-practice")}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-purple-400 hover:shadow transition-all group"
            >
              <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <Mic className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Speech Practice</h3>
              <p className="text-slate-500 text-sm font-medium">Guided pronunciation support</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow transition-all group">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <HandHeart className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Assisted Reading</h3>
              <p className="text-slate-500 text-sm font-medium">Simplified academic passages</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-teal-400 hover:shadow transition-all group">
              <div className="bg-teal-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                <PenTool className="text-teal-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Writing Support</h3>
              <p className="text-slate-500 text-sm font-medium">Sentence construction assistance</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-orange-400 hover:shadow transition-all group">
              <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                <ClipboardList className="text-orange-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Intervention Plan</h3>
              <p className="text-slate-500 text-sm font-medium">Personalized academic support</p>
            </div>

            <div
              onClick={() => navigate("/progress")}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow transition-all group"
            >
              <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Progress Tracker</h3>
              <p className="text-slate-500 text-sm font-medium">Monitor your academic growth</p>
            </div>
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-emerald-700 mb-3 border-2 border-emerald-100">
                {user?.name?.charAt(0) || "S"}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{user?.name || "Student"}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-sm">Age Group</span>
                <span className="font-semibold text-slate-800 capitalize">Intermediate</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-sm">Dyslexia Level</span>
                <span className="font-semibold text-emerald-600 capitalize">Severe</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium text-sm">Assessment Date</span>
                <span className="font-semibold text-slate-800">Recent</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Dyslexia Insights</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Current Level</span>
                <p className="font-semibold text-emerald-600 mt-1">Severe Dyslexia</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Strengths</span>
                <p className="text-sm text-slate-700 mt-1">Strong listening comprehension and problem-solving.</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Areas to Improve</span>
                <p className="text-sm text-slate-700 mt-1">Reading fluency and written expression.</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Recommended Today</span>
                <ul className="text-sm text-slate-700 mt-1 list-disc pl-4 space-y-1">
                  <li>Listen and read along</li>
                  <li>Guided pronunciation practice</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Progress Analytics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">Reading Accuracy</span>
                  <span className="font-semibold text-emerald-600">{stats.readingAccuracy}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: stats.readingAccuracy }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">Voice Accuracy</span>
                  <span className="font-semibold text-emerald-600">{stats.voiceAccuracy}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: stats.voiceAccuracy }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">Writing Accuracy</span>
                  <span className="font-semibold text-emerald-600">{stats.writingAccuracy}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: stats.writingAccuracy }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-slate-50 p-2 rounded text-center">
                  <div className="text-xs text-slate-500 font-medium">Weekly</div>
                  <div className="text-sm font-bold text-indigo-600">{stats.weeklyImprovement}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded text-center">
                  <div className="text-xs text-slate-500 font-medium">Monthly</div>
                  <div className="text-sm font-bold text-indigo-600">{stats.monthlyImprovement}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Achievement System */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-3">Achievements</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">🏆 Reading Champion</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">✨ Vocab Explorer</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-400 text-xs font-bold rounded-full border border-slate-200">Writing Star</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
