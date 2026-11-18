import { useAuth } from "../../context/AuthContext";
import ChildProgressDashboard from "../explorer/ChildProgressDashboard";
import Progress from "../../Progress";

const IntermediateParentDashboard = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Intermediate Parent Dashboard</h1>
      <p className="text-gray-600">Coming soon!</p>
    </div>
  </div>
);

const AdvancedParentDashboard = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Advanced Parent Dashboard</h1>
      <p className="text-gray-600">Coming soon!</p>
    </div>
  </div>
);

export default function ParentDashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  const ageGroup = user?.ageGroup?.toLowerCase() || "explorer";

  if (ageGroup === "explorer") {
    return <ChildProgressDashboard />;
  }

  if (ageGroup === "beginner") {
    // We import Progress as it contains the Beginner Parent Dashboard logic
    return <Progress />;
  }

  if (ageGroup === "intermediate") {
    return <IntermediateParentDashboard />;
  }

  if (ageGroup === "advanced") {
    return <AdvancedParentDashboard />;
  }

  // Fallback
  return <ChildProgressDashboard />;
}
