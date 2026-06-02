import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Brain, Star, AlertTriangle, Lightbulb } from "lucide-react";

export default function DyslexiaInsights() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const level = (user?.dyslexiaLevel || "Mild").toLowerCase();

  const insights = {
    mild: {
      meaning: "Mild dyslexia means you might occasionally struggle with fast reading or spelling, but you generally compensate well.",
      strengths: ["Creative problem solving", "Strong verbal communication", "Big picture thinking"],
      challenges: ["Reading aloud quickly", "Spelling complex words"],
      recommendations: ["Use bionic reading fonts", "Practice reading out loud 15 mins daily", "Use spell check tools"]
    },
    moderate: {
      meaning: "Moderate dyslexia affects reading fluency and spelling more noticeably. You may need more time to process written text.",
      strengths: ["Visual-spatial reasoning", "Out-of-the-box thinking", "Strong intuition"],
      challenges: ["Phonetic decoding", "Reading comprehension under time pressure", "Writing fluency"],
      recommendations: ["Use text-to-speech for long articles", "Break tasks into smaller chunks", "Practice guided reading daily"]
    },
    severe: {
      meaning: "Severe dyslexia significantly impacts reading, writing, and spelling. Intensive, structured interventions are highly beneficial.",
      strengths: ["Exceptional creativity", "3D spatial skills", "Strong narrative memory"],
      challenges: ["Recognizing sight words", "Writing sentences", "Reading independently"],
      recommendations: ["Rely on text-to-speech and dictation tools", "Follow a highly structured phonics program", "Practice voice exercises to build confidence"]
    }
  };

  const data = insights[level] || insights.mild;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 font-semibold mb-6 hover:underline"
        >
          &larr; Back
        </button>

        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dyslexia Insights</h1>
        <p className="text-lg text-slate-500 mb-8">Personalized breakdown based on your assessment.</p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Brain size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{level} Dyslexia</h2>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">{data.meaning}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6 text-emerald-600">
              <Star size={24} />
              <h3 className="text-xl font-bold text-slate-900">Your Strengths</h3>
            </div>
            <ul className="space-y-3">
              {data.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-600">
                  <span className="text-emerald-500 mt-1">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6 text-orange-500">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold text-slate-900">Common Challenges</h3>
            </div>
            <ul className="space-y-3">
              {data.challenges.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-600">
                  <span className="text-orange-400 mt-1">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6 text-blue-600">
            <Lightbulb size={24} />
            <h3 className="text-xl font-bold text-slate-900">Improvement Recommendations</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendations.map((item, idx) => (
              <li key={idx} className="bg-blue-50 text-blue-900 p-4 rounded-xl font-medium">
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
