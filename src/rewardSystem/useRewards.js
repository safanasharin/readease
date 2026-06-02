import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useReward } from "./RewardContext";

export function useRewards() {
  const { token } = useAuth();
  const { triggerReward } = useReward();

  const awardActivity = useCallback(async ({ activityId, xpEarned = 10, starsEarned = 1, badge = null, message = "Great job!", analytics = {} }) => {
    // Always trigger the reward UI regardless of API result
    triggerReward({ stars: starsEarned, xp: xpEarned, badge, message });

    try {
      const response = await fetch("http://localhost:5000/api/engine/reward", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activityId, xpEarned, starsEarned, badge, analytics }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Failed to save reward to backend:", err);
      return null;
    }
  }, [token, triggerReward]);

  return { awardActivity };
}
