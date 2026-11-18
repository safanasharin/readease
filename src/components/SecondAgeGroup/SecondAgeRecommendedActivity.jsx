import React from "react";
import SecondAgeActivityCard from "./SecondAgeActivityCard";

const SecondAgeRecommendedActivity = ({ activities }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Recommended Quests
        </h3>
        <button className="text-blue-600 font-bold text-sm hover:text-blue-700 hover:underline">
          View All
        </button>
      </div>
      
      <div className="flex flex-col gap-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {activities.map(activity => (
          <SecondAgeActivityCard 
            key={activity.id}
            name={activity.name}
            difficulty={activity.difficulty}
            estimatedTime={activity.estimatedTime}
            type={activity.type}
          />
        ))}
      </div>
    </div>
  );
};

export default SecondAgeRecommendedActivity;
