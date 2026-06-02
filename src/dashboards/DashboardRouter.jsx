import { useAuth } from "../context/AuthContext";

// Explorer (4-5) dashboards
import ExplorerMildDashboard from "./explorer/ExplorerMildDashboard";
import ExplorerModerateDashboard from "./explorer/ExplorerModerateDashboard";
import ExplorerSevereDashboard from "./explorer/ExplorerSevereDashboard";

// Beginner (6-8) dashboard
import BeginnerHub from "./beginner/BeginnerHub";

// Intermediate (9-11) dashboards
import IntermediateMildDashboard from "./intermediate/IntermediateMildDashboard";
import IntermediateModerateDashboard from "./intermediate/IntermediateModerateDashboard";
import IntermediateSevereDashboard from "./intermediate/IntermediateSevereDashboard";

// Advanced (12+) unified dashboard
import AdvancedDashboard from "./advanced/AdvancedDashboard";

import ExplorerLearningHub from "../pages/explorer/ExplorerLearningHub";

export default function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  const ageGroup = user?.ageGroup?.toLowerCase() || "beginner";
  const severity = user?.dyslexiaLevel?.toLowerCase() || "moderate";

  // ── Explorer (4–5) ────────────────────────
  if (ageGroup === "explorer") {
    return <ExplorerLearningHub />;
  }

  // ── Beginner (6–8) ────────────────────────
  if (ageGroup === "beginner") {
    return <BeginnerHub />;
  }

  // ── Intermediate (9–11) ───────────────────
  if (ageGroup === "intermediate") {
    if (severity === "mild") return <IntermediateMildDashboard />;
    if (severity === "severe") return <IntermediateSevereDashboard />;
    return <IntermediateModerateDashboard />;
  }

  // ── Advanced (12+) ────────────────────────
  if (ageGroup === "advanced") {
    return <AdvancedDashboard />;
  }

  // Fallback
  return <BeginnerHub />;
}
