import React from 'react';
import { Target, BookOpen, Activity, Clock, Star, Zap } from 'lucide-react';

export default function AgeGroup3StatsCards({ data }) {
  const cards = [
    {
      title: "Activities Completed",
      value: data?.totalSessions || 0,
      icon: <Target className="text-blue-500" size={24} />,
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      title: "Stories Completed",
      value: data?.completedStoriesCount || 0,
      icon: <BookOpen className="text-purple-500" size={24} />,
      bg: "bg-purple-50",
      border: "border-purple-100"
    },
    {
      title: "Reading Accuracy",
      value: `${data?.averageScore || 0}%`,
      icon: <Activity className="text-emerald-500" size={24} />,
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      title: "Reading Speed",
      value: "85 WPM", // Placeholder for actual speed metric
      icon: <Clock className="text-amber-500" size={24} />,
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      title: "Average Quiz Score",
      value: "92%", // Placeholder for actual quiz score metric
      icon: <Star className="text-indigo-500" size={24} />,
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
    {
      title: "Learning Streak",
      value: `${data?.streak || 0} Days`,
      icon: <Zap className="text-orange-500" size={24} />,
      bg: "bg-orange-50",
      border: "border-orange-100"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className={`p-6 rounded-2xl border ${card.border} ${card.bg} flex items-center gap-4 shadow-sm transition hover:shadow-md hover:-translate-y-1`}>
          <div className="p-4 bg-white rounded-xl shadow-sm">
            {card.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">{card.title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
