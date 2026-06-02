/* eslint-disable */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Edit3, CheckCircle, RotateCcw } from 'lucide-react';

const TASKS = {
  explorer: {
    title: "Build Simple Words",
    instruction: "Type the words you see below. Try your best!",
    prompts: [
      { label: "Type: CAT", expected: "cat" },
      { label: "Type: DOG", expected: "dog" },
      { label: "Type: SUN", expected: "sun" },
      { label: "Type: BALL", expected: "ball" },
      { label: "Type: FISH", expected: "fish" },
    ],
  },
  beginner: {
    title: "Sentence Writing",
    instruction: "Write a complete sentence for each prompt.",
    prompts: [
      { label: "Write a sentence about your favorite animal.", expected: null },
      { label: "Describe what you had for breakfast today.", expected: null },
      { label: "Write about your best friend.", expected: null },
    ],
  },
  intermediate: {
    title: "Paragraph Writing",
    instruction: "Write a short paragraph (3-5 sentences) for each topic.",
    prompts: [
      { label: "Explain why water is important for life.", expected: null },
      { label: "Describe your favorite subject and why you like it.", expected: null },
      { label: "Write about a place you would like to visit.", expected: null },
    ],
  },
  advanced: {
    title: "Professional Writing",
    instruction: "Draft professional communications for each scenario.",
    prompts: [
      { label: "Write a brief email to your team reminding them of tomorrow's meeting at 3 PM.", expected: null },
      { label: "Write a short report summary of a project's progress.", expected: null },
      { label: "Draft a polite follow-up email to a client about a pending invoice.", expected: null },
    ],
  },
};

export default function WritingPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ageGroup = (user?.ageGroup || 'explorer').toLowerCase();

  const task = TASKS[ageGroup] || TASKS.explorer;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [text, setText] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const isExplorer = ageGroup === 'explorer';
  const current = task.prompts[currentIdx];

  const handleSubmit = () => {
    if (!text.trim()) return;
    let correct = null;
    if (current.expected) {
      correct = text.trim().toLowerCase() === current.expected;
    }
    setSubmissions(prev => [...prev, { prompt: current.label, response: text, correct }]);
    setShowFeedback(true);
  };

  const nextPrompt = () => {
    setCurrentIdx(prev => (prev + 1) % task.prompts.length);
    setText('');
    setShowFeedback(false);
  };

  const retry = () => {
    setText('');
    setShowFeedback(false);
  };

  const completedCount = submissions.length;
  const correctCount = submissions.filter(s => s.correct === true).length;

  return (
    <div className={`min-h-screen font-sans pb-16 ${isExplorer ? 'bg-gradient-to-br from-pink-50 via-yellow-50 to-cyan-50' : 'bg-gradient-to-br from-rose-50 via-slate-50 to-amber-50'}`}>
      {/* Nav */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 font-bold text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="font-black text-lg text-rose-600">✍️ Writing Practice</h1>
        <div className="text-sm font-bold text-slate-500 capitalize">{ageGroup}</div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`font-black mb-2 ${isExplorer ? 'text-3xl text-pink-600' : 'text-2xl text-slate-800'}`}>{task.title}</h2>
          <p className="text-slate-500 font-medium">{task.instruction}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="text-xs text-slate-400 font-bold uppercase">Written</p>
            <p className="text-2xl font-black text-indigo-600">{completedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="text-xs text-slate-400 font-bold uppercase">Prompts</p>
            <p className="text-2xl font-black text-slate-600">{task.prompts.length}</p>
          </div>
          {isExplorer && (
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
              <p className="text-xs text-slate-400 font-bold uppercase">Correct</p>
              <p className="text-2xl font-black text-emerald-600">{correctCount}</p>
            </div>
          )}
          {!isExplorer && (
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
              <p className="text-xs text-slate-400 font-bold uppercase">Words</p>
              <p className="text-2xl font-black text-emerald-600">{text.trim().split(/\s+/).filter(Boolean).length}</p>
            </div>
          )}
        </div>

        {/* Task Card */}
        <div className={`rounded-2xl p-6 mb-6 border ${isExplorer ? 'bg-gradient-to-br from-pink-100 to-yellow-100 border-pink-200' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${isExplorer ? 'bg-pink-200 text-pink-600' : 'bg-rose-100 text-rose-600'}`}>
              <Edit3 size={20} />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase">Task {currentIdx + 1} of {task.prompts.length}</span>
          </div>
          <p className={`font-bold mb-4 ${isExplorer ? 'text-2xl text-pink-800' : 'text-xl text-slate-800'}`}>
            {current.label}
          </p>

          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setShowFeedback(false); }}
            placeholder="Start typing here..."
            disabled={showFeedback}
            className={`w-full p-4 rounded-xl border focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none resize-none transition ${
              isExplorer ? 'h-24 text-2xl font-bold text-center border-pink-200' : 'h-40 border-slate-200'
            } ${showFeedback ? 'opacity-70' : ''}`}
          />
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`rounded-2xl p-6 mb-6 border text-center ${
            current.expected
              ? (text.trim().toLowerCase() === current.expected
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200')
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <CheckCircle size={40} className={`mx-auto mb-3 ${
              current.expected
                ? (text.trim().toLowerCase() === current.expected ? 'text-emerald-500' : 'text-amber-500')
                : 'text-emerald-500'
            }`} />
            {current.expected ? (
              text.trim().toLowerCase() === current.expected
                ? <p className="text-xl font-black text-emerald-700">Perfect! That's correct! 🎉</p>
                : <p className="text-xl font-black text-amber-700">Not quite. The answer is "{current.expected}". Try again!</p>
            ) : (
              <p className="text-xl font-black text-emerald-700">Great writing! Submission saved! 📝</p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={retry}
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> Retry
          </button>
          {!showFeedback ? (
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-lg shadow-rose-200 disabled:opacity-40"
            >
              Submit ✓
            </button>
          ) : (
            <button
              onClick={nextPrompt}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Next Task →
            </button>
          )}
        </div>

        {/* Submission History */}
        {submissions.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-black text-lg text-slate-800 mb-4">Your Submissions</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {[...submissions].reverse().map((s, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-400 font-bold">{s.prompt}</p>
                  <p className="text-slate-700 font-medium mt-1">"{s.response}"</p>
                  {s.correct !== null && (
                    <span className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${s.correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {s.correct ? '✓ Correct' : '✗ Try again'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
