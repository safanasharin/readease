import React from 'react';
import WeeklyProgressChart from '../../components/WeeklyProgressChart';
import { CalendarDays, TrendingUp } from 'lucide-react';

export default function AgeGroup3WeeklyChart({ weekly }) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp size={24} className="text-blue-600" />
        <h3 className="text-xl font-bold text-slate-800">Weekly Progress Chart</h3>
      </div>
      
      {(!weekly || weekly.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl">
          <CalendarDays size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No weekly data available yet.</p>
        </div>
      ) : (
        <div className="flex-1">
          <WeeklyProgressChart weekly={weekly} />
        </div>
      )}
    </div>
  );
}
