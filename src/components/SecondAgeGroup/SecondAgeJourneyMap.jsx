import React from "react";

const SecondAgeJourneyMap = ({ currentLevel }) => {
  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10 opacity-50"></div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-8">Learning Journey Map</h3>
      
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out rounded-full" 
          style={{ width: `${((currentLevel - 1) / (levels.length - 1)) * 100}%` }}
        ></div>

        {/* Nodes */}
        <div className="flex justify-between items-center relative z-10">
          {levels.map((lvl) => {
            const isCompleted = lvl < currentLevel;
            const isCurrent = lvl === currentLevel;
            const isLocked = lvl > currentLevel;

            return (
              <div key={lvl} className="flex flex-col items-center group relative">
                {/* Node circle */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-4
                    ${isCompleted ? 'bg-blue-500 text-white border-blue-200' : ''}
                    ${isCurrent ? 'bg-amber-500 text-white border-amber-200 ring-4 ring-amber-100 shadow-lg shadow-amber-200/50 scale-110' : ''}
                    ${isLocked ? 'bg-white text-slate-400 border-slate-200' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : isLocked ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  ) : (
                    lvl
                  )}
                </div>
                
                {/* Label */}
                <span className={`absolute -bottom-6 text-xs font-bold whitespace-nowrap
                  ${isCurrent ? 'text-amber-600' : isCompleted ? 'text-blue-600' : 'text-slate-400'}
                `}>
                  Level {lvl}
                </span>
                
                {/* Current marker popup */}
                {isCurrent && (
                  <div className="absolute -top-10 bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded shadow-lg animate-bounce whitespace-nowrap">
                    You are here!
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SecondAgeJourneyMap;
