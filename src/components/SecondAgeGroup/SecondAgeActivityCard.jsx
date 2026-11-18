import React from "react";

const SecondAgeActivityCard = ({ name, difficulty, estimatedTime, type }) => {
  const getDifficultyColor = () => {
    switch(difficulty.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'hard': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all flex justify-between items-center group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-lg">{name}</h4>
          <div className="flex gap-2 mt-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getDifficultyColor()}`}>{difficulty}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {estimatedTime}
            </span>
          </div>
        </div>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm shadow-blue-200">
        Start
      </button>
    </div>
  );
};

export default SecondAgeActivityCard;
