import { useNavigate } from "react-router-dom";

const ACTIVITY_META = {
  tracing: {
    emoji: "✏️",
    label: "Letter Tracing",
    desc: "Trace A–Z and learn each letter sound!",
    color: "from-pink-400 to-rose-500",
    glow: "shadow-pink-200",
    route: "/explorer/activity/tracing",
  },
  "sound-matching": {
    emoji: "🔊",
    label: "Sound Matching",
    desc: "Hear a sound and pick the matching letter!",
    color: "from-sky-400 to-blue-500",
    glow: "shadow-sky-200",
    route: "/explorer/activity/sound-matching",
  },
  memory: {
    emoji: "🧠",
    label: "Memory Games",
    desc: "Flip cards and match the pairs!",
    color: "from-violet-400 to-purple-500",
    glow: "shadow-violet-200",
    route: "/explorer/activity/memory",
  },
  sorting: {
    emoji: "🎨",
    label: "Shape Sorting",
    desc: "Sort colorful shapes into the right baskets!",
    color: "from-amber-400 to-orange-500",
    glow: "shadow-amber-200",
    route: "/explorer/activity/sorting",
  },
  story: {
    emoji: "📖",
    label: "Story Listening",
    desc: "Listen to a fun story with pictures!",
    color: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-200",
    route: "/explorer/activity/story",
  },
};

export default function ActivityCard({ activityId, unlocked, completed, isJourneyStep, stepNumber }) {
  const navigate = useNavigate();
  const meta = ACTIVITY_META[activityId];
  if (!meta) return null;

  const handleClick = () => {
    if (unlocked) navigate(meta.route);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-3xl p-6 flex flex-col items-center text-center gap-3 transition-all duration-300 select-none
        ${unlocked
          ? `bg-gradient-to-br ${meta.color} text-white cursor-pointer shadow-xl ${meta.glow} hover:scale-105 hover:-translate-y-1 active:scale-95`
          : "bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-dashed border-gray-300"
        }
      `}
    >
      {isJourneyStep && (
        <span className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-400 text-yellow-900 font-black text-sm rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          {stepNumber}
        </span>
      )}

      {completed && (
        <span className="absolute -top-3 -right-3 w-8 h-8 bg-green-400 text-white font-black text-sm rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          ✓
        </span>
      )}

      <div className={`text-5xl mb-1 ${!unlocked ? "grayscale opacity-50" : "drop-shadow-md"}`}>
        {unlocked ? meta.emoji : "🔒"}
      </div>

      <h3 className={`font-black text-lg leading-tight ${unlocked ? "text-white" : "text-gray-400"}`}>
        {meta.label}
      </h3>

      <p className={`text-sm font-semibold leading-snug ${unlocked ? "text-white/85" : "text-gray-400"}`}>
        {unlocked ? meta.desc : "Complete earlier activities to unlock!"}
      </p>

      {unlocked && (
        <div className="mt-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-xs font-bold text-white tracking-wide">
          {completed ? "Play Again 🎉" : "Let's Go! →"}
        </div>
      )}
    </div>
  );
}
