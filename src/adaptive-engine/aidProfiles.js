/**
 * aidProfiles.js
 * Defines which reading/writing aids are available per age group,
 * and which are enabled by default per severity level.
 */

export const AID_KEYS = {
  TEXT_TO_SPEECH: "textToSpeech",
  DYSLEXIA_FONT: "dyslexiaFont",
  READING_RULER: "readingRuler",
  SYLLABLE_BREAKDOWN: "syllableBreakdown",
  GUIDED_READING: "guidedReading",
  SENTENCE_CHUNKING: "sentenceChunking",
  PREDICTIVE_SPELLING: "predictiveSpelling",
  HIGH_CONTRAST: "highContrast",
  FOCUS_MODE: "focusMode",
  AUDIO_INSTRUCTIONS: "audioInstructions",
  COMPREHENSION_HINTS: "comprehensionHints",
  PARAGRAPH_SIMPLIFICATION: "paragraphSimplification",
  SPEECH_TO_TEXT: "speechToText",
  SMART_HIGHLIGHTING: "smartHighlighting",
};

/**
 * Per age-group aid availability and default ON/OFF per severity.
 * Structure: { [aidKey]: { available: bool, defaultOn: [severities] } }
 */
export const AGE_GROUP_AID_PROFILES = {
  explorer: {
    [AID_KEYS.TEXT_TO_SPEECH]:         { available: true,  defaultOn: ["mild", "moderate", "severe"] },
    [AID_KEYS.AUDIO_INSTRUCTIONS]:     { available: true,  defaultOn: ["mild", "moderate", "severe"] },
    [AID_KEYS.DYSLEXIA_FONT]:          { available: false, defaultOn: [] },
    [AID_KEYS.READING_RULER]:          { available: false, defaultOn: [] },
    [AID_KEYS.SYLLABLE_BREAKDOWN]:     { available: false, defaultOn: [] },
    [AID_KEYS.GUIDED_READING]:         { available: false, defaultOn: [] },
    [AID_KEYS.SENTENCE_CHUNKING]:      { available: false, defaultOn: [] },
    [AID_KEYS.PREDICTIVE_SPELLING]:    { available: false, defaultOn: [] },
    [AID_KEYS.HIGH_CONTRAST]:          { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.FOCUS_MODE]:             { available: false, defaultOn: [] },
    [AID_KEYS.COMPREHENSION_HINTS]:    { available: false, defaultOn: [] },
    [AID_KEYS.PARAGRAPH_SIMPLIFICATION]:{ available: false, defaultOn: [] },
    [AID_KEYS.SPEECH_TO_TEXT]:         { available: false, defaultOn: [] },
    [AID_KEYS.SMART_HIGHLIGHTING]:     { available: false, defaultOn: [] },
  },

  beginner: {
    [AID_KEYS.TEXT_TO_SPEECH]:         { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.AUDIO_INSTRUCTIONS]:     { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.DYSLEXIA_FONT]:          { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.READING_RULER]:          { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.SYLLABLE_BREAKDOWN]:     { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.GUIDED_READING]:         { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.SENTENCE_CHUNKING]:      { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.PREDICTIVE_SPELLING]:    { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.HIGH_CONTRAST]:          { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.FOCUS_MODE]:             { available: false, defaultOn: [] },
    [AID_KEYS.COMPREHENSION_HINTS]:    { available: false, defaultOn: [] },
    [AID_KEYS.PARAGRAPH_SIMPLIFICATION]:{ available: false, defaultOn: [] },
    [AID_KEYS.SPEECH_TO_TEXT]:         { available: false, defaultOn: [] },
    [AID_KEYS.SMART_HIGHLIGHTING]:     { available: true,  defaultOn: ["mild", "moderate", "severe"] },
  },

  intermediate: {
    [AID_KEYS.TEXT_TO_SPEECH]:         { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.AUDIO_INSTRUCTIONS]:     { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.DYSLEXIA_FONT]:          { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.READING_RULER]:          { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.SYLLABLE_BREAKDOWN]:     { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.GUIDED_READING]:         { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.SENTENCE_CHUNKING]:      { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.PREDICTIVE_SPELLING]:    { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.HIGH_CONTRAST]:          { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.FOCUS_MODE]:             { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.COMPREHENSION_HINTS]:    { available: true,  defaultOn: ["mild", "moderate", "severe"] },
    [AID_KEYS.PARAGRAPH_SIMPLIFICATION]:{ available: true, defaultOn: ["severe"] },
    [AID_KEYS.SPEECH_TO_TEXT]:         { available: false, defaultOn: [] },
    [AID_KEYS.SMART_HIGHLIGHTING]:     { available: true,  defaultOn: ["mild", "moderate", "severe"] },
  },

  advanced: {
    [AID_KEYS.TEXT_TO_SPEECH]:         { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.AUDIO_INSTRUCTIONS]:     { available: false, defaultOn: [] },
    [AID_KEYS.DYSLEXIA_FONT]:          { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.READING_RULER]:          { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.SYLLABLE_BREAKDOWN]:     { available: false, defaultOn: [] },
    [AID_KEYS.GUIDED_READING]:         { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.SENTENCE_CHUNKING]:      { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.PREDICTIVE_SPELLING]:    { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.HIGH_CONTRAST]:          { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.FOCUS_MODE]:             { available: true,  defaultOn: ["moderate", "severe"] },
    [AID_KEYS.COMPREHENSION_HINTS]:    { available: true,  defaultOn: ["mild", "moderate"] },
    [AID_KEYS.PARAGRAPH_SIMPLIFICATION]:{ available: true, defaultOn: ["severe"] },
    [AID_KEYS.SPEECH_TO_TEXT]:         { available: true,  defaultOn: ["severe"] },
    [AID_KEYS.SMART_HIGHLIGHTING]:     { available: true,  defaultOn: ["mild", "moderate", "severe"] },
  },
};

/**
 * Returns a flat aids object: { aidKey: boolean }
 * based on the age group's profile and which aids are default-on for the given severity.
 */
export function buildAidsForProfile(ageGroup, severity) {
  const profile = AGE_GROUP_AID_PROFILES[ageGroup] || AGE_GROUP_AID_PROFILES.beginner;
  const aids = {};
  for (const [key, config] of Object.entries(profile)) {
    aids[key] = config.available && config.defaultOn.includes(severity);
  }
  return aids;
}

/**
 * Returns which aids are available (but not necessarily on) for this age group.
 * Used to show/hide toggle buttons in the AidToolbar.
 */
export function getAvailableAids(ageGroup) {
  const profile = AGE_GROUP_AID_PROFILES[ageGroup] || AGE_GROUP_AID_PROFILES.beginner;
  return Object.entries(profile)
    .filter(([, config]) => config.available)
    .map(([key]) => key);
}
