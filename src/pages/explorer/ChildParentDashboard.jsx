import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Activity, Clock, Target, Star, BookOpen, 
  Search, Eye, BrainCircuit, BoxSelect, AlignLeft, 
  History, Award, ChevronRight, Puzzle
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from "recharts";

// Helper for formatting time
const formatTime = (seconds) => {
  if (!seconds) return "0m";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

export default function ChildParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/child-progress/summary/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        console.log("Parent Dashboard Data", result);
        setData(result);
      } catch (error) {
        console.error("Failed to load child progress:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?._id) {
      fetchSummary();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      {/* ── EXPLORER NAVBAR ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🦁</span>
          <div>
            <h1 className="font-black text-xl text-indigo-900 leading-tight">ReadEase</h1>
            <span className="text-[10px] uppercase tracking-wider bg-pink-100 text-pink-600 font-black px-2 py-0.5 rounded-full">Explorer</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user?.firstName?.[0] || user?.name?.[0] || "E"}
            </div>
            <div>
              <p className="text-sm font-black text-indigo-900">{user?.firstName || user?.name || "Explorer"}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Parent View</p>
            </div>
          </div>

        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* ── CHILD OVERVIEW ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
            <Target size={20} className="text-indigo-500" /> Learning Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6">
              <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1">Overall Completion</p>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-black text-indigo-700">{data.overallCompletion}%</span>
              </div>
              <div className="w-full bg-indigo-200/50 rounded-full h-2.5">
                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${data.overallCompletion}%` }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Total Activities</p>
                <Activity size={20} className="text-emerald-400" />
              </div>
              <span className="text-4xl font-black text-emerald-700">{data.totalActivities}</span>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-amber-500 uppercase tracking-widest">Learning Time</p>
                <Clock size={20} className="text-amber-400" />
              </div>
              <span className="text-4xl font-black text-amber-700">{formatTime(data.totalTimeSpent)}</span>
            </div>
          </div>
        </section>

        {/* ── ACTIVITY ANALYTICS GRID ───────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-slate-500" /> Activity Analytics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Letter Tracing */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600"><Star size={20} /></div>
                <h3 className="font-black text-slate-700">Letter Tracing</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Uppercase Completed</span><span className="font-black text-slate-800">{data.letterTracing.uppercaseCompleted}/26</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Lowercase Completed</span><span className="font-black text-slate-800">{data.letterTracing.lowercaseCompleted}/26</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Current Letter</span><span className="font-black text-slate-800">{data.letterTracing.currentLetter}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Unlocked Letters</span><span className="font-black text-slate-800">{data.letterTracing.unlockedLetters}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Best Score</span><span className="font-black text-blue-600">{data.letterTracing.bestScore}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Attempts</span><span className="font-black text-slate-800">{data.letterTracing.totalAttempts || data.letterTracing.attempts}</span></div>
              </div>
            </div>

            {/* Sound Matching */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pink-100 p-2.5 rounded-xl text-pink-600"><Star size={20} /></div>
                <h3 className="font-black text-slate-700">Sound Matching</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Sessions Played</span><span className="font-black text-slate-800">{data.soundMatching.sessionsPlayed}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Correct Answers</span><span className="font-black text-slate-800">{data.soundMatching.correctAnswers}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Best Accuracy</span><span className="font-black text-pink-600">{data.soundMatching.bestAccuracy}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Avg Accuracy</span><span className="font-black text-slate-800">{data.soundMatching.averageAccuracy}%</span></div>
              </div>
            </div>

            {/* Memory Game */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600"><BrainCircuit size={20} /></div>
                <h3 className="font-black text-slate-700">Memory Game</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Levels Completed</span><span className="font-black text-slate-800">{data.memoryGame.levelsCompleted}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Matches Found</span><span className="font-black text-slate-800">{data.memoryGame.matchesFound}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Best Score</span><span className="font-black text-purple-600">{data.memoryGame.bestScore}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Avg Accuracy</span><span className="font-black text-slate-800">{data.memoryGame.averageAccuracy}%</span></div>
              </div>
            </div>

            {/* Shape Sorting */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600"><BoxSelect size={20} /></div>
                <h3 className="font-black text-slate-700">Shape Sorting</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Shapes Sorted</span><span className="font-black text-slate-800">{data.shapeSorting.shapesSorted}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Correct</span><span className="font-black text-slate-800">{data.shapeSorting.correctPlacements}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Best Session</span><span className="font-black text-orange-600">{data.shapeSorting.bestSession}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Avg Accuracy</span><span className="font-black text-slate-800">{data.shapeSorting.accuracy}%</span></div>
              </div>
            </div>

            {/* Story Reading */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-teal-100 p-2.5 rounded-xl text-teal-600"><BookOpen size={20} /></div>
                <h3 className="font-black text-slate-700">Story Reading</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Stories Read</span><span className="font-black text-slate-800">{data.storyReading.storiesCompleted}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Total Time</span><span className="font-black text-slate-800">{formatTime(data.storyReading.totalReadingTime)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Fav Category</span><span className="font-black text-teal-600 truncate max-w-[100px]">{data.storyReading.favoriteCategory}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Last Read</span><span className="font-black text-slate-800 truncate max-w-[100px]">{data.storyReading.lastStoryRead}</span></div>
              </div>
            </div>

            {/* Letter Detective */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2.5 rounded-xl text-red-600"><Search size={20} /></div>
                <h3 className="font-black text-slate-700">Letter Detective</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Letters Found</span><span className="font-black text-slate-800">{data.letterDetective.lettersFound}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Correct</span><span className="font-black text-slate-800">{data.letterDetective.correctIdentifications}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Best Score</span><span className="font-black text-red-600">{data.letterDetective.bestScore}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Avg Accuracy</span><span className="font-black text-slate-800">{data.letterDetective.accuracy}%</span></div>
              </div>
            </div>

            {/* Sequencing */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600"><AlignLeft size={20} /></div>
                <h3 className="font-black text-slate-700">Sequencing</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Sequences Solved</span><span className="font-black text-slate-800">{data.sequencing.sequencesSolved}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Best Accuracy</span><span className="font-black text-indigo-600">{data.sequencing.bestAccuracy}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Avg Score</span><span className="font-black text-slate-800">{data.sequencing.averageScore}</span></div>
              </div>
            </div>

            {/* Visual Detective */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-cyan-100 p-2.5 rounded-xl text-cyan-600"><Eye size={20} /></div>
                <h3 className="font-black text-slate-700">Visual Detective</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Mysteries Solved</span><span className="font-black text-slate-800">{data.visualDetective.mysteriesSolved}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Clues Found</span><span className="font-black text-slate-800">{data.visualDetective.cluesFound}</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Best Session</span><span className="font-black text-cyan-600">{data.visualDetective.bestSession}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500 font-bold">Avg Accuracy</span><span className="font-black text-slate-800">{data.visualDetective.accuracy}%</span></div>
              </div>
            </div>

          </div>
        </section>

        {/* ── BOTTOM ROW: CHARTS & RECENT ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weekly Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
             <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-indigo-500" /> Weekly Progress
             </h2>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.weeklyProgress} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(val) => {
                         const d = new Date(val);
                         return d.toLocaleDateString('en-US', { weekday: 'short' });
                      }}
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} 
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 900, color: '#1E293B', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 700, fontSize: '12px' }}/>
                    <Bar yAxisId="left" dataKey="activitiesCompleted" name="Activities" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar yAxisId="right" dataKey="accuracy" name="Accuracy %" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
             <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <History size={20} className="text-slate-500" /> Recent Activities
             </h2>
             <div className="space-y-4">
                {data.recentActivities.length === 0 ? (
                  <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-400">No activities yet. Encourage them to play!</p>
                  </div>
                ) : (
                  data.recentActivities.map((act, i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                         {act.activityType === "story_reading" ? <BookOpen size={16} /> : 
                          act.activityType === "letter_tracing" ? <Star size={16} /> :
                          act.activityType === "sound_matching" ? <Activity size={16} /> :
                          act.activityType === "memory_game" ? <BrainCircuit size={16} /> :
                          act.activityType === "shape_sorting" ? <BoxSelect size={16} /> :
                          act.activityType === "letter_detection" ? <Search size={16} /> :
                          act.activityType === "sequencing" ? <AlignLeft size={16} /> :
                          act.activityType === "visual_detective" ? <Eye size={16} /> : <Puzzle size={16} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">
                          {act.activityType === "story_reading" && `Read ${act.storyTitle}`}
                          {act.activityType === "letter_tracing" && `Completed Letter ${act.letter}`}
                          {act.activityType === "sound_matching" && `Played Sound Matching`}
                          {act.activityType === "memory_game" && `Played Memory Game`}
                          {act.activityType === "shape_sorting" && `Sorted Shapes`}
                          {act.activityType === "letter_detection" && `Played Letter Detective`}
                          {act.activityType === "sequencing" && `Solved Sequence`}
                          {act.activityType === "visual_detective" && `Played Visual Detective`}
                        </p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5 flex items-center gap-2">
                           <span>{new Date(act.date).toLocaleDateString()}</span>
                           {act.accuracy !== undefined && <span className="bg-slate-100 px-1.5 rounded text-slate-500">{act.accuracy}% Acc</span>}
                           {act.score !== undefined && act.score > 0 && <span className="bg-slate-100 px-1.5 rounded text-slate-500">Score: {act.score}</span>}
                        </p>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Icon Helper
function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
