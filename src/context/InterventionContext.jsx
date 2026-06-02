/* eslint-disable */
import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { buildInterventionProfile } from "../adaptive-engine/interventionEngine";

const InterventionContext = createContext(null);

/**
 * InterventionProvider
 * Wraps the entire app. Reads ageGroup + severity from the logged-in user
 * and exposes a fully computed interventionProfile to all child components.
 *
 * Usage in any component:
 *   const { profile, aids, uiSettings, theme } = useIntervention();
 */
export function InterventionProvider({ children }) {
  const { user } = useAuth();

  const profile = useMemo(() => {
    if (!user) {
      // Return a safe default profile for unauthenticated users
      return buildInterventionProfile({ ageGroup: "beginner", severity: "mild" });
    }
    return buildInterventionProfile({
      ageGroup:      user.ageGroup      || "beginner",
      severity:      user.severity      || user.dyslexiaLevel || "moderate",
      score:         user.assessmentScore,
      preferredAids: user.preferredAids || [],
    });
  }, [user?.ageGroup, user?.severity, user?.dyslexiaLevel, user?.assessmentScore, user?.preferredAids]);

  return (
    <InterventionContext.Provider
      value={{
        profile,
        aids:         profile.aids,
        uiSettings:   profile.uiSettings,
        theme:        profile.theme,
        pacing:       profile.pacing,
        difficulty:   profile.difficulty,
        ageGroup:     profile.ageGroup,
        severity:     profile.severity,
        isSevere:     profile.isSevere,
        isModerate:   profile.isModerate,
        isMild:       profile.isMild,
        isExplorer:   profile.isExplorer,
        availableAids: profile.availableAids,
      }}
    >
      {children}
    </InterventionContext.Provider>
  );
}

/**
 * useIntervention hook
 * Call this inside any component to get the full adaptive profile.
 */
export function useIntervention() {
  const ctx = useContext(InterventionContext);
  if (!ctx) throw new Error("useIntervention must be used inside InterventionProvider");
  return ctx;
}
