import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

export function useDailyJourney() {
  const { token } = useAuth();
  const [journey, setJourney] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [gamification, setGamification] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJourney = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/engine/journey", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load journey");
      setJourney(data.journey || []);
      setCompletedToday(data.completedToday || []);
      setGamification(data.gamification || {});
    } catch (err) {
      console.error("Journey fetch error:", err);
      setError(err.message);
      // Fallback journey
      setJourney(["tracing", "sound-matching", "memory"]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchJourney(); }, [fetchJourney]);

  return { journey, completedToday, gamification, loading, error, refetch: fetchJourney };
}
