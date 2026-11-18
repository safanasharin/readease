const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const AssessmentSession = require('../models/AssessmentSession');
const User = require('../models/User');
const { loadQuestions } = require('../utils/loadAssessments');
const { calculateSeverity } = require('../utils/calculateSeverity');
const { generateSupportProfile } = require('../engines/supportProfileEngine');
const path = require('path');
const fs = require('fs');

const router = express.Router();
router.use(auth);

/**
 * Helper to load full question set (including correctAnswer) for a given ageGroup.
 */
function loadFullQuestions(ageGroup) {
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
  return data.questions;
}

// ----------------------------------------------------------
// GET /api/assessment/start
// ----------------------------------------------------------
router.get('/start', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.screeningCompleted) {
      // User already completed screening, redirect to dashboard
      return res.status(200).json({ redirectPath: `/dashboard/${user.riskLevel || 'level1'}` });
    }

    const rawAgeGroup = user.ageGroup;
    if (!rawAgeGroup) return res.status(400).json({ message: 'User ageGroup not set' });
    const ageGroup = rawAgeGroup.toLowerCase();

    // Load sanitized questions for the frontend
    const questions = loadQuestions(ageGroup);

    // Create a new assessment session document
    const session = new AssessmentSession({
      user: userId,
      ageGroup,
    });
    await session.save();

    return res.status(200).json({
      ageGroup,
      sessionId: session._id,
      questions,
    });
  } catch (err) {
    console.error('Assessment start error:', err);
    return res.status(500).json({ message: 'Server error while starting assessment' });
  }
});

// ----------------------------------------------------------
// POST /api/assessment/submit
// ----------------------------------------------------------
router.post('/submit', async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    if (!sessionId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'sessionId and answers are required' });
    }

    const session = await AssessmentSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Assessment session not found' });
    if (String(session.user) !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this session' });
    }

    // Load the full question list (including correctAnswer) for scoring
    const fullQuestions = loadFullQuestions(session.ageGroup);

    // Calculate severity and analytics
    const result = calculateSeverity(answers, fullQuestions, session.ageGroup);

    let riskLevel = "level1";
    if (result.dyslexiaLevel.toLowerCase() === "moderate") riskLevel = "level2";
    if (result.dyslexiaLevel.toLowerCase() === "severe") riskLevel = "level3";

    // Update session
    session.answers = answers;
    session.weightedScore = result.score;
    session.completed = true;
    session.endTime = new Date();
    await session.save();

    // Update user profile
    // Derive sub-scores from category breakdown
    const cb = result.categoryBreakdown || {};
    const readingCategories = ['reading_speed', 'reading_speed_tracking', 'paragraph_reading', 'comprehension_passages', 'timed_reading', 'simple_word_reading', 'simple_sentence_recognition'];
    const writingCategories = ['missing_letters', 'spelling_correction', 'grammar_tracking', 'grammar_correction'];
    const phonicsCategories = ['phonics', 'rhyming', 'sound_matching', 'letter_confusion', 'audio_word_matching', 'rhyming_words'];
    
    const avgCat = (cats) => {
      const scores = cats.map(c => cb[c]).filter(s => s !== undefined);
      return scores.length === 0 ? 0 : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    };
    
    const readingScore = avgCat(readingCategories);
    const writingScore = avgCat(writingCategories);
    const phonicsScore = avgCat(phonicsCategories);

    // Derive strengths (categories >= 70%) and weaknesses (categories < 50%)
    const strengths = [];
    const weaknesses = [];
    for (const [cat, catScore] of Object.entries(cb)) {
      if (catScore >= 70) strengths.push(cat);
      if (catScore < 50) weaknesses.push(cat);
    }

    // Generate intervention plan
    const interventionPlan = {
      level: result.dyslexiaLevel,
      focusAreas: result.weakAreas || [],
      dailyGoalMinutes: result.dyslexiaLevel.toLowerCase() === 'severe' ? 40 : result.dyslexiaLevel.toLowerCase() === 'moderate' ? 30 : 20,
      strategies: result.recommendations || [],
      createdAt: new Date(),
    };

    let supportLevel = "emerging_support";
    if (result.dyslexiaLevel.toLowerCase() === "moderate") supportLevel = "guided_support";
    if (result.dyslexiaLevel.toLowerCase() === "severe") supportLevel = "intensive_support";

    const initialSkillProgress = {
      phonologicalAwareness: phonicsScore || 50,
      visualProcessing: Math.round((phonicsScore + writingScore) / 2) || 50,
      workingMemory: Math.round((readingScore + writingScore) / 2) || 50,
      attentionControl: 60,
      fineMotorSkills: writingScore || 50,
      languageComprehension: readingScore || 50,
    };

    // Generate initial support profile using supportProfileEngine
    const tempUser = {
      supportLevel,
      skillProgress: initialSkillProgress,
      dyslexiaLevel: result.dyslexiaLevel,
    };
    const supportProfile = generateSupportProfile(tempUser);

    const update = {
      hasCompletedAssessment: true,
      assessmentCompleted: true,
      assessmentStatus: "completed",
      assessmentScore: result.score,
      dyslexiaLevel: result.dyslexiaLevel,
      riskLevel,
      supportLevel,
      skillProgress: initialSkillProgress,
      supportProfile,
      assessmentAnalytics: result,
      screeningCompleted: true,
      assessmentCompletedAt: new Date(),
      assessmentDate: new Date(),
      readingScore,
      writingScore,
      phonicsScore,
      strengths,
      weaknesses,
      recommendedActivities: supportProfile.recommendedActivities || [],
      interventionPlan,
    };
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true }).select('-password');

    // Push to assessment history for trend analysis
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        assessmentHistory: {
          date: new Date(),
          score: result.score,
          dyslexiaLevel: result.dyslexiaLevel,
          weakAreas: result.weakAreas || [],
        }
      }
    });

    const redirectPath = `/dashboard/${riskLevel}`;

    return res.status(200).json({
      score: result.score,
      dyslexiaLevel: result.dyslexiaLevel,
      weakAreas: result.weakAreas,
      metrics: result.metrics,
      recommendations: result.recommendations,
      redirectPath,
      readingScore,
      writingScore,
      phonicsScore,
      strengths,
      weaknesses,
      interventionPlan,
      assessmentDate: update.assessmentDate,
    });
  } catch (err) {
    console.error('Assessment submit error:', err);
    return res.status(500).json({ message: 'Server error while submitting assessment' });
  }
});

module.exports = router;
