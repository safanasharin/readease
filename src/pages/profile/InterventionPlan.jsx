import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ListChecks, Mic, BookOpen, Edit3 } from "lucide-react";

export default function InterventionPlan() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const level = (user?.dyslexiaLevel || "Mild").toLowerCase();

  const getPlan = () => {
    switch(level) {
      case "severe":
        return {
          voice: "15 minutes: Practice pronunciation of high-frequency words using the microphone.",
          reading: "20 minutes: Listen to stories with Text-to-Speech enabled and follow along.",
          writing: "10 minutes: Trace letters and spell simple words."
        };
      case "moderate":
        return {
          voice: "10 minutes: Read short sentences aloud and get pronunciation feedback.",
          reading: "20 minutes: Practice guided reading with Bionic fonts enabled.",
          writing: "15 minutes: Write short sentences and use spell check."
        };
      case "mild":
      default:
        return {
          voice: "5 minutes: Quick vocal warm-up with complex words.",
          reading: "30 minutes: Read independently. Focus on speed and comprehension.",
          writing: "20 minutes: Write a short paragraph summarizing what you read."
        };
    }
  };

  const plan = getPlan();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 font-semibold mb-6 hover:underline"
        >
          &larr; Back
        </button>

        <h1 className="text-4xl font-bold text-slate-900 mb-2">Intervention Plan</h1>
        <p className="text-lg text-slate-500 mb-8">Your personalized daily routine for maximum improvement.</p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
              <ListChecks size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Daily Tasks</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full mt-1">
                <Mic size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Voice Practice</h3>
                <p className="text-slate-600 text-lg">{plan.voice}</p>
                <button onClick={() => navigate("/practice/voice")} className="mt-4 text-blue-600 font-bold hover:underline">Start Voice Practice &rarr;</button>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full mt-1">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Reading Practice</h3>
                <p className="text-slate-600 text-lg">{plan.reading}</p>
                <button onClick={() => navigate("/practice/reading")} className="mt-4 text-purple-600 font-bold hover:underline">Start Reading Practice &rarr;</button>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-full mt-1">
                <Edit3 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Writing Practice</h3>
                <p className="text-slate-600 text-lg">{plan.writing}</p>
                <button onClick={() => navigate("/practice/writing")} className="mt-4 text-orange-600 font-bold hover:underline">Start Writing Practice &rarr;</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
