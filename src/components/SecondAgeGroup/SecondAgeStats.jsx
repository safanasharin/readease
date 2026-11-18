import React from "react";

const SecondAgeStats = ({ level, xp, streak }) => {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-3 border border-blue-100 shadow-sm">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Level</p>
          <p className="text-lg font-bold text-slate-800">{level}</p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-3 border border-amber-100 shadow-sm">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total XP</p>
          <p className="text-lg font-bold text-slate-800">{xp}</p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-3 border border-teal-100 shadow-sm">
        <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Streak</p>
          <p className="text-lg font-bold text-slate-800">{streak} Days</p>
        </div>
      </div>
    </div>
  );
};

export default SecondAgeStats;
