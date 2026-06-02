const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { generateSupportProfile } = require('../engines/supportProfileEngine');
const { getSkillForActivity } = require('../engines/skillMapper');
const { getSessionLimit, shouldResetSession, isSessionLimitReached } = require('../engines/sessionManager');

const router = express.Router();
router.use(auth);

// POST /api/engine/reward — award XP, stars, badge after activity completion
router.post('/reward', async (req, res) => {
  try {
    const { activityId, xpEarned = 10, starsEarned = 1, badge = null, analytics = {} } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Calculate duration in minutes from completionTime
    let durationMinutes = 2; // Default baseline if not provided
    if (analytics.completionTime) {
      if (analytics.completionTime > 1000) {
        durationMinutes = analytics.completionTime / 60000;
      } else {
        durationMinutes = analytics.completionTime / 60;
      }
    } else if (analytics.listeningTime) {
      durationMinutes = analytics.listeningTime > 1000 ? analytics.listeningTime / 60000 : analytics.listeningTime / 60;
    } else if (analytics.scanTime) {
      durationMinutes = analytics.scanTime > 1000 ? analytics.scanTime / 60000 : analytics.scanTime / 60;
    }
    durationMinutes = Math.round(durationMinutes * 10) / 10; // Round to 1 decimal place

    // 2. Reset dailySession if it's a new day
    let dailySession = user.dailySession || { totalMinutes: 0, completedActivities: 0, lastPlayed: null };
    if (shouldResetSession(dailySession.lastPlayed)) {
      dailySession = { totalMinutes: 0, completedActivities: 0, lastPlayed: null };
    }

    // 3. Update daily session progress
    dailySession.totalMinutes += durationMinutes;
    dailySession.completedActivities += 1;
    dailySession.lastPlayed = new Date();
    user.dailySession = dailySession;

    // 4. Update learningAnalytics average accuracies
    const prevAnalytics = user.learningAnalytics || {
      tracingAccuracy: 0,
      soundRecognitionAccuracy: 0,
      reversalMistakes: 0,
      memoryAccuracy: 0,
      visualAccuracy: 0,
      comprehensionAccuracy: 0,
      attentionConsistency: 0
    };

    const newAnalyticsObj = { ...prevAnalytics };
    const act = activityId.toLowerCase().replace("/explorer/activity/", "");

    if (act === "tracing") {
      newAnalyticsObj.tracingAccuracy = prevAnalytics.tracingAccuracy === 0 
        ? (analytics.tracingAccuracy || 0) 
        : Math.round((prevAnalytics.tracingAccuracy + (analytics.tracingAccuracy || 0)) / 2);
    } else if (act === "sound-matching" || act === "rhyming") {
      const acc = analytics.soundRecognitionAccuracy !== undefined ? analytics.soundRecognitionAccuracy : (analytics.accuracy || 0);
      newAnalyticsObj.soundRecognitionAccuracy = prevAnalytics.soundRecognitionAccuracy === 0 
        ? acc 
        : Math.round((prevAnalytics.soundRecognitionAccuracy + acc) / 2);
    } else if (act === "letter-confusion") {
      newAnalyticsObj.reversalMistakes += (analytics.reversalMistakes || 0);
      const visualAcc = analytics.accuracy || 100;
      newAnalyticsObj.visualAccuracy = prevAnalytics.visualAccuracy === 0 
        ? visualAcc 
        : Math.round((prevAnalytics.visualAccuracy + visualAcc) / 2);
    } else if (act === "memory" || act === "sequencing") {
      const memAcc = analytics.memoryAccuracy || analytics.sequenceAccuracy || analytics.accuracy || 0;
      newAnalyticsObj.memoryAccuracy = prevAnalytics.memoryAccuracy === 0 
        ? memAcc 
        : Math.round((prevAnalytics.memoryAccuracy + memAcc) / 2);
    } else if (act === "sorting") {
      const sortAcc = analytics.sortingAccuracy || analytics.accuracy || 0;
      newAnalyticsObj.attentionConsistency = prevAnalytics.attentionConsistency === 0 
        ? sortAcc 
        : Math.round((prevAnalytics.attentionConsistency + sortAcc) / 2);
    } else if (act === "story") {
      const compAcc = analytics.comprehensionAccuracy || analytics.accuracy || 0;
      newAnalyticsObj.comprehensionAccuracy = prevAnalytics.comprehensionAccuracy === 0 
        ? compAcc 
        : Math.round((prevAnalytics.comprehensionAccuracy + compAcc) / 2);
    } else if (act === "visual-detective") {
      const visAcc = analytics.visualAccuracy || analytics.accuracy || 0;
      newAnalyticsObj.visualAccuracy = prevAnalytics.visualAccuracy === 0 
        ? visAcc 
        : Math.round((prevAnalytics.visualAccuracy + visAcc) / 2);
    }
    user.learningAnalytics = newAnalyticsObj;

    // 5. Update skillProgress using skillMapper
    const skillName = getSkillForActivity(activityId);
    if (skillName && user.skillProgress) {
      let currentScore = analytics.accuracy || 0;
      if (act === "tracing") currentScore = analytics.tracingAccuracy || 0;
      else if (act === "sound-matching") currentScore = analytics.soundRecognitionAccuracy || 0;
      else if (act === "memory") currentScore = analytics.memoryAccuracy || 0;
      else if (act === "sequencing") currentScore = analytics.sequenceAccuracy || 0;
      else if (act === "sorting") currentScore = analytics.sortingAccuracy || 0;
      else if (act === "story") currentScore = analytics.comprehensionAccuracy || 0;
      else if (act === "visual-detective") currentScore = analytics.visualAccuracy || 0;

      const prevSkillScore = user.skillProgress[skillName] || 0;
      user.skillProgress[skillName] = prevSkillScore === 0
        ? currentScore
        : Math.round((prevSkillScore + currentScore) / 2);
    }

    // 6. Update support profile and recommendations
    user.supportProfile = generateSupportProfile(user);
    user.recommendedActivities = user.supportProfile.recommendedActivities || [];

    // 7. Badge milestones evaluation
    const countActivity = (type) => {
      return (user.exerciseHistory || []).filter(e => {
        const norm = e.activityId.toLowerCase().replace("/explorer/activity/", "");
        return norm === type;
      }).length + (act === type ? 1 : 0);
    };

    let earnedBadge = badge;
    if (act === "tracing" && countActivity("tracing") >= 3 && !user.gamification.badges.includes("Alphabet Explorer")) {
      earnedBadge = "Alphabet Explorer";
    } else if ((act === "sound-matching" || act === "rhyming") && countActivity("sound-matching") >= 3 && !user.gamification.badges.includes("Sound Superstar")) {
      earnedBadge = "Sound Superstar";
    } else if (act === "memory" && countActivity("memory") >= 3 && !user.gamification.badges.includes("Memory Master")) {
      earnedBadge = "Memory Master";
    } else if (act === "story" && countActivity("story") >= 3 && !user.gamification.badges.includes("Story Hero")) {
      earnedBadge = "Story Hero";
    } else if (act === "visual-detective" && countActivity("visual-detective") >= 3 && !user.gamification.badges.includes("Visual Detective")) {
      earnedBadge = "Visual Detective";
    } else if (act === "sorting" && countActivity("sorting") >= 3 && !user.gamification.badges.includes("Sorting Champion")) {
      earnedBadge = "Sorting Champion";
    }

    if (earnedBadge && !user.gamification.badges.includes(earnedBadge)) {
      user.gamification.badges.push(earnedBadge);
    }

    // 8. Update general XP and Stars in Mongoose
    user.gamification.totalXP = (user.gamification.totalXP || 0) + xpEarned;
    user.gamification.totalStars = (user.gamification.totalStars || 0) + starsEarned;
    user.gamification.lastActivityDate = new Date();

    const historyEntry = {
      activityId,
      xpEarned,
      starsEarned,
      badge: earnedBadge,
      analytics,
      completedAt: new Date()
    };
    user.exerciseHistory.push(historyEntry);

    // Compute level: every 100 XP = 1 level
    const newLevel = Math.floor((user.gamification.totalXP || 0) / 100) + 1;
    user.gamification.level = newLevel;

    // Mark modified for nested sub-documents
    user.markModified('gamification');
    user.markModified('dailySession');
    user.markModified('skillProgress');
    user.markModified('supportProfile');
    user.markModified('learningAnalytics');

    await user.save();

    return res.status(200).json({
      message: 'Reward and analytics saved successfully',
      gamification: user.gamification,
      dailySession: user.dailySession,
      learningAnalytics: user.learningAnalytics,
      skillProgress: user.skillProgress,
      supportProfile: user.supportProfile,
      earnedBadge: earnedBadge
    });
  } catch (err) {
    console.error('Engine reward error:', err);
    return res.status(500).json({ message: 'Server error saving reward' });
  }
});

