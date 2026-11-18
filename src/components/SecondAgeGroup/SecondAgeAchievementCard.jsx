import React from "react";

const SecondAgeAchievementCard = ({ name, locked, icon }) => {
  return (
    <div className={`flex flex-col items-center p-4 rounded-xl border ${locked ? 'bg-slate-50 border-slate-100 grayscale opacity-60' : 'bg-white border-amber-100 shadow-sm'} transition-all`}>
      <div className={`text-4xl mb-3 ${locked ? '' : 'drop-shadow-md'}`}>
        {icon}
      </div>
      <h4 className="font-bold text-sm text-center text-slate-700">{name}</h4>
      {locked && (
        <span className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Locked
        </span>
      )}
    </div>
  );
};

export default SecondAgeAchievementCard;
