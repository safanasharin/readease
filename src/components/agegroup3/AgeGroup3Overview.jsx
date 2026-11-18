import React from 'react';
import { User, Shield, Clock, Crosshair } from 'lucide-react';

export default function AgeGroup3Overview({ user, summary }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 mb-8">
      <div className="relative w-32 h-32 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full animate-pulse opacity-20"></div>
        <div className="absolute inset-2 rounded-full bg-slate-50 flex items-center justify-center text-5xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-blue-600 to-purple-600">
          {user?.name?.charAt(0)?.toUpperCase() || "S"}
        </div>
      </div>
      
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{user?.name || "Student"}</h2>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
          <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center gap-2">
            <Shield size={16} /> Level: {user?.learningLevel || "Intermediate"}
          </span>
          <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center gap-2">
            <Clock size={16} /> {Math.floor((summary?.totalReadingTime || 0) / 60)}h {(summary?.totalReadingTime || 0) % 60}m Total Time
          </span>
          <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center gap-2">
            <Crosshair size={16} /> Acc: {summary?.averageScore || 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
