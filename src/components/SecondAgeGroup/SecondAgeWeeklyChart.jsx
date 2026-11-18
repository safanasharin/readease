import React from "react";

const SecondAgeWeeklyChart = ({ days }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mt-4">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Performance</h3>
      <div className="flex justify-between items-end h-40 gap-2">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="w-full bg-slate-50 rounded-t-lg relative flex justify-center h-32 group">
              {day.score > 0 && (
                <div 
                  className={`absolute bottom-0 w-full md:w-8 rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-80
                    ${day.score === 100 ? 'bg-emerald-400' : 'bg-blue-500'}`}
                  style={{ height: `${day.score}%` }}
                ></div>
              )}
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {day.score}%
              </div>
            </div>
            <span className={`text-xs font-bold mt-3 ${day.score === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
              {day.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecondAgeWeeklyChart;
