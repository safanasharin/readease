const ACTIVITY_TO_SKILL = {
  tracing: "fineMotorSkills",
  "sound-matching": "phonologicalAwareness",
  "letter-confusion": "visualProcessing",
  memory: "workingMemory",
  sequencing: "workingMemory",
  sorting: "attentionControl",
  story: "languageComprehension",
  "visual-detective": "visualProcessing",
};

/**
 * Maps an activity ID to its corresponding developmental skill.
 * @param {string} activityId 
 * @returns {string|null} The skill field name or null if not found.
 */
function getSkillForActivity(activityId) {
  if (!activityId) return null;
  // Handle routes or exact names
  const normalized = activityId.toLowerCase().replace("/explorer/activity/", "");
  return ACTIVITY_TO_SKILL[normalized] || null;
}

module.exports = {
  ACTIVITY_TO_SKILL,
  getSkillForActivity,
};
