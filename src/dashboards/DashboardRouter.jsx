import { useAuth } from "../context/AuthContext";

// Explorer (4-5) dashboards
import ExplorerMildDashboard from "./explorer/ExplorerMildDashboard";
import ExplorerModerateDashboard from "./explorer/ExplorerModerateDashboard";
import ExplorerSevereDashboard from "./explorer/ExplorerSevereDashboard";

// Beginner (6-8) dashboard (Newly created SecondAgeDashboard replacing the old one)
import SecondAgeDashboard from "../pages/SecondAgeDashboard";

// Teen (Intermediate & Advanced) dashboard
import IntermediateDashboard from "./intermediate/IntermediateDashboard";
import AdvancedDashboard from "./advanced/AdvancedDashboard";

import ExplorerLearningHub from "../pages/explorer/ExplorerLearningHub";

export default function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  const ageGroup = user?.ageGroup?.toLowerCase() || "beginner";
  const severity = user?.dyslexiaLevel?.toLowerCase() || "moderate";

  // Temporary console logs for debugging routing issue
  console.log("User Data:", user);
  console.log("Age:", user?.age);
  console.log("Age Group:", user?.ageGroup);
  console.log("Learning Level:", user?.learningLevel);
  console.log("Current Route:", window.location.pathname);

  // ── Explorer (4–5) ────────────────────────
  if (ageGroup === "explorer") {
    return <ExplorerLearningHub />;
  }

  // ── Beginner (6–8) ────────────────────────
  if (ageGroup === "beginner") {
    return <SecondAgeDashboard />;
  }

  // ── Intermediate (9–11) ─────────
  if (ageGroup === "intermediate") {
    return <IntermediateDashboard />;
  }

  // ── Advanced (12+) ─────────
  if (ageGroup === "advanced") {
    return <AdvancedDashboard />;
  }

  // Fallback
  return <SecondAgeDashboard />;
}
