import { useState, useCallback } from "react";

const UNLOCK_CHAIN = {
  tracing: "memory",
  "sound-matching": "sorting",
  memory: "story",
  sorting: "story",
};

const INITIAL_UNLOCKED = new Set(["tracing", "sound-matching"]);

export function useActivityProgress() {
  const [unlockedActivities, setUnlockedActivities] = useState(INITIAL_UNLOCKED);

  const isUnlocked = useCallback(
    (activityId) => unlockedActivities.has(activityId),
    [unlockedActivities]
  );

  const unlockActivity = useCallback((activityId) => {
    setUnlockedActivities((prev) => {
      const next = new Set(prev);
      next.add(activityId);
      return next;
    });
  }, []);

  const completeActivity = useCallback(
    (activityId) => {
      const nextActivity = UNLOCK_CHAIN[activityId];
      if (nextActivity) {
        setUnlockedActivities((prev) => {
          const next = new Set(prev);
          next.add(nextActivity);
          return next;
        });
      }
      return nextActivity || null;
    },
    []
  );

  return { isUnlocked, unlockActivity, completeActivity, unlockedActivities };
}
