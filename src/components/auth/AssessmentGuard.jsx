/* eslint-disable */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHubRoute, getAssessmentRoute } from "../../adaptive-engine/interventionEngine";

/**
 * AssessmentGuard
 * Single gatekeeper for all protected routes.
 *
 * Rules:
 * 1. Not logged in → redirect to home "/"
 * 2. Logged in, screening NOT completed → redirect to their age-group assessment
 * 3. Logged in, screening completed, trying to access /assessment/* → redirect to their hub
 * 4. Logged in, screening completed → allow through
 *
 * This guard handles ALL 4 age groups correctly.
 * Explorer users are NEVER sent to /dashboard/levelX.
 */
export default function AssessmentGuard({ children }) {
  const { user, token } = useAuth();
  const location = useLocation();

  // Rule 1: Not authenticated
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const ageGroup = (user.ageGroup || "beginner").toLowerCase();
  const assessmentPath = getAssessmentRoute(ageGroup);
  const hubPath = getHubRoute(ageGroup);
  const currentPath = location.pathname.toLowerCase();

  // Rule 2: Screening not completed → must do assessment first
  if (!user.screeningCompleted) {
    if (currentPath !== assessmentPath) {
      return <Navigate to={assessmentPath} replace />;
    }
    return children;
  }

  // Rule 3: Screening done, but trying to access an assessment page → send to hub
  if (currentPath.startsWith("/assessment")) {
    return <Navigate to={hubPath} replace />;
  }

  // Rule 4: Screening done — allow access
  return children;
}
