import React from 'react';
import { Award, Trophy, Medal, Flame } from 'lucide-react';

export default function AgeGroup3Achievements({ user, summary }) {
  const badges = [
    { title: "First Story", icon: <Award className="text-amber-500" size={32} />, earned: (summary?.completedStoriesCount || 0) > 0 },
    { title: "10 Lessons", icon: <Medal className="text-blue-500" size={32} />, earned: (summary?.totalSessions || 0) >= 10 },
    { title: "Perfect Score", icon: <Trophy className="text-yellow-500" size={32} />, earned: (summary?.averageScore || 0) >= 95 },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award size={24} className="text-amber-500" />
          <h3 className="text-xl font-bold text-slate-800">Achievements</h3>
        </div>
        <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Flame size={16} /> {summary?.streak || 0} Day Streak
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {badges.map((badge, idx) => (
          <div key={idx} className={`flex flex-col items-center p-4 rounded-2xl border transition-all text-center ${badge.earned ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}`}>
            <div className="mb-2 bg-white p-3 rounded-full shadow-sm">
              {badge.icon}
            </div>
            <p className={`text-xs font-bold ${badge.earned ? 'text-amber-700' : 'text-slate-400'}`}>
              {badge.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
