/**
 * Gets the daily session time limit in minutes for each support level.
 * @param {string} supportLevel 
 * @returns {number} Time limit in minutes.
 */
function getSessionLimit(supportLevel) {
  switch (supportLevel) {
    case "intensive_support":
      return 10;
    case "guided_support":
      return 15;
    case "emerging_support":
    default:
      return 20;
  }
}

/**
 * Checks if the user's daily session should be reset (if it's a new day).
 * @param {Date} lastPlayed 
 * @returns {boolean} True if a reset is required.
 */
function shouldResetSession(lastPlayed) {
  if (!lastPlayed) return false;
  
  const today = new Date();
  const playedDate = new Date(lastPlayed);
  
  return (
    today.getFullYear() !== playedDate.getFullYear() ||
    today.getMonth() !== playedDate.getMonth() ||
    today.getDate() !== playedDate.getDate()
  );
}

/**
 * Helper to check if a user has hit their daily session limit.
 * @param {Object} user 
 * @returns {boolean} True if the session limit is reached.
 */
function isSessionLimitReached(user) {
  if (!user || !user.dailySession) return false;
  
  // Check if session needs resetting first
  if (shouldResetSession(user.dailySession.lastPlayed)) {
    return false;
  }
  
  const limit = getSessionLimit(user.supportLevel || "emerging_support");
  return user.dailySession.totalMinutes >= limit;
}

module.exports = {
  getSessionLimit,
  shouldResetSession,
  isSessionLimitReached,
};