// GET /api/engine/journey — get today's personalized learning journey
router.get('/journey', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Support Level Mapping
    const journeyMap = {
      emerging_support: ['story', 'sound-matching', 'sorting'],
      guided_support: ['letter-confusion', 'sound-matching', 'memory', 'story'],
      intensive_support: ['tracing', 'sound-matching', 'memory', 'story'],
    };

    // Fallback if support level is not initialized yet
    let sLevel = user.supportLevel || "emerging_support";
    if (sLevel === "level1") sLevel = "emerging_support";
    if (sLevel === "level2") sLevel = "guided_support";
    if (sLevel === "level3") sLevel = "intensive_support";

    const journey = journeyMap[sLevel] || ['story', 'sound-matching', 'sorting'];

    // 2. Manage daily session reset
    let dailySession = user.dailySession || { totalMinutes: 0, completedActivities: 0, lastPlayed: null };
    if (shouldResetSession(dailySession.lastPlayed)) {
      dailySession = { totalMinutes: 0, completedActivities: 0, lastPlayed: null };
      user.dailySession = dailySession;
      await user.save();
    }

    // 3. Calculate completed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const completedTodayList = (user.exerciseHistory || [])
      .filter(e => new Date(e.completedAt) >= todayStart)
      .map(e => e.activityId.toLowerCase().replace("/explorer/activity/", ""));

    return res.status(200).json({
      journey,
      completedToday: completedTodayList,
      gamification: user.gamification || {},
      dailySession,
      supportLevel: sLevel,
      skillProgress: user.skillProgress || {},
      supportProfile: user.supportProfile || {}
    });
  } catch (err) {
    console.error('Engine journey error:', err);
    return res.status(500).json({ message: 'Server error fetching journey' });
  }
});

// GET /api/engine/progress — full gamification stats
router.get('/progress', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      gamification: user.gamification || {},
      totalActivitiesCompleted: (user.exerciseHistory || []).length,
    });
  } catch (err) {
    console.error('Engine progress error:', err);
    return res.status(500).json({ message: 'Server error fetching progress' });
  }
});

module.exports = router;
