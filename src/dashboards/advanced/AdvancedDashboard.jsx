import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Mic, Edit3, Target, TrendingUp, Lightbulb, ShieldAlert, Award, ChevronRight } from "lucide-react";

export default function UnifiedFinalAgeGroupDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // In a real app, you would fetch these from an API
  const [stats, setStats] = useState({
    readingScore: "85%",
    writingScore: "78%",
    voiceAccuracy: "92%",
    practiceTime: "4.5 hrs",
    streak: 12,
    assessmentDate: "2026-05-15",
  });

  const severity = user?.dyslexiaLevel?.toLowerCase() || "moderate";

  const config = useMemo(() => {
    switch (severity) {
      case "mild":
        return {
          color: "emerald",
          statusText: "Mild Dyslexia",
          statusDesc: "You may experience minor reading and spelling difficulties.",
          plan: [
            "Reading Practice (Articles)",
            "Vocabulary Building",
            "Voice Fluency Practice"
          ],
          interventionFocus: "Focus on fluency and vocabulary expansion.",
          strengths: ["Strong verbal comprehension", "Good spatial reasoning"],
          challenges: ["Occasional spelling errors", "Reading speed"],
          tips: ["Read aloud for 15 mins daily", "Use a vocabulary journal"],
        };
      case "severe":
        return {
          color: "rose",
          statusText: "Severe Dyslexia",
          statusDesc: "You may benefit from structured intervention and assistive tools.",
          plan: [
            "Text-to-Speech Activities",
            "Speech Practice",
            "Structured Reading Support"
          ],
          interventionFocus: "Focus on structured intervention and assistive technologies.",
          strengths: ["Creative problem solving", "Auditory learning"],
          challenges: ["Phonetic decoding", "Writing mechanics"],
          tips: ["Utilize text-to-speech tools", "Break reading into 10-min chunks"],
        };
      case "moderate":
      default:
        return {
          color: "amber",
          statusText: "Moderate Dyslexia",
          statusDesc: "You may require additional reading and writing support.",
          plan: [
            "Guided Reading",
            "Pronunciation Practice",
            "Writing Support"
          ],
          interventionFocus: "Focus on comprehension and structured writing support.",
          strengths: ["Strong conceptual understanding", "Visual learning"],
          challenges: ["Reading comprehension speed", "Spelling consistency"],
          tips: ["Use grammar assistance tools", "Listen to audiobooks while reading"],
        };
    }
  }, [severity]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-6 grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* ========================================= */}
        {/* LEFT COLUMN: Profile & Status             */}
        {/* ========================================= */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Dashboard Header / Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-700 mb-4 mx-auto">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
              {user?.name || "Student"}
            </h2>
            <p className="text-center text-slate-500 text-sm mb-6">Welcome Back!</p>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Age</span>
                <span className="font-semibold text-slate-800">{user?.age || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Group</span>
                <span className="font-semibold text-slate-800 capitalize">{user?.ageGroup || "Advanced"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Assessment</span>
                <span className="font-semibold text-slate-800">{stats.assessmentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Streak</span>
                <span className="font-semibold text-orange-600 flex items-center gap-1">
                  🔥 {stats.streak} Days
                </span>
              </div>
            </div>
          </div>

          {/* Dyslexia Status Card */}
          <div className={`bg-white p-6 rounded-2xl border-2 shadow-sm 
            ${config.color === 'emerald' ? 'border-emerald-200' : ''}
            ${config.color === 'amber' ? 'border-amber-200' : ''}
            ${config.color === 'rose' ? 'border-rose-200' : ''}
          `}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-4 h-4 rounded-full 
                ${config.color === 'emerald' ? 'bg-emerald-500' : ''}
                ${config.color === 'amber' ? 'bg-amber-500' : ''}
                ${config.color === 'rose' ? 'bg-rose-500' : ''}
              `}></div>
              <h3 className="font-bold text-slate-800 text-lg">{config.statusText}</h3>
            </div>
            <p className="text-sm text-slate-600">{config.statusDesc}</p>
          </div>

          {/* Dyslexia Insights */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-indigo-500" /> Dyslexia Insights
            </h3>
            
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Strengths</h4>
              <ul className="space-y-1">
                {config.strengths.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Challenges</h4>
              <ul className="space-y-1">
                {config.challenges.map((item, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-rose-400">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* ========================================= */}
        {/* RIGHT COLUMN: Plan, Modules & Analytics   */}
        {/* ========================================= */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Top Row: Plan & Intervention */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personalized Daily Plan */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
              <h3 className="font-bold text-indigo-900 text-lg mb-4 flex items-center gap-2">
                <Target size={20} className="text-indigo-500" /> Today's Personalized Plan
              </h3>
              <ul className="space-y-3">
                {config.plan.map((task, idx) => (
                  <li key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                    <span className="text-slate-700 font-medium">{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Intervention Plan */}
            <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <ShieldAlert className="absolute -right-6 -bottom-6 text-slate-700 opacity-50" size={120} />
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2 text-slate-100 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-indigo-400" /> Intervention Strategy
                </h3>
                <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                  {config.interventionFocus}
                </p>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Improvement Tips</h4>
                <ul className="space-y-2">
                  {config.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-slate-200 flex items-start gap-2">
                      <span className="text-indigo-400">→</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Main Modules Grid */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Learning Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div onClick={() => navigate("/reader")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <BookOpen className="text-blue-600 group-hover:text-white transition-colors" size={24} />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Reading Practice</h3>
                <p className="text-xs text-slate-500 mb-4">Articles, Comprehension, Academic Reading</p>
                <div className="flex items-center text-indigo-600 text-sm font-semibold">Start <ChevronRight size={16} /></div>
              </div>

              <div onClick={() => navigate("/voice-practice")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                  <Mic className="text-emerald-600 group-hover:text-white transition-colors" size={24} />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Voice Practice</h3>
                <p className="text-xs text-slate-500 mb-4">Read aloud, Fluency, Pronunciation</p>
                <div className="flex items-center text-indigo-600 text-sm font-semibold">Start <ChevronRight size={16} /></div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                  <Edit3 className="text-purple-600 group-hover:text-white transition-colors" size={24} />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Writing Practice</h3>
                <p className="text-xs text-slate-500 mb-4">Sentences, Grammar, Essays</p>
                <div className="flex items-center text-indigo-600 text-sm font-semibold">Start <ChevronRight size={16} /></div>
              </div>

            </div>
          </div>

          {/* Analytics & Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-500" /> Progress Analytics
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-600">Reading Score</span>
                    <span className="font-bold text-slate-800">{stats.readingScore}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: stats.readingScore }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-600">Writing Score</span>
                    <span className="font-bold text-slate-800">{stats.writingScore}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: stats.writingScore }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-600">Voice Accuracy</span>
                    <span className="font-bold text-slate-800">{stats.voiceAccuracy}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: stats.voiceAccuracy }}></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Total Time</p>
                  <p className="font-bold text-slate-800">{stats.practiceTime}</p>
                </div>
                <div className="text-center border-l border-r border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Weekly</p>
                  <p className="font-bold text-emerald-500">+12%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Monthly</p>
                  <p className="font-bold text-emerald-500">+28%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Award size={20} className="text-indigo-500" /> Achievement Center
              </h3>
              
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-xl">🏆</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Perfect Fluency</h4>
                    <p className="text-xs text-slate-500">Achieved 95% voice accuracy today</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl">🔥</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">12-Day Streak</h4>
                    <p className="text-xs text-slate-500">Keep up the great work!</p>
                  </div>
                </div>
              </div>
              
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
