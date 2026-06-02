import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, Calendar, Activity, TrendingUp } from "lucide-react";

export default function StudentProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 font-semibold mb-6 hover:underline"
        >
          &larr; Back
        </button>

        <h1 className="text-4xl font-bold text-slate-900 mb-8">Student Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
              <User size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{user.name || "Student"}</h2>
              <p className="text-slate-500 text-lg mt-1">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Age Group</p>
                <p className="text-xl font-semibold text-slate-800 capitalize mt-1">
                  {user.ageGroup || "Not specified"} (Age {user.age || "?"})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Dyslexia Level</p>
                <p className="text-xl font-semibold text-slate-800 capitalize mt-1">
                  {user.dyslexiaLevel || "Pending"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Assessment Status</p>
                <p className="text-xl font-semibold text-slate-800 mt-1">
                  {user.screeningCompleted ? "Completed" : "Not Completed"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Progress Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-500 font-medium mb-2">Reading Accuracy</p>
              <div className="text-3xl font-bold text-teal-600">85%</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-500 font-medium mb-2">Voice Accuracy</p>
              <div className="text-3xl font-bold text-purple-600">92%</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-500 font-medium mb-2">Current Streak</p>
              <div className="text-3xl font-bold text-orange-500">3 Days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
