import React from "react";

const SecondAgeProgressCard = ({ title, percentage, colorClass }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl font-bold text-slate-700">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
        <div 
          className={`h-3 rounded-full ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-slate-500 font-medium">Weekly Improvement: +5%</p>
    </div>
  );
};

export default SecondAgeProgressCard;
