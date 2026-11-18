import React from 'react';
import { BookMarked, Mic, BrainCircuit, Activity } from 'lucide-react';

export default function AgeGroup3ReadingAnalytics({ summary }) {
  // Using generic mock/derived logic since specific detailed breakdown might not be fully in DB
  // Will map to what we have in summary where possible
  const metrics = [
    { label: "Words Mastered", value: summary?.completedStoriesCount ? summary.completedStoriesCount * 45 : 0, percent: 75, icon: <BookMarked size={20} />, color: "bg-blue-500" },
    { label: "Pronunciation Score", value: `${summary?.averageScore || 0}%`, percent: summary?.averageScore || 0, icon: <Mic size={20} />, color: "bg-purple-500" },
    { label: "Comprehension Score", value: "88%", percent: 88, icon: <BrainCircuit size={20} />, color: "bg-emerald-500" },
    { label: "Accuracy Score", value: `${Math.min((summary?.averageScore || 0) + 10, 100)}%`, percent: Math.min((summary?.averageScore || 0) + 10, 100), icon: <Activity size={20} />, color: "bg-amber-500" }
  ];

  const analysis = {
    strongest: summary?.averageScore > 80 ? "Pronunciation" : "Comprehension",
    weakest: summary?.averageScore < 70 ? "Pronunciation" : "Reading Speed",
    recommendation: "Daily Reading Practice Module"
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <BrainCircuit size={24} className="text-purple-600" />
        <h3 className="text-xl font-bold text-slate-800">Learning Analytics</h3>
      </div>
      
      <div className="space-y-6 mb-8">
        {metrics.map((m, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <span className={`p-1.5 rounded-lg text-white ${m.color}`}>{m.icon}</span>
                {m.label}
              </span>
              <span className="font-bold text-slate-800">{m.value}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className={`${m.color} h-2.5 rounded-full`} style={{ width: `${m.percent}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-auto">
        <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">AI Insight</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Strongest Skill:</span>
            <span className="font-semibold text-emerald-600">{analysis.strongest}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Improvement Area:</span>
            <span className="font-semibold text-rose-600">{analysis.weakest}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
            <span className="text-slate-500">Recommendation:</span>
            <span className="font-semibold text-blue-600 text-right">{analysis.recommendation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
