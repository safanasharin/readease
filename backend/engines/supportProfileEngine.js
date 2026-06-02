const { getRecommendations } = require("./recommendationEngine");

/**
 * Generates a complete intervention/support profile for the child.
 * @param {Object} user - The mongoose user document.
 * @returns {Object} Generated support profile object.
 */
function generateSupportProfile(user) {
  const skillProgress = user.skillProgress || {
    phonologicalAwareness: 0,
    visualProcessing: 0,
    workingMemory: 0,
    attentionControl: 0,
    fineMotorSkills: 0,
    languageComprehension: 0,
  };

  const strengths = [];
  const weakSkills = [];

  for (const [skill, score] of Object.entries(skillProgress)) {
    // Exclude database functions or mongoose properties, only look at strings
    if (typeof score === "number") {
      if (score >= 70) {
        strengths.push(skill);
      } else {
        weakSkills.push(skill);
      }
    }
  }

  // Determine support level from user or fallback to weak skills count
  let supportLevel = user.supportLevel;
  
  if (!supportLevel) {
    if (user.dyslexiaLevel) {
      const dl = user.dyslexiaLevel.toLowerCase();
      if (dl === "severe" || dl === "level3") supportLevel = "intensive_support";
      else if (dl === "moderate" || dl === "level2") supportLevel = "guided_support";
      else supportLevel = "emerging_support";
    } else {
      const weakCount = weakSkills.length;
      if (weakCount >= 4) {
        supportLevel = "intensive_support";
      } else if (weakCount >= 2) {
        supportLevel = "guided_support";
      } else {
        supportLevel = "emerging_support";
      }
    }
  }

  const recommendedActivities = getRecommendations(skillProgress);

  return {
    supportLevel,
    strengths,
    weakSkills,
    recommendedActivities,
  };
}

module.exports = {
  generateSupportProfile,
};
