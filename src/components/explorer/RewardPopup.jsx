import { useEffect } from "react";
import { useReward } from "../../rewardSystem/RewardContext";

export default function RewardPopup() {
  const { showReward, rewardData, hideReward } = useReward();

  useEffect(() => {
    if (showReward) {
      const t = setTimeout(hideReward, 3500);
      return () => clearTimeout(t);
    }
  }, [showReward, hideReward]);

  if (!showReward) return null;

  const { stars = 1, xp = 10, badge = null, message = "Amazing work!" } = rewardData;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      style={{ animation: "rewardFadeIn 0.4s ease-out" }}
    >
      {/* Confetti burst background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 12 + 6}px`,
              height: `${Math.random() * 12 + 6}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ["#FDE68A", "#6EE7B7", "#93C5FD", "#F9A8D4", "#C4B5FD", "#FCA5A5"][i % 6],
              animation: `confettiFall ${0.8 + Math.random() * 0.8}s ease-out forwards`,
              animationDelay: `${Math.random() * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Main popup card */}
      <div
        className="relative bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-300 p-8 flex flex-col items-center text-center max-w-xs w-full mx-4 pointer-events-auto"
        style={{ animation: "rewardBounce 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <button
          onClick={hideReward}
          className="absolute top-3 right-4 text-gray-300 hover:text-gray-500 font-bold text-xl cursor-pointer"
        >
          ×
        </button>

        {/* Trophy / badge emoji */}
        <div className="text-7xl mb-3" style={{ animation: "spin 1s ease-out" }}>
          {badge ? "🏅" : "🏆"}
        </div>

        <h2 className="text-2xl font-black text-gray-800 mb-1">{message}</h2>

        {badge && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-full px-4 py-1 mb-3">
            <span className="text-yellow-800 text-sm font-bold">🎖️ Badge: {badge}</span>
          </div>
        )}

        {/* Stars earned */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
            <span
              key={i}
              className="text-3xl"
              style={{ animation: `starPop 0.3s ease-out ${i * 0.1}s both` }}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* XP badge */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full font-black text-lg shadow-lg">
          +{xp} XP
        </div>
      </div>

      <style>{`
        @keyframes rewardFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes rewardBounce { from { transform: scale(0.3); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes confettiFall { from { transform: translateY(-20px) rotate(0deg); opacity: 1 } to { transform: translateY(110vh) rotate(720deg); opacity: 0 } }
        @keyframes starPop { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes spin { from { transform: rotate(-20deg) scale(0.5); } to { transform: rotate(0deg) scale(1); } }
      `}</style>
    </div>
  );
}
