const fs = require('fs');
const path = require('path');

/**
 * Load questions for a given age group, strip correctAnswer, shuffle order of questions and options.
 * @param {string} ageGroup - 'Beginner' | 'Intermediate' | 'Advanced'
 * @returns {Array} array of question objects ready for the frontend
 */
function loadQuestions(ageGroup) {
  const normalized = ageGroup ? ageGroup.toLowerCase() : 'beginner';
  const fileMap = {
    explorer: 'explorer.json',
    beginner: 'beginner.json',
    intermediate: 'intermediate.json',
    advanced: 'advanced.json',
  };
  const fileName = fileMap[normalized];
  if (!fileName) throw new Error('Invalid age group');
  const filePath = path.join(__dirname, '..', 'data', 'assessments', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  const questions = data.questions.map(q => {
    // Remove correctAnswer for security
    const { correctAnswer, ...rest } = q;
    // Shuffle options
    const shuffled = [...q.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return { ...rest, options: shuffled };
  });
  // Shuffle question order
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions;
}

module.exports = { loadQuestions };
