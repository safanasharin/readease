import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Type, Mic, PenTool, Target, TrendingUp } from "lucide-react";

export default function IntermediateMildDashboard() {
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
            <p className="text-blue-700 font-medium mb-4">
              "Consistency builds mastery. Let's tackle today's academic goals."
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-blue-800 font-semibold">
                Learning Goal: 20 Minutes Practice
              </div>
              <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 text-orange-800 font-semibold">
                Current Streak: {stats.currentStreak} Days
              </div>
              <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-emerald-800 font-semibold">
                Weekly Progress: {stats.progressPercentage}%
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-4">Academic Modules</h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div
              onClick={() => navigate("/reader")}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow transition-all group"
            >
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Academic Reading</h3>
              <p className="text-slate-500 text-sm font-medium">Read short articles & stories</p>
            </div>

            <div
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow transition-all group"
            >
              <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                <Type className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Vocabulary Builder</h3>
              <p className="text-slate-500 text-sm font-medium">Master academic vocabulary</p>
            </div>

            <div
              onClick={() => navigate("/voice-practice")}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-purple-400 hover:shadow transition-all group"
            >
              <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <Mic className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Voice Fluency</h3>
              <p className="text-slate-500 text-sm font-medium">Practice reading paragraphs</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-teal-400 hover:shadow transition-all group">
              <div className="bg-teal-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                <PenTool className="text-teal-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Writing Improvement</h3>
              <p className="text-slate-500 text-sm font-medium">Paragraph writing exercises</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-orange-400 hover:shadow transition-all group">
              <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                <Target className="text-orange-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Weekly Challenge</h3>
              <p className="text-slate-500 text-sm font-medium">Learn 5 new academic words</p>
            </div>

            <div
              onClick={() => navigate("/progress")}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-400 hover:shadow transition-all group"
            >
              <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Progress Analytics</h3>
              <p className="text-slate-500 text-sm font-medium">Track your academic growth</p>
            </div>
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-blue-700 mb-3 border-2 border-blue-100">
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
                <span className="font-semibold text-blue-600 capitalize">Mild</span>
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
                <p className="font-semibold text-blue-600 mt-1">Mild Dyslexia</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Strengths</span>
                <p className="text-sm text-slate-700 mt-1">Good basic vocabulary and visual memory.</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Areas to Improve</span>
                <p className="text-sm text-slate-700 mt-1">Reading speed and academic phrasing.</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Recommended Today</span>
                <ul className="text-sm text-slate-700 mt-1 list-disc pl-4 space-y-1">
                  <li>Read a short academic article</li>
                  <li>Practice pronunciation</li>
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
                  <span className="font-semibold text-blue-600">{stats.readingAccuracy}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: stats.readingAccuracy }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">Voice Accuracy</span>
                  <span className="font-semibold text-blue-600">{stats.voiceAccuracy}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: stats.voiceAccuracy }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-600">Writing Accuracy</span>
                  <span className="font-semibold text-blue-600">{stats.writingAccuracy}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: stats.writingAccuracy }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-slate-50 p-2 rounded text-center">
                  <div className="text-xs text-slate-500 font-medium">Weekly</div>
                  <div className="text-sm font-bold text-emerald-600">{stats.weeklyImprovement}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded text-center">
                  <div className="text-xs text-slate-500 font-medium">Monthly</div>
                  <div className="text-sm font-bold text-emerald-600">{stats.monthlyImprovement}</div>
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
