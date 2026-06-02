const assessmentWeights = require('./assessmentWeights');
const speedMultipliers = require('./speedMultipliers');

/**
 * Calculate severity and custom cognitive indicators based on user answers.
 * @param {Array} answers - array of { questionId, selectedOption, responseTimeMs }
 * @param {Array} allQuestions - full list of question objects (including points, correctAnswer, category, metadata)
 * @returns {Object} { score, dyslexiaLevel, weakAreas, categoryBreakdown, metrics, recommendations }
 */
function calculateSeverity(answers, allQuestions) {
  let weightedEarned = 0;
  let weightedPossible = 0;
  const categoryStats = {};

  // Cognitive metrics trackers
  let reversalMistakesCount = 0;
  let spellingConfusionCount = 0;
  let skippedQuestionsCount = 0;
  let hesitationCount = 0;
  
  let memoryPossible = 0;
  let memoryEarned = 0;

  let readingTimeTotal = 0;
  let readingCount = 0;

  answers.forEach(ans => {
    const q = allQuestions.find(item => item.id === ans.questionId);
    if (!q) return;

    const weight = assessmentWeights[q.category] || 0.1;
    const speedMultiplier = speedMultipliers[q.category] || 1;
    const possible = q.points * weight * speedMultiplier;
    
    const isCorrect = ans.selectedOption === q.correctAnswer;
    const isSkipped = !ans.selectedOption || ans.selectedOption === "" || ans.selectedOption === "Skip";
    
    const earned = isCorrect ? possible : 0;
    
    weightedEarned += earned;
    weightedPossible += possible;

    // Track category level stats
    if (!categoryStats[q.category]) {
      categoryStats[q.category] = { earned: 0, possible: 0 };
    }
    categoryStats[q.category].earned += earned;
    categoryStats[q.category].possible += possible;

    // 1. Reversal mistakes
    const reversalCategories = ['letter_confusion', 'word_reversal', 'confusion_detection'];
    if (reversalCategories.includes(q.category) && !isCorrect && !isSkipped) {
      reversalMistakesCount++;
    }

    // 2. Spelling confusion
    const spellingCategories = ['missing_letters', 'spelling_correction', 'word_scramble', 'grammar_tracking', 'grammar_correction'];
    if (spellingCategories.includes(q.category) && !isCorrect && !isSkipped) {
      spellingConfusionCount++;
    }

    // 3. Memory accuracy tracking
    const memoryCategories = ['memory_games', 'memory_sequencing', 'logical_sequencing'];
    if (memoryCategories.includes(q.category)) {
      memoryPossible += q.points;
      if (isCorrect) memoryEarned += q.points;
    }

    // 4. Reading speed tracking (average reading response time in seconds)
    const readingCategories = ['reading_speed', 'reading_speed_tracking', 'paragraph_reading', 'comprehension_passages', 'timed_reading'];
    if (readingCategories.includes(q.category) && !isSkipped) {
      readingTimeTotal += (ans.responseTimeMs || 0);
      readingCount++;
    }

    // 5. Hesitation tracking (> 8 seconds or 85% of time limit)
    const timeLimit = q.metadata?.responseTimeLimitMs || 10000;
    if ((ans.responseTimeMs > 8000 || ans.responseTimeMs > (timeLimit * 0.85)) && !isSkipped) {
      hesitationCount++;
    }

    // 6. Skipped questions
    if (isSkipped) {
      skippedQuestionsCount++;
    }
  });

  const rawScore = weightedPossible === 0 ? 0 : (weightedEarned / weightedPossible) * 100;
  const score = Math.round(rawScore * 100) / 100;

  // Generate dyslexia level (risk level)
  // Higher score means LOWER dyslexia risk, so we map:
  // score >= 80 -> Mild (or Typical/Low risk)
  // score >= 50 -> Moderate
  // score < 50  -> Severe
  let dyslexiaLevel = 'Severe';
  if (score >= 80) dyslexiaLevel = 'Mild';
  else if (score >= 50) dyslexiaLevel = 'Moderate';

  // Category breakdown and weak areas
  const weakAreas = [];
  const categoryBreakdown = {};
  for (const [cat, stats] of Object.entries(categoryStats)) {
    const catScore = stats.possible === 0 ? 0 : (stats.earned / stats.possible) * 100;
    categoryBreakdown[cat] = Math.round(catScore * 100) / 100;
    if (catScore < 50) {
      weakAreas.push(cat);
    }
  }

  // Calculate memory accuracy
  const memoryAccuracyPercentage = memoryPossible === 0 ? 100 : Math.round((memoryEarned / memoryPossible) * 100);

  // Calculate average reading time in seconds
  const readingSpeedSeconds = readingCount === 0 ? 0 : Math.round((readingTimeTotal / readingCount) / 100) / 10;

  const metrics = {
    reversalMistakesCount,
    spellingConfusionCount,
    memoryAccuracyPercentage,
    readingSpeedSeconds,
    hesitationCount,
    skippedQuestionsCount
  };

  // Generate personalized recommendations
  const recommendations = [];
  if (reversalMistakesCount > 1) {
    recommendations.push("Use the visual Reading Ruler and enable the OpenDyslexic font to help track letters like 'b', 'd', 'p', and 'q'.");
  }
  if (spellingConfusionCount > 1) {
    recommendations.push("Practice spelling building blocks and letter word scrambles under our reading training center.");
  }
  if (memoryAccuracyPercentage < 60) {
    recommendations.push("Try memory pattern matching and sequence card games to boost sound and pattern recall.");
  }
  if (readingSpeedSeconds > 10) {
    recommendations.push("Engage with guided audio stories, adjust text sizes, and increase spacing for a comfortable reading rate.");
  }
  if (hesitationCount > 2) {
    recommendations.push("Take breaks between reading exercises and practice voice recognition helper cards to lower visual pressure.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Maintain a steady 5-minute daily reading practice using bionic text settings to build long-term fluency.");
  }

  return {
    score,
    dyslexiaLevel,
    weakAreas,
    categoryBreakdown,
    metrics,
    recommendations
  };
}

module.exports = { calculateSeverity };
