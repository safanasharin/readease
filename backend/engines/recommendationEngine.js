/**
 * Recommends activities based on skill progress thresholds.
 * @param {Object} skillProgress 
 * @returns {Array<string>} List of recommended activity IDs.
 */
function getRecommendations(skillProgress = {}) {
  const recommendations = new Set();

  const {
    phonologicalAwareness = 0,
    visualProcessing = 0,
    workingMemory = 0,
    attentionControl = 0,
    fineMotorSkills = 0,
    languageComprehension = 0,
  } = skillProgress;

  if (phonologicalAwareness < 70) {
    recommendations.add("sound-matching");
  }
  if (visualProcessing < 70) {
    recommendations.add("visual-detective");
    recommendations.add("letter-confusion");
  }
  if (workingMemory < 70) {
    recommendations.add("memory");
    recommendations.add("sequencing");
  }
  if (languageComprehension < 70) {
    recommendations.add("story");
  }
  if (fineMotorSkills < 70) {
    recommendations.add("tracing");
  }
  if (attentionControl < 70) {
    recommendations.add("sorting");
  }

  // Fallbacks if child is doing well across all categories to keep it interesting
  if (recommendations.size === 0) {
    return ["tracing", "sound-matching", "story"];
  }

  return Array.from(recommendations);
}

module.exports = {
  getRecommendations,
};
