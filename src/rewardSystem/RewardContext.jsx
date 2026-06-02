import { createContext, useContext, useState, useCallback } from "react";

const RewardContext = createContext(null);

export function RewardProvider({ children }) {
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState({ stars: 1, xp: 10, badge: null, message: "Great job!" });

  const triggerReward = useCallback(({ stars = 1, xp = 10, badge = null, message = "Amazing work!" }) => {
    setRewardData({ stars, xp, badge, message });
    setShowReward(true);
    setTimeout(() => setShowReward(false), 3500);
  }, []);

  const hideReward = useCallback(() => setShowReward(false), []);

  return (
    <RewardContext.Provider value={{ showReward, rewardData, triggerReward, hideReward }}>
      {children}
    </RewardContext.Provider>
  );
}

export function useReward() {
  const ctx = useContext(RewardContext);
  if (!ctx) throw new Error("useReward must be used inside RewardProvider");
  return ctx;
}
