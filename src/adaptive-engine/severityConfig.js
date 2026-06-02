/**
 * severityConfig.js
 * Defines what each severity level means in terms of platform behavior.
 * Severity is determined by the backend assessment score and returned as
 * "mild" | "moderate" | "severe".
 *
 * This is the single source of truth for severity-driven behavior.
 */

export const SEVERITY_LEVELS = {
  MILD: "mild",
  MODERATE: "moderate",
  SEVERE: "severe",
};

/**
 * Score-to-severity mapping.
 * The backend returns an integer score (0–100).
 * Higher score = lower dyslexia risk.
 */
export function classifySeverity(score) {
  if (score >= 70) return SEVERITY_LEVELS.MILD;
  if (score >= 40) return SEVERITY_LEVELS.MODERATE;
  return SEVERITY_LEVELS.SEVERE;
}

/**
 * Per-severity UI behavior overrides.
 * These are merged into the interventionProfile by the engine.
 */
export const SEVERITY_UI_CONFIG = {
  mild: {
    reducedDistractions: false,
    largerButtons: false,
    slowerAnimations: false,
    highContrast: false,
    simplifiedLayout: false,
    oneTaskAtATime: false,
    fontSizeBoost: 0, // extra px on top of base
  },
  moderate: {
    reducedDistractions: true,
    largerButtons: false,
    slowerAnimations: true,
    highContrast: false,
    simplifiedLayout: true,
    oneTaskAtATime: false,
    fontSizeBoost: 2,
  },
  severe: {
    reducedDistractions: true,
    largerButtons: true,
    slowerAnimations: true,
    highContrast: true,
    simplifiedLayout: true,
    oneTaskAtATime: true,
    fontSizeBoost: 4,
  },
};

/**
 * Per-severity pacing settings (milliseconds).
 */
export const SEVERITY_PACING = {
  mild: {
    transitionMs: 300,
    feedbackDisplayMs: 1500,
    instructionRepeat: false,
    autoAdvanceMs: null,
  },
  moderate: {
    transitionMs: 500,
    feedbackDisplayMs: 2000,
    instructionRepeat: false,
    autoAdvanceMs: null,
  },
  severe: {
    transitionMs: 800,
    feedbackDisplayMs: 3000,
    instructionRepeat: true,
    autoAdvanceMs: null,
  },
};

/**
 * Per-severity activity difficulty multipliers.
 * Used to scale task count, time limits, and complexity.
 */
export const SEVERITY_DIFFICULTY = {
  mild: { taskCountMultiplier: 1.0, timeLimitMultiplier: 1.0, complexityLevel: "standard" },
  moderate: { taskCountMultiplier: 0.8, timeLimitMultiplier: 1.3, complexityLevel: "simplified" },
  severe: { taskCountMultiplier: 0.6, timeLimitMultiplier: 1.8, complexityLevel: "minimal" },
};
