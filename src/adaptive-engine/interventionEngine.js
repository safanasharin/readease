/**
 * interventionEngine.js
 * Central adaptive engine. Takes { ageGroup, severity, preferredAids }
 * and returns a complete interventionProfile used by the entire frontend.
 *
 * Usage:
 *   import { buildInterventionProfile } from './interventionEngine';
 *   const profile = buildInterventionProfile({ ageGroup: 'beginner', severity: 'severe' });
 */

import { SEVERITY_UI_CONFIG, SEVERITY_PACING, SEVERITY_DIFFICULTY, classifySeverity } from "./severityConfig.js";
import { buildAidsForProfile, getAvailableAids } from "./aidProfiles.js";

const AGE_GROUP_BASE_FONT_SIZE = {
  explorer:     28,
  beginner:     22,
  intermediate: 18,
  advanced:     16,
};

const AGE_GROUP_THEMES = {
  explorer: {
    primaryColor: "#EC4899",   // pink
    accentColor:  "#F59E0B",   // amber
    bgGradient:   "from-pink-100 via-yellow-100 to-cyan-100",
    cardStyle:    "rounded-3xl border-4",
    fontWeight:   "extrabold",
    emojiDensity: "high",
  },
  beginner: {
    primaryColor: "#6366F1",   // indigo
    accentColor:  "#10B981",   // emerald
    bgGradient:   "from-indigo-50 via-purple-50 to-pink-50",
    cardStyle:    "rounded-2xl border-2",
    fontWeight:   "bold",
    emojiDensity: "medium",
  },
  intermediate: {
    primaryColor: "#0EA5E9",   // sky blue
    accentColor:  "#8B5CF6",   // violet
    bgGradient:   "from-sky-50 via-slate-50 to-violet-50",
    cardStyle:    "rounded-xl border",
    fontWeight:   "semibold",
    emojiDensity: "low",
  },
  advanced: {
    primaryColor: "#1E293B",   // slate dark
    accentColor:  "#6366F1",   // indigo
    bgGradient:   "from-slate-900 via-slate-800 to-slate-900",
    cardStyle:    "rounded-lg border border-slate-700",
    fontWeight:   "medium",
    emojiDensity: "none",
    isDark: true,
  },
};

const AGE_GROUP_LABELS = {
  explorer:     { label: "Explorer",     ageRange: "4–5 years" },
  beginner:     { label: "Beginner",     ageRange: "6–8 years" },
  intermediate: { label: "Intermediate", ageRange: "9–12 years" },
  advanced:     { label: "Advanced",     ageRange: "13+ years" },
};

/**
 * Main engine function.
 * Returns a complete interventionProfile object.
 *
 * @param {Object} options
 * @param {string} options.ageGroup - "explorer" | "beginner" | "intermediate" | "advanced"
 * @param {string} options.severity - "mild" | "moderate" | "severe"
 * @param {string[]} [options.preferredAids] - user-overridden aids (optional)
 * @param {number}  [options.score] - raw assessment score (optional, used if severity not provided)
 * @returns {Object} interventionProfile
 */
export function buildInterventionProfile({ ageGroup = "beginner", severity, score, preferredAids = [] }) {
  const normalizedGroup = (ageGroup || "beginner").toLowerCase();
  
  // Determine severity: use explicit severity, or derive from score, or default to "moderate"
  let resolvedSeverity = severity;
  if (!resolvedSeverity && score !== undefined) {
    resolvedSeverity = classifySeverity(score);
  }
  if (!resolvedSeverity) resolvedSeverity = "moderate";

  const uiConfig = SEVERITY_UI_CONFIG[resolvedSeverity] || SEVERITY_UI_CONFIG.moderate;
  const pacing   = SEVERITY_PACING[resolvedSeverity]   || SEVERITY_PACING.moderate;
  const difficulty = SEVERITY_DIFFICULTY[resolvedSeverity] || SEVERITY_DIFFICULTY.moderate;
  const theme    = AGE_GROUP_THEMES[normalizedGroup]   || AGE_GROUP_THEMES.beginner;
  const meta     = AGE_GROUP_LABELS[normalizedGroup]   || AGE_GROUP_LABELS.beginner;

  // Build aids: start from defaults, then apply user overrides
  let aids = buildAidsForProfile(normalizedGroup, resolvedSeverity);
  if (preferredAids && preferredAids.length > 0) {
    preferredAids.forEach((aidKey) => {
      if (aidKey in aids) {
        aids[aidKey] = true; // user explicitly enabled this aid
      }
    });
  }

  const baseFontSize = AGE_GROUP_BASE_FONT_SIZE[normalizedGroup] || 18;
  const fontSize = baseFontSize + uiConfig.fontSizeBoost;

  return {
    ageGroup: normalizedGroup,
    severity: resolvedSeverity,
    meta,

    // Aid toggles
    aids,

    // Available aids for this age group (used by AidToolbar to know what to show)
    availableAids: getAvailableAids(normalizedGroup),

    // UI settings driven by severity
    uiSettings: {
      ...uiConfig,
      fontSize,
      isDarkMode: theme.isDark || false,
    },

    // Visual theme driven by age group
    theme,

    // Pacing settings for transitions, feedback, instruction repeat
    pacing,

    // Activity difficulty scaling
    difficulty,

    // Convenience flags (derived from severity for quick checks)
    isSevere:   resolvedSeverity === "severe",
    isModerate: resolvedSeverity === "moderate",
    isMild:     resolvedSeverity === "mild",
    isExplorer: normalizedGroup === "explorer",
  };
}

/**
 * Derives age group from an integer age.
 * Used in registration/signup to automatically assign the group.
 */
export function deriveAgeGroup(age) {
  const n = parseInt(age, 10);
  if (isNaN(n)) return "beginner";
  if (n <= 5)  return "explorer";
  if (n <= 8)  return "beginner";
  if (n <= 12) return "intermediate";
  return "advanced";
}

/**
 * Returns the correct hub route for a given age group.
 */
export function getHubRoute(ageGroup) {
  const routes = {
    explorer:     "/explorer",
    beginner:     "/beginner",
    intermediate: "/intermediate",
    advanced:     "/advanced",
  };
  return routes[(ageGroup || "").toLowerCase()] || "/beginner";
}

/**
 * Returns the correct assessment route for a given age group.
 */
export function getAssessmentRoute(ageGroup) {
  return `/assessment/${(ageGroup || "beginner").toLowerCase()}`;
}
