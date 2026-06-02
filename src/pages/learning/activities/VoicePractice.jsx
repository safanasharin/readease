/* eslint-disable */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Mic, MicOff, ArrowLeft, RotateCcw, ChevronRight, Volume2, CheckCircle, XCircle } from 'lucide-react';

const WORD_BANK = {
  explorer: {
    title: "Letter Sounds & Simple Words",
    items: [
      { text: "Cat", hint: "🐱 A furry pet" },
      { text: "Dog", hint: "🐶 Man's best friend" },
      { text: "Apple", hint: "🍎 A red fruit" },
      { text: "Ball", hint: "⚽ You kick it" },
      { text: "Sun", hint: "☀️ It shines in the sky" },
      { text: "Fish", hint: "🐟 Lives in water" },
      { text: "Bird", hint: "🐦 It can fly" },
      { text: "Star", hint: "⭐ Twinkles at night" },
    ],
  },
  beginner: {
    title: "Vocabulary & Short Sentences",
    items: [
      { text: "The cat is sleeping", hint: "A cat taking a nap" },
      { text: "I like reading books", hint: "A fun hobby" },
      { text: "The sun is bright today", hint: "Looking outside" },
      { text: "My dog is very happy", hint: "A cheerful pet" },
      { text: "We play in the garden", hint: "Outdoor fun" },
      { text: "She has a blue bag", hint: "A colorful accessory" },
    ],
  },
  intermediate: {
    title: "Academic Vocabulary & Passages",
    items: [
      { text: "The water cycle is important for all living things", hint: "Science topic" },
      { text: "Plants need sunlight and water to grow", hint: "Biology basics" },
      { text: "The earth revolves around the sun", hint: "Space science" },
      { text: "Reading helps you learn new vocabulary", hint: "Language arts" },
      { text: "History teaches us about the past", hint: "Social studies" },
    ],
  },
  advanced: {
    title: "Professional Communication",
    items: [
      { text: "Please review the attached quarterly report", hint: "Business email" },
      { text: "The meeting has been rescheduled to Friday afternoon", hint: "Office update" },
      { text: "We need to analyze the data before making a decision", hint: "Critical thinking" },
      { text: "Effective communication is essential in the workplace", hint: "Professional skills" },
      { text: "The project deadline has been extended by two weeks", hint: "Project management" },
    ],
  },
};

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function calcAccuracy(spoken, target) {
  const s = spoken.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const t = target.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  if (!s || !t) return 0;
  const dist = levenshtein(s, t);
  const maxLen = Math.max(s.length, t.length);
  return Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));
}

export default function VoicePractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ageGroup = (user?.ageGroup || 'explorer').toLowerCase();

  const bank = WORD_BANK[ageGroup] || WORD_BANK.explorer;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const recognitionRef = useRef(null);

  const current = bank.items[currentIdx];

  const speakTarget = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(current.text);
      u.rate = ageGroup === 'explorer' ? 0.7 : 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setTranscript(spoken);
      const score = calcAccuracy(spoken, current.text);
      setAccuracy(score);
      setAttempts(prev => [...prev, { word: current.text, spoken, score }]);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const nextWord = () => {
    setCurrentIdx(prev => (prev + 1) % bank.items.length);
    setTranscript('');
    setAccuracy(null);
  };

  const retry = () => {
    setTranscript('');
    setAccuracy(null);
  };

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : 0;

  const getFeedback = (score) => {
    if (score >= 90) return { text: "Excellent Pronunciation!", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle size={24} className="text-emerald-500" /> };
    if (score >= 70) return { text: "Good job! Keep practicing!", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: <CheckCircle size={24} className="text-amber-500" /> };
    return { text: "Keep trying! You'll get there!", color: "text-rose-600", bg: "bg-rose-50 border-rose-200", icon: <XCircle size={24} className="text-rose-500" /> };
  };

  const isExplorer = ageGroup === 'explorer';

  return (
    <div className={`min-h-screen font-sans pb-16 ${isExplorer ? 'bg-gradient-to-br from-pink-50 via-yellow-50 to-cyan-50' : 'bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50'}`}>
      {/* Nav */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 font-bold text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="font-black text-lg text-indigo-700">🎤 Voice Practice</h1>
        <div className="text-sm font-bold text-slate-500 capitalize">{ageGroup}</div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className={`font-black mb-2 ${isExplorer ? 'text-3xl text-pink-600' : 'text-2xl text-slate-800'}`}>{bank.title}</h2>
          <p className="text-slate-500 font-medium">Read the text below out loud. Click the microphone to start.</p>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="text-xs text-slate-400 font-bold uppercase">Practiced</p>
            <p className="text-2xl font-black text-indigo-600">{attempts.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="text-xs text-slate-400 font-bold uppercase">Avg Score</p>
            <p className="text-2xl font-black text-emerald-600">{avgScore}%</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="text-xs text-slate-400 font-bold uppercase">Remaining</p>
            <p className="text-2xl font-black text-amber-600">{bank.items.length - new Set(attempts.map(a => a.word)).size}</p>
          </div>
        </div>

        {/* Target Card */}
        <div className={`rounded-2xl p-8 mb-6 text-center shadow-lg relative overflow-hidden ${isExplorer ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500' : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-600'}`}>
          <div className="absolute top-0 right-0 text-[100px] opacity-10 select-none leading-none">🎤</div>
          <p className="text-white/70 text-sm font-bold mb-2 uppercase tracking-wider">Say this:</p>
          <p className={`text-white font-black leading-tight mb-4 ${isExplorer ? 'text-5xl' : 'text-3xl'}`}>
            "{current.text}"
          </p>
          <p className="text-white/60 text-sm font-medium">{current.hint}</p>
          <button onClick={speakTarget} className="mt-4 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full px-4 py-2 text-white text-sm font-bold transition">
            <Volume2 size={16} /> Hear it
          </button>
        </div>

        {/* Mic Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={toggleListening}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isListening
                ? 'bg-red-500 scale-110 animate-pulse shadow-red-300'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-indigo-300'
            }`}
          >
            {isListening ? <MicOff size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
          </button>
        </div>
        <p className="text-center text-sm text-slate-400 font-bold mb-6">{isListening ? '🔴 Listening... Speak now!' : 'Tap the microphone to begin'}</p>

        {/* Result */}
        {transcript && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <p className="text-xs text-slate-400 font-bold uppercase mb-2">You said:</p>
            <p className="text-xl font-bold text-slate-800 mb-4">"{transcript}"</p>

            {accuracy !== null && (() => {
              const fb = getFeedback(accuracy);
              return (
                <div className={`${fb.bg} border rounded-xl p-4 flex items-center gap-4`}>
                  {fb.icon}
                  <div>
                    <p className={`font-black text-lg ${fb.color}`}>{fb.text}</p>
                    <p className="text-slate-600 font-medium">Accuracy: <span className="font-black">{accuracy}%</span></p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={retry} className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center justify-center gap-2">
            <RotateCcw size={18} /> Try Again
          </button>
          <button onClick={nextWord} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
            Next <ChevronRight size={18} />
          </button>
        </div>

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-black text-lg text-slate-800 mb-4">Recent Attempts</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {[...attempts].reverse().slice(0, 5).map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-700">{a.word}</p>
                    <p className="text-sm text-slate-400">You said: "{a.spoken}"</p>
                  </div>
                  <span className={`text-lg font-black ${a.score >= 90 ? 'text-emerald-600' : a.score >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {a.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
