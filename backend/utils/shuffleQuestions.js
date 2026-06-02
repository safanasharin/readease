/**
 * Fisher–Yates shuffle – in‑place randomisation.
 * Returns a new shuffled copy to avoid side‑effects.
 * @param {Array} array - source array
 * @returns {Array} shuffled array copy
 */
function shuffleArray(array) {
  const result = array.slice(); // shallow copy
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

module.exports = { shuffleArray };
