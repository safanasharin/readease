/* eslint-disable */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  TrendingUp,
  Star,
  Zap,
  Award,
  BookOpen,
  Brain,
  Eye,
  Ear,
  Hand,
  Clock,
  Calendar,
  ChevronRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Mock / fallback data helpers ────────────────────────────────────────────
const SUPPORT_LABELS = {
  emerging_support: { label: "🌱 Emerging Support", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  guided_support: { label: "🌿 Guided Support", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
  intensive_support: { label: "🌳 Intensive Support", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
};

const SKILL_META = {
  phonologicalAwareness: { label: "Sound Awareness", icon: Ear, color: "pink", emoji: "🎵" },
  visualProcessing: { label: "Visual Processing", icon: Eye, color: "teal", emoji: "👁️" },
  workingMemory: { label: "Working Memory", icon: Brain, color: "purple", emoji: "🧠" },
  attentionControl: { label: "Attention & Focus", icon: TrendingUp, color: "amber", emoji: "🎯" },
  fineMotorSkills: { label: "Fine Motor Skills", icon: Hand, color: "rose", emoji: "✍️" },
  languageComprehension: { label: "Language & Reading", icon: BookOpen, color: "indigo", emoji: "📖" },
};

const ACTIVITY_LABELS = {
  tracing: { label: "Letter Tracing", emoji: "✏️" },
  "sound-matching": { label: "Sound Matching", emoji: "🔊" },
  memory: { label: "Memory Game", emoji: "🧠" },
  sorting: { label: "Shape Sorting", emoji: "🔷" },
  story: { label: "Story Time", emoji: "📖" },
  "letter-confusion": { label: "Letter Detective", emoji: "🔍" },
  sequencing: { label: "Sequencing", emoji: "📶" },
  "visual-detective": { label: "Visual Detective", emoji: "🕵️" },
};

const TIPS_BY_LEVEL = {
  emerging_support: [
    "🌟 Read aloud together for 10 minutes each day.",
    "🎵 Sing alphabet songs to reinforce letter sounds.",
    "✏️ Practice letter tracing with large, thick markers.",
  ],
  guided_support: [
    "🔤 Focus on letters your child frequently reverses (b/d, p/q).",
    "🧩 Use multi-sensory learning: trace in sand or shaving cream.",
    "📅 Keep learning sessions short (15 min) and consistent.",
  ],
  intensive_support: [
    "🧑‍⚕️ Consider consulting a specialist dyslexia tutor.",
    "📖 Use structured literacy programs with explicit phonics instruction.",
    "🤝 Celebrate every small win — confidence is key to progress.",
  ],
};

// ─── Skill Progress Bar ───────────────────────────────────────────────────────
function SkillBar({ skillKey, value = 0, sessions = 0 }) {
  const meta = SKILL_META[skillKey];
  if (!meta) return null;
  const Icon = meta.icon;
  const pct = Math.min(100, Math.max(0, value));
  const colorMap = {
    indigo: { bar: "bg-indigo-400", bg: "bg-indigo-50", text: "text-indigo-600" },
    pink: { bar: "bg-pink-400", bg: "bg-pink-50", text: "text-pink-600" },
    purple: { bar: "bg-purple-400", bg: "bg-purple-50", text: "text-purple-600" },
    teal: { bar: "bg-teal-400", bg: "bg-teal-50", text: "text-teal-600" },
    amber: { bar: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-600" },
    rose: { bar: "bg-rose-400", bg: "bg-rose-50", text: "text-rose-600" },
  };
  const c = colorMap[meta.color] || colorMap.indigo;

  return (
    <div className={`${c.bg} rounded-2xl p-4 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <span className="font-bold text-gray-700 text-sm">{meta.label}</span>
        </div>
        <span className={`text-sm font-black ${c.text}`}>{pct}%</span>
      </div>
      <div className="h-3 bg-white rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${c.bar} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-gray-400 font-semibold">{sessions} practice sessions</p>
    </div>
  );
}

// ─── Info Tooltip ─────────────────────────────────────────────────────────────
function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((s) => !s)}
        className="text-gray-300 hover:text-gray-500 cursor-pointer"
      >
        <Info size={14} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-52 bg-gray-800 text-white text-xs font-semibold rounded-xl p-3 z-50 shadow-xl"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const childName = user?.name?.split(" ")[0] || "Your Child";
  const supportLevel = user?.supportLevel || "guided_support";
  const sl = SUPPORT_LABELS[supportLevel] || SUPPORT_LABELS.guided_support;

  // Skill progress — from user object or fallback
  const skillProgress = user?.skillProgress || {};
  const skillKeys = Object.keys(SKILL_META);

  // Gamification
  const gami = user?.gamification || {};
  const totalXP = gami.totalXP || 0;
  const totalStars = gami.totalStars || 0;
  const level = gami.level || 1;
  const badges = gami.badges || [];

  // Daily session info
  const dailySession = user?.dailySession || {};
  const activitiesToday = dailySession.activitiesCompleted || [];
  const sessionLimit = { emerging_support: 20, guided_support: 15, intensive_support: 10 }[supportLevel] || 15;

  // Compute strong / weak skills
  const skillEntries = skillKeys.map((k) => ({
    key: k,
    value: typeof skillProgress[k] === "number" ? skillProgress[k] : 0,
    sessions: 0,
  }));
  const strongSkills = skillEntries.filter((s) => s.value >= 60).sort((a, b) => b.value - a.value);
  const weakSkills = skillEntries.filter((s) => s.value < 40).sort((a, b) => a.value - b.value);

  // Tips
  const tips = TIPS_BY_LEVEL[supportLevel] || TIPS_BY_LEVEL.guided_support;

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "skills", label: "🧠 Skills" },
    { id: "tips", label: "💡 Tips" },
    { id: "badges", label: "🎖️ Badges" },
  ];

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "linear-gradient(135deg,#F0F4FF 0%,#FFF0F9 60%,#F0FFF8 100%)" }}
    >
      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-indigo-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-bold text-sm cursor-pointer"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <span className="font-black text-indigo-700 text-base">👨‍👩‍👧 Parent Dashboard</span>
        <div className={`text-xs font-black px-3 py-1 rounded-full border ${sl.bg} ${sl.border} ${sl.color}`}>
          {sl.label}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ── Hero Card ─────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 mb-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[100px] opacity-10 select-none leading-none">📊</div>
          <p className="text-xs font-bold opacity-70 mb-1 uppercase tracking-widest">Learning Report</p>
          <h1 className="text-2xl font-black mb-1">{childName}'s Progress ✨</h1>
          <p className="text-sm opacity-80 font-semibold">
            Support profile: <strong>{sl.label}</strong>
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { icon: "⭐", label: "Stars", value: totalStars },
              { icon: "⚡", label: "XP", value: totalXP },
              { icon: "🏆", label: "Level", value: level },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-white/15 border border-white/20 rounded-2xl p-3 text-center">
                <div className="text-xl">{icon}</div>
                <div className="text-xl font-black">{value}</div>
                <div className="text-xs opacity-70 font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex bg-white rounded-2xl p-1.5 mb-6 shadow-sm border border-gray-100 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── OVERVIEW TAB ────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5"
            >
              {/* Today's Activity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-indigo-500" />
                  <h2 className="font-black text-gray-800">Today's Session</h2>
                  <InfoTooltip text="Activities completed in today's learning session." />
                </div>
                {activitiesToday.length === 0 ? (
                  <p className="text-gray-400 font-semibold text-sm text-center py-4">
                    No activities completed yet today. Encourage {childName} to start learning! 🌟
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activitiesToday.map((actId, i) => {
                      const meta = ACTIVITY_LABELS[actId] || { label: actId, emoji: "🎮" };
                      return (
                        <div
                          key={i}
                          className="bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1.5 text-sm font-bold text-indigo-700 flex items-center gap-1"
                        >
                          <span>{meta.emoji}</span> {meta.label}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Daily limit: {sessionLimit} min
                  </span>
                  <span>{activitiesToday.length} completed</span>
                </div>
              </div>

              {/* Strengths & Needs */}
              <div className="grid grid-cols-1 gap-4">
                {/* Strong */}
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <h3 className="font-black text-green-700 mb-3 flex items-center gap-2">
                    <Star size={16} className="text-green-500" /> Strengths 💪
                  </h3>
                  {strongSkills.length === 0 ? (
                    <p className="text-green-600 text-sm font-semibold">
                      Keep practicing to unlock strengths!
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {strongSkills.slice(0, 3).map((s) => (
                        <div key={s.key} className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-700">
                            {SKILL_META[s.key]?.emoji} {SKILL_META[s.key]?.label}
                          </span>
                          <span className="text-sm font-black text-green-600">{s.value}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Needs support */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <h3 className="font-black text-amber-700 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-amber-500" /> Areas to Grow 🌱
                  </h3>
                  {weakSkills.length === 0 ? (
                    <p className="text-amber-700 text-sm font-semibold">
                      All skills look great! Keep it up!
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {weakSkills.slice(0, 3).map((s) => (
                        <div key={s.key} className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-700">
                            {SKILL_META[s.key]?.emoji} {SKILL_META[s.key]?.label}
                          </span>
                          <span className="text-sm font-black text-amber-600">{s.value}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended next */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2">
                  <Zap size={16} className="text-indigo-400" /> Recommended Next
                </h3>
                {weakSkills.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {weakSkills.slice(0, 2).map((s) => {
                      const actMap = {
                        phonologicalAwareness: { id: "sound-matching", label: "Sound Matching", emoji: "🔊" },
                        visualProcessing: { id: "visual-detective", label: "Visual Detective", emoji: "🕵️" },
                        workingMemory: { id: "memory", label: "Memory Game", emoji: "🧠" },
                        attentionControl: { id: "sorting", label: "Shape Sorting", emoji: "🔷" },
                        fineMotorSkills: { id: "tracing", label: "Letter Tracing", emoji: "✏️" },
                        languageComprehension: { id: "story", label: "Story Time", emoji: "📖" },
                      };
                      const act = actMap[s.key];
                      if (!act) return null;
                      return (
                        <button
                          key={s.key}
                          onClick={() => navigate(`/explorer/activity/${act.id}`)}
                          className="flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl p-3 transition cursor-pointer"
                        >
                          <span className="flex items-center gap-2 font-bold text-indigo-700 text-sm">
                            <span>{act.emoji}</span> {act.label}
                          </span>
                          <ChevronRight size={16} className="text-indigo-400" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-gray-400">
                    Great progress! Continue any activity to keep building skills.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── SKILLS TAB ──────────────────────────────────────────────────── */}
          {activeTab === "skills" && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3"
            >
              <p className="text-sm text-gray-500 font-semibold mb-2">
                Skill levels are updated automatically as {childName} completes activities.
              </p>
              {skillKeys.map((k) => (
                <SkillBar
                  key={k}
                  skillKey={k}
                  value={typeof skillProgress[k] === "number" ? skillProgress[k] : 0}
                  sessions={0}
                />
              ))}
            </motion.div>
          )}

          {/* ── TIPS TAB ────────────────────────────────────────────────────── */}
          {activeTab === "tips" && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              <div className={`${sl.bg} ${sl.border} border rounded-2xl p-5 mb-2`}>
                <p className={`text-sm font-black ${sl.color} mb-1`}>Support Level</p>
                <p className="text-2xl font-black text-gray-800">{sl.label}</p>
                <p className="text-sm text-gray-500 mt-1 font-semibold">
                  These tips are personalised for {childName}'s current support profile.
                </p>
              </div>

              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                >
                  <p className="text-gray-700 font-semibold text-sm leading-relaxed">{tip}</p>
                </motion.div>
              ))}

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mt-2">
                <p className="text-indigo-700 font-black text-sm mb-1">📅 Daily Learning Schedule</p>
                <p className="text-gray-600 font-semibold text-xs leading-relaxed">
                  Recommended session: <strong>{sessionLimit} minutes</strong> per day.
                  Consistency is more important than duration. Short, daily sessions build lasting skills.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── BADGES TAB ──────────────────────────────────────────────────── */}
          {activeTab === "badges" && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <h3 className="font-black text-gray-800 mb-4">🎖️ Badges Earned</h3>
                {badges.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">🔓</div>
                    <p className="text-gray-400 font-bold">
                      {childName} hasn't earned any badges yet.
                    </p>
                    <p className="text-gray-300 text-sm font-semibold mt-1">
                      Completing activities will unlock badges!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((badge, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center"
                      >
                        <div className="text-3xl mb-2">🎖️</div>
                        <p className="text-xs font-black text-yellow-800">{badge}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* XP Milestones */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-black text-gray-800 mb-4">⚡ XP Milestones</h3>
                {[
                  { label: "First Steps", xp: 10, emoji: "👣" },
                  { label: "Explorer", xp: 50, emoji: "🗺️" },
                  { label: "Reader", xp: 100, emoji: "📚" },
                  { label: "Champion", xp: 200, emoji: "🏆" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xl">{m.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-gray-700">{m.label}</span>
                        <span className="text-xs font-black text-indigo-500">{m.xp} XP</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (totalXP / m.xp) * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    {totalXP >= m.xp && (
                      <span className="text-green-500 font-black text-lg">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
