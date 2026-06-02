import { useRef, useCallback } from "react";

export function useActivityAnalytics() {
  const startTimeRef = useRef(Date.now());
  const hesitationTimesRef = useRef([]);
  const mistakesRef = useRef(0);

  const recordHesitation = useCallback((ms) => {
    hesitationTimesRef.current.push(ms);
  }, []);

  const recordMistake = useCallback(() => {
    mistakesRef.current += 1;
  }, []);

  const getAnalytics = useCallback(() => {
    const totalTime = Date.now() - startTimeRef.current;
    const hesitations = hesitationTimesRef.current;
    const avgHesitation = hesitations.length > 0
      ? Math.round(hesitations.reduce((a, b) => a + b, 0) / hesitations.length)
      : 0;
    const totalMistakes = mistakesRef.current;
    // accuracy: inverse of mistake rate over hesitations+mistakes
    const totalActions = hesitations.length + totalMistakes + 1;
    const accuracy = Math.max(0, Math.round(((totalActions - totalMistakes) / totalActions) * 100));
    return { totalTime, avgHesitation, totalMistakes, accuracy };
  }, []);

  const reset = useCallback(() => {
    startTimeRef.current = Date.now();
    hesitationTimesRef.current = [];
    mistakesRef.current = 0;
  }, []);

  return { recordHesitation, recordMistake, getAnalytics, reset };
}
