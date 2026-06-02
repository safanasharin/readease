/* eslint-disable */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDailyJourney } from "../../recommendationEngine/useDailyJourney";
import { useActivityProgress } from "../../activityEngine/useActivityProgress";
import { RewardProvider } from "../../rewardSystem/RewardContext";
import ActivityCard from "../../components/explorer/ActivityCard";
import MascotGuide from "../../components/explorer/MascotGuide";
import RewardPopup from "../../components/explorer/RewardPopup";
import { Star, Trophy, Zap, ArrowLeft, Clock, Users, ChevronRight, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ALL_ACTIVITIES = [
  "tracing",
  "sound-matching",
  "memory",
  "sorting",
  "story",
  "letter-confusion",
  "sequencing",
  "visual-detective",
];

const SUPPORT_CONFIG = {
  emerging_support: {
    label: "🌱 Emerging Support",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    sessionLimit: 20,
  },
  guided_support: {
    label: "🌿 Guided Support",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    sessionLimit: 15,
  },
  intensive_support: {
    label: "🌳 Intensive Support",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    sessionLimit: 10,
  },
};

const SKILL_KEYS = [
  { key: "phonologicalAwareness", label: "Sounds", emoji: "🎵", color: "pink" },
  { key: "visualProcessing", label: "Vision", emoji: "👁️", color: "teal" },
  { key: "workingMemory", label: "Memory", emoji: "🧠", color: "purple" },
  { key: "attentionControl", label: "Focus", emoji: "🎯", color: "amber" },
  { key: "fineMotorSkills", label: "Motor", emoji: "✍️", color: "rose" },
  { key: "languageComprehension", label: "Language", emoji: "📖", color: "indigo" },
];

const COLOR_BARS = {
  indigo: "bg-indigo-400",
  pink: "bg-pink-400",
  purple: "bg-purple-400",
  teal: "bg-teal-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
};

// ─── Session Limit Overlay ────────────────────────────────────────────────────
function SessionLimitOverlay({ childName, sessionLimit, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
      >
        <div className="text-7xl mb-4">⏰</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Great Work Today! 🌟</h2>
        <p className="text-gray-500 font-semibold mb-4">
          {childName} has reached today's {sessionLimit}-minute learning limit. Time for a break!
        </p>
        <p className="text-sm text-indigo-500 font-bold mb-6">
          Come back tomorrow for more adventures! 🦁
        </p>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black px-8 py-3 rounded-full shadow-md hover:scale-105 transition cursor-pointer"
        >
          Got it! 👍
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Skill Mini Bar ───────────────────────────────────────────────────────────
function SkillMiniBar({ skillKey, label, emoji, color, value = 0 }) {
  const barColor = COLOR_BARS[color] || COLOR_BARS.indigo;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
          {emoji} {label}
        </span>
        <span className="text-xs font-black text-gray-500">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${barColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Inner Hub ────────────────────────────────────────────────────────────────
function ExplorerHubInner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { journey, completedToday, gamification, loading } = useDailyJourney();
  const { isUnlocked } = useActivityProgress();
  const [activeTab, setActiveTab] = useState("journey");
  const [showSessionLimit, setShowSessionLimit] = useState(false);

  const firstName = user?.name?.split(" ")[0] || "Explorer";
  const totalXP = gamification?.totalXP || 0;
  const totalStars = gamification?.totalStars || 0;
  const level = gamification?.level || 1;
  const badges = gamification?.badges || [];

  const supportLevel = user?.supportLevel || "guided_support";
  const sc = SUPPORT_CONFIG[supportLevel] || SUPPORT_CONFIG.guided_support;
  const skillProgress = user?.skillProgress || {};

  const journeyActivities = journey.length > 0 ? journey : ["tracing", "sound-matching", "memory"];

  // Check if session limit reached
  const dailySession = user?.dailySession || {};
  const sessionStartTime = dailySession.sessionStart ? new Date(dailySession.sessionStart) : null;
  const sessionMinutes = sessionStartTime
    ? Math.floor((Date.now() - sessionStartTime.getTime()) / 60000)
    : 0;
  const sessionLimitReached = sessionMinutes >= sc.sessionLimit;

  // Show overlay once if session limit reached
  useEffect(() => {
    if (sessionLimitReached) {
      setShowSessionLimit(true);
    }
  }, [sessionLimitReached]);

  // Build recommended activities based on weak skills
  const weakSkillActivities = [];
  const skillToActivity = {
    phonologicalAwareness: "sound-matching",
    visualProcessing: "visual-detective",
    workingMemory: "memory",
    attentionControl: "sorting",
    fineMotorSkills: "tracing",
    languageComprehension: "story",
  };
  Object.keys(skillProgress).forEach((k) => {
    if ((typeof skillProgress[k] === "number" ? skillProgress[k] : 0) < 40) {
      const act = skillToActivity[k];
      if (act && !weakSkillActivities.includes(act)) weakSkillActivities.push(act);
    }
  });
  const recommendedActivities = weakSkillActivities.slice(0, 3);

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "linear-gradient(135deg, #FFF0F9 0%, #EEF2FF 50%, #F0FFF4 100%)" }}
    >
      <RewardPopup />

      {/* Session Limit Overlay */}
      <AnimatePresence>
        {showSessionLimit && (
          <SessionLimitOverlay
            childName={firstName}
            sessionLimit={sc.sessionLimit}
            onClose={() => setShowSessionLimit(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-pink-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-bold text-sm cursor-pointer"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex items-center gap-1">
          <span className="text-2xl">🦁</span>
          <span className="font-black text-lg text-indigo-700">ReadEase</span>
          <span className="text-xs bg-pink-100 text-pink-600 font-bold px-2 py-0.5 rounded-full ml-1">Explorer</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
            <Star size={13} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-black text-yellow-700">{totalStars}</span>
          </div>
          <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
            <Zap size={13} className="text-indigo-500" />
            <span className="text-xs font-black text-indigo-700">{totalXP} XP</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ── Welcome Hero ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 mb-5 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-[120px] opacity-10 select-none leading-none">🌟</div>
          <p className="text-xs font-bold opacity-70 mb-0.5">Welcome back!</p>
          <h1 className="text-3xl font-black mb-1">Hi, {firstName}! 👋</h1>
          <p className="text-sm font-semibold opacity-80">Let's learn and play today! 🌟</p>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5">
              <Trophy size={14} className="text-yellow-300" />
              <span className="text-xs font-black">Level {level} Explorer</span>
            </div>
            <div className={`inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-1.5`}>
              <Clock size={13} className="opacity-80" />
              <span className="text-xs font-black">{sc.sessionLimit} min/day</span>
            </div>
          </div>
        </div>

        {/* ── Support Level Badge ───────────────────────────────────────────── */}
        <div className={`${sc.bg} ${sc.border} border rounded-2xl p-4 mb-5 flex items-center justify-between`}>
          <div>
            <p className={`text-xs font-bold ${sc.color} uppercase tracking-wide mb-0.5`}>Your Support Level</p>
            <p className={`text-lg font-black ${sc.color}`}>{sc.label}</p>
          </div>
          <button
            onClick={() => navigate("/parent")}
            className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-black text-gray-600 hover:bg-gray-50 transition cursor-pointer shadow-sm"
          >
            <Users size={13} /> Parent View
            <ChevronRight size={13} />
          </button>
        </div>

        {/* ── Mascot ──────────────────────────────────────────────────────── */}
        <div className="mb-5 px-2">
          <MascotGuide activity="idle" mood="happy" />
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex bg-white rounded-2xl p-1.5 mb-5 shadow-sm border border-gray-100 gap-1">
          {[
            { id: "journey", label: "📅 Today" },
            { id: "all", label: "🎮 All" },
            { id: "skills", label: "📊 Skills" },
            { id: "rewards", label: "⭐ Rewards" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer
                ${activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ══ TODAY'S JOURNEY TAB ════════════════════════════════════════════ */}
          {activeTab === "journey" && (
            <motion.div
              key="journey"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📅</span>
                <h2 className="text-xl font-black text-gray-800">Today's Learning Journey</h2>
              </div>

              {/* Session limit warning */}
              {sessionLimitReached && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center gap-3"
                >
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="font-black text-amber-700 text-sm">Session limit reached!</p>
                    <p className="text-xs text-amber-600 font-semibold">
                      Great job today! Come back tomorrow for more.
                    </p>
                  </div>
                </motion.div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="text-5xl animate-bounce mb-3">🦁</div>
                  <p className="text-gray-500 font-bold">Preparing your journey...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {journeyActivities.map((actId, i) => (
                    <div key={actId} className="relative">
                      {i < journeyActivities.length - 1 && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0.5 h-4 bg-gradient-to-b from-indigo-300 to-transparent z-10" />
                      )}
                      <ActivityCard
                        activityId={actId}
                        unlocked={isUnlocked(actId)}
                        completed={completedToday.includes(actId)}
                        isJourneyStep
                        stepNumber={i + 1}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black text-gray-700">Today's Progress</span>
                  <span className="text-sm font-bold text-indigo-600">
                    {completedToday.filter((a) => journeyActivities.includes(a)).length} / {journeyActivities.length} done
                  </span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(completedToday.filter((a) => journeyActivities.includes(a)).length / journeyActivities.length) * 100}%`,
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              {/* Recommended For You */}
              {recommendedActivities.length > 0 && (
                <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                  <h3 className="text-sm font-black text-indigo-700 mb-3">⚡ Recommended For You</h3>
                  <div className="flex flex-col gap-2">
                    {recommendedActivities.map((actId) => (
                      <button
                        key={actId}
                        onClick={() => navigate(`/explorer/activity/${actId}`)}
                        className="flex items-center justify-between bg-white hover:bg-indigo-50 border border-indigo-100 rounded-xl p-3 transition cursor-pointer"
                      >
                        <span className="font-bold text-gray-700 text-sm capitalize">
                          {actId.replace(/-/g, " ")}
                        </span>
                        <ChevronRight size={15} className="text-indigo-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ══ ALL ACTIVITIES TAB ════════════════════════════════════════════ */}
          {activeTab === "all" && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-black text-gray-800 mb-4">🎮 All Activities</h2>
              <div className="grid grid-cols-2 gap-4">
                {ALL_ACTIVITIES.map((actId) => (
                  <ActivityCard
                    key={actId}
                    activityId={actId}
                    unlocked={isUnlocked(actId)}
                    completed={completedToday.includes(actId)}
                  />
                ))}
              </div>

              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-sm font-black text-amber-800">Unlock tip!</p>
                  <p className="text-xs text-amber-700 font-semibold mt-0.5">
                    Complete Letter Tracing to unlock Memory Games. Complete Sound Matching to unlock Shape Sorting!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ SKILLS TAB ═══════════════════════════════════════════════════ */}
          {activeTab === "skills" && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-800">📊 Skill Progress</h2>
                <button
                  onClick={() => navigate("/parent")}
                  className="text-xs font-black text-indigo-500 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  Full Report <ChevronRight size={13} />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <div className="flex flex-col gap-4">
                  {SKILL_KEYS.map((sk) => (
                    <SkillMiniBar
                      key={sk.key}
                      skillKey={sk.key}
                      label={sk.label}
                      emoji={sk.emoji}
                      color={sk.color}
                      value={typeof skillProgress[sk.key] === "number" ? skillProgress[sk.key] : 0}
                    />
                  ))}
                </div>
              </div>

              {/* Milestone badges earned */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-black text-gray-700 mb-3 text-sm">🏅 Skill Milestones</h3>
                <div className="grid grid-cols-2 gap-2">
                  {SKILL_KEYS.map((sk) => {
                    const val = skillProgress[sk.key]?.level || 0;
                    const reached = val >= 50;
                    return (
                      <div
                        key={sk.key}
                        className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold border ${
                          reached
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-gray-50 border-gray-100 text-gray-400"
                        }`}
                      >
                        <span>{sk.emoji}</span>
                        <span>{sk.label}</span>
                        {reached && <span className="ml-auto text-green-500">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ REWARDS TAB ══════════════════════════════════════════════════ */}
          {activeTab === "rewards" && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-black text-gray-800 mb-4">⭐ My Rewards</h2>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Stars", value: totalStars, emoji: "⭐", color: "bg-yellow-50 border-yellow-200" },
                  { label: "XP Points", value: totalXP, emoji: "⚡", color: "bg-indigo-50 border-indigo-200" },
                  { label: "Level", value: level, emoji: "🏆", color: "bg-pink-50 border-pink-200" },
                ].map(({ label, value, emoji, color }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.04 }}
                    className={`${color} border rounded-2xl p-4 text-center`}
                  >
                    <div className="text-3xl mb-1">{emoji}</div>
                    <div className="text-2xl font-black text-gray-800">{value}</div>
                    <div className="text-xs font-bold text-gray-500">{label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-base font-black text-gray-700 mb-3">🎖️ Badges Earned</h3>
                {badges.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-2">🔓</div>
                    <p className="text-gray-400 font-bold text-sm">Complete activities to earn badges!</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-gradient-to-r from-amber-100 to-yellow-100 border border-yellow-300 rounded-full px-4 py-1.5"
                      >
                        <span className="text-sm font-bold text-yellow-800">🎖️ {badge}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* XP progress toward next level */}
              <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <p className="text-sm font-black text-indigo-700 mb-2">Next Level Progress</p>
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
                  <span>Level {level}</span>
                  <span>{totalXP} / {level * 50} XP</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalXP / (level * 50)) * 100)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function ExplorerLearningHub() {
  return (
    <RewardProvider>
      <ExplorerHubInner />
    </RewardProvider>
  );
}
