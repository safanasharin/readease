import React from 'react';
import { History, BookOpen, Mic, CheckCircle } from 'lucide-react';

export default function AgeGroup3ActivityTimeline({ recentActivity }) {
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <History size={24} className="text-slate-600" />
        <h3 className="text-xl font-bold text-slate-800">Recent Activity Timeline</h3>
      </div>
      
      {(!recentActivity || recentActivity.length === 0) ? (
        <div className="text-center text-slate-500 py-8 italic border-2 border-dashed border-slate-100 rounded-2xl">
          No recent activity found.
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {activity.activityType === 'voice-practice' ? (
                  <Mic size={16} className="text-purple-500" />
                ) : (
                  <BookOpen size={16} className="text-blue-500" />
                )}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 shadow-sm bg-white hover:border-slate-200 transition">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-800 truncate">{activity.storyTitle || "Learning Session"}</div>
                  <time className="font-medium text-xs text-slate-400 whitespace-nowrap">{formatDate(activity.date)}</time>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${activity.activityType === 'voice-practice' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {activity.activityType === 'voice-practice' ? 'Voice Practice' : 'Reader'}
                  </span>
                  {activity.completed ? (
                    <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold"><CheckCircle size={12} /> Done</span>
                  ) : (
                    <span className="text-orange-500 text-xs font-bold">In Progress</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
