const express = require("express");
const router = express.Router();
const ChildProgress = require("../models/ChildProgress");

// POST /save
router.post("/save", async (req, res) => {
  try {
    const { userId, activityType, letter, targetLetter, score, attempts, completed, level, matchesFound, totalPairs, shapesSorted, totalShapes, correctSelections, incorrectSelections, accuracy, completionTime } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!activityType) {
      return res.status(400).json({ message: "activityType is required" });
    }

    // Special logic for letter tracing to update existing records instead of duplicating
    if (activityType === "letter_tracing" && letter) {
      const existing = await ChildProgress.findOne({ userId, activityType, letter });
      if (existing) {
        existing.score = Math.max(existing.score, Number(score || 0));
        existing.attempts = existing.attempts + Number(attempts || 1);
        if (completed) existing.completed = true;
        existing.completedAt = new Date();
        await existing.save();
        console.log("Saving Child Progress", req.body);
        return res.status(200).json({ message: "Updated existing letter tracing record", progress: existing });
      }
    }

    // Upsert logic for Age Group 1 story_reading — prevent duplicates per story per user
    if (activityType === "story_reading" && req.body.storyId) {
      const existing = await ChildProgress.findOne({ userId, activityType, storyId: req.body.storyId });
      if (existing) {
        // Story already recorded — update reading time and mark completed
        existing.readingTime = (existing.readingTime || 0) + Number(req.body.readingTime || 0);
        if (completed) existing.completed = true;
        existing.completedAt = new Date();
        await existing.save();
        console.log("[Explorer Story] Updated existing story_reading record for storyId:", req.body.storyId);
        return res.status(200).json({ message: "Updated existing story reading record", progress: existing });
      }
    }


    // Upsert logic for Beginner Activities (1 record per activity per user)
    if (activityType === "reading_practice" || activityType === "vocabulary_builder" || activityType === "word_detective" || activityType === "story_explorer" || activityType === "sentence_builder") {
      const existing = await ChildProgress.findOne({ userId, activityType });
      if (existing) {
        existing.xpEarned = (existing.xpEarned || 0) + Number(req.body.xpEarned || 0);
        existing.bestScore = Math.max(existing.bestScore || 0, Number(req.body.bestScore || req.body.score || 0));
        existing.score = Number(req.body.score || existing.score); // keep latest session score
        existing.currentLevel = req.body.currentLevel || existing.currentLevel;
        existing.attempts = (existing.attempts || 0) + 1;
        existing.lastPlayedAt = new Date();
        
        if (activityType === "reading_practice") {
           existing.accuracy = Math.round(((existing.accuracy || 0) * (existing.attempts - 1) + Number(req.body.accuracy || 0)) / existing.attempts); // Rolling avg
           existing.wordsRead = (existing.wordsRead || 0) + Number(req.body.wordsRead || 0);
           existing.readingTime = (existing.readingTime || 0) + Number(req.body.readingTime || 0);
        }
        
        if (activityType === "vocabulary_builder") {
           existing.wordsLearned = Math.max(existing.wordsLearned || 0, Number(req.body.wordsLearned || 0));
           if (req.body.masteredWords && Array.isArray(req.body.masteredWords)) {
               existing.masteredWords = [...new Set([...(existing.masteredWords || []), ...req.body.masteredWords])];
           }
           if (req.body.completedLevels && Array.isArray(req.body.completedLevels)) {
               existing.completedLevels = [...new Set([...(existing.completedLevels || []), ...req.body.completedLevels])];
           }
        }
        
        if (activityType === "word_detective") {
           existing.wordsRead = (existing.wordsRead || 0) + Number(req.body.wordsRead || 0); // Reused for wordsFound
           if (req.body.accuracy !== undefined) {
               existing.accuracy = Math.round(((existing.accuracy || 0) * (existing.attempts - 1) + Number(req.body.accuracy)) / existing.attempts);
           }
           if (req.body.letter) existing.letter = req.body.letter; // Reused for Weak Words
        }

        if (activityType === "story_explorer") {
           existing.readingTime = (existing.readingTime || 0) + Number(req.body.readingTime || 0);
           if (req.body.accuracy !== undefined) {
               existing.accuracy = Math.round(((existing.accuracy || 0) * (existing.attempts - 1) + Number(req.body.accuracy)) / existing.attempts);
           }
        }

        if (activityType === "sentence_builder") {
           if (req.body.accuracy !== undefined) {
               existing.accuracy = Math.round(((existing.accuracy || 0) * (existing.attempts - 1) + Number(req.body.accuracy)) / existing.attempts);
           }
        }
        
        await existing.save();
        return res.status(200).json({ message: "Updated existing activity record", progress: existing });
      }
    }

    const newActivity = new ChildProgress({
      userId,
      activityType,
      letter: letter || null,
      targetLetter: targetLetter || null,
      score: Number(score || 0),
      attempts: Number(attempts || 1),
      completed: Boolean(completed),
      level: level || undefined,
      matchesFound: matchesFound !== undefined ? Number(matchesFound) : undefined,
      totalPairs: totalPairs !== undefined ? Number(totalPairs) : undefined,
      shapesSorted: shapesSorted !== undefined ? Number(shapesSorted) : undefined,
      totalShapes: totalShapes !== undefined ? Number(totalShapes) : undefined,
      correctSelections: correctSelections !== undefined ? Number(correctSelections) : undefined,
      incorrectSelections: incorrectSelections !== undefined ? Number(incorrectSelections) : undefined,
      accuracy: accuracy !== undefined ? Number(accuracy) : undefined,
      completionTime: completionTime !== undefined ? Number(completionTime) : undefined,
      storyId: req.body.storyId || undefined,
      storyTitle: req.body.storyTitle || undefined,
      storyCategory: req.body.storyCategory || undefined,
      readingTime: req.body.readingTime !== undefined ? Number(req.body.readingTime) : undefined,
      completedAt: new Date(),
    });

    await newActivity.save();
    console.log("Saving Child Progress", req.body);
    return res.status(201).json({ message: "Child progress saved successfully", progress: newActivity });
  } catch (error) {
    console.error("Child Progress Save Error:", error);
    res.status(500).json({ message: "Failed to save child progress" });
  }
});

// GET /user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const progressData = await ChildProgress.find({ userId });
    res.status(200).json({ progress: progressData });
  } catch (error) {
    console.error("Fetch user child progress error:", error);
    res.status(500).json({ message: "Server error fetching child progress" });
  }
});

// GET /summary/:userId
router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await ChildProgress.find({ userId }).sort({ completedAt: -1 });

    const totalActivities = items.filter(i => i.completed).length;
    const totalTimeSpent = items.reduce((acc, i) => acc + (i.completionTime || i.readingTime || 0), 0);

    const getCount = (type) => items.filter(i => i.activityType === type && i.completed).length;

    // 1. Letter Tracing
    const letterTracingItems = items.filter(i => i.activityType === "letter_tracing");
    const letterTracingCompletedItems = letterTracingItems.filter(i => i.completed);
    const letterTracingCompleted = new Set(letterTracingCompletedItems.map(i => i.letter));
    const uppercaseCompleted = Array.from(letterTracingCompleted).filter(l => l && l === l.toUpperCase() && l.match(/[A-Z]/)).length;
    const lowercaseCompleted = Array.from(letterTracingCompleted).filter(l => l && l === l.toLowerCase() && l.match(/[a-z]/)).length;
    const letterTracingBestScore = letterTracingCompletedItems.length > 0 ? Math.max(...letterTracingCompletedItems.map(i => i.bestScore || i.score || 0)) : 0;
    const totalAttempts = letterTracingItems.reduce((acc, i) => acc + (i.attempts || 1), 0);
    
    const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let currentLetter = "A";
    for (const l of ALL_LETTERS) {
      if (!letterTracingCompleted.has(l)) {
        currentLetter = l;
        break;
      }
    }
    
    const letterTracing = {
      completedLetters: Array.from(letterTracingCompleted),
      uppercaseCompleted,
      lowercaseCompleted,
      currentLetter,
      unlockedLetters: letterTracingCompleted.size + 1, // Unlocked includes the current uncompleted one
      bestScore: letterTracingBestScore,
      totalAttempts,
      attempts: totalAttempts // fallback
    };

    // 2. Sound Matching
    const soundItems = items.filter(i => i.activityType === "sound_matching" && i.completed);
    const soundMatching = {
      sessionsPlayed:  soundItems.length,
      // Read correctAnswers first (new field); fall back to correctSelections for old records
      correctAnswers:  soundItems.reduce((acc, i) => acc + (i.correctAnswers || i.correctSelections || 0), 0),
      accuracy:        soundItems.length > 0 ? Math.round(soundItems.reduce((acc, i) => acc + (i.accuracy || 0), 0) / soundItems.length) : 0,
      bestAccuracy:    soundItems.length > 0 ? Math.max(...soundItems.map(i => i.accuracy || 0)) : 0,
      averageAccuracy: soundItems.length > 0 ? Math.round(soundItems.reduce((acc, i) => acc + (i.accuracy || 0), 0) / soundItems.length) : 0,
    };


    // 3. Memory Game
    const memoryItems = items.filter(i => i.activityType === "memory_game" && i.completed);
    const memoryGame = {
      levelsCompleted: memoryItems.length,
      matchesFound: memoryItems.reduce((acc, i) => acc + (i.matchesFound || 0), 0),
      bestScore: memoryItems.length > 0 ? Math.max(...memoryItems.map(i => i.score || 0)) : 0,
      averageAccuracy: memoryItems.length > 0 ? Math.round(memoryItems.reduce((acc, i) => acc + (i.accuracy || 0), 0) / memoryItems.length) : 0,
    };

    // 4. Shape Sorting
    const sortingItems = items.filter(i => i.activityType === "shape_sorting" && i.completed);
    const shapeSorting = {
      shapesSorted: sortingItems.reduce((acc, i) => acc + (i.shapesSorted || 0), 0),
      correctPlacements: sortingItems.reduce((acc, i) => acc + (i.correctSelections || 0), 0),
      accuracy: sortingItems.length > 0 ? Math.round(sortingItems.reduce((acc, i) => acc + (i.accuracy || 0), 0) / sortingItems.length) : 0,
      bestSession: sortingItems.length > 0 ? Math.max(...sortingItems.map(i => i.accuracy || 0)) : 0,
    };

    // 5. Story Reading
    const storyItems = items.filter(i => i.activityType === "story_reading" && i.completed);

    // De-duplicate by storyId: keep only the latest record per unique story.
    // This guarantees storiesCompleted = number of DISTINCT stories, never
    // inflated by repeated saves or reruns of the same story.
    const uniqueStoriesMap = new Map();
    storyItems.forEach(i => {
      const key = i.storyId ? String(i.storyId) : i.storyTitle || "unknown";
      if (!uniqueStoriesMap.has(key)) {
        uniqueStoriesMap.set(key, i); // items are already sorted newest-first
      }
    });
    const uniqueStoryItems = Array.from(uniqueStoriesMap.values());

    const categoryCounts = {};
    let favoriteCategory = "None";
    let maxCategoryCount = 0;
    uniqueStoryItems.forEach(i => {
      if (i.storyCategory) {
        categoryCounts[i.storyCategory] = (categoryCounts[i.storyCategory] || 0) + 1;
        if (categoryCounts[i.storyCategory] > maxCategoryCount) {
          maxCategoryCount = categoryCounts[i.storyCategory];
          favoriteCategory = i.storyCategory;
        }
      }
    });
    const storyReading = {
      storiesCompleted: uniqueStoryItems.length,                                              // ← unique count
      totalReadingTime: uniqueStoryItems.reduce((acc, i) => acc + (i.readingTime || 0), 0),  // ← de-duplicated
      favoriteCategory,
      lastStoryRead: uniqueStoryItems.length > 0 ? uniqueStoryItems[0].storyTitle : "None"
    };


    // 6. Letter Detective
    const detectiveItems = items.filter(i => i.activityType === "letter_detection" && i.completed);
    const letterDetective = {
      lettersFound: detectiveItems.reduce((acc, i) => acc + (i.correctSelections || 0), 0),
      correctIdentifications: detectiveItems.reduce((acc, i) => acc + (i.correctSelections || 0), 0),
      accuracy: detectiveItems.length > 0 ? Math.round(detectiveItems.reduce((acc, i) => acc + (i.accuracy || 0), 0) / detectiveItems.length) : 0,
      bestScore: detectiveItems.length > 0 ? Math.max(...detectiveItems.map(i => i.score || 0)) : 0,
    };

    // 7. Sequencing
    const sequencingItems = items.filter(i => i.activityType === "sequencing" && i.completed);
    const sequencing = {
      sequencesSolved: sequencingItems.length,
      bestAccuracy: sequencingItems.length > 0 ? Math.max(...sequencingItems.map(i => i.accuracy || 0)) : 0,
      averageScore: sequencingItems.length > 0 ? Math.round(sequencingItems.reduce((acc, i) => acc + (i.score || 0), 0) / sequencingItems.length) : 0,
    };

    // 8. Visual Detective
    const visualItems = items.filter(i => i.activityType === "visual_detective" && i.completed);
    const visualDetective = {
      mysteriesSolved: visualItems.length,
      cluesFound: visualItems.reduce((acc, i) => acc + (i.correctSelections || 0), 0),
      accuracy: visualItems.length > 0 ? Math.round(visualItems.reduce((acc, i) => acc + (i.accuracy || 0), 0) / visualItems.length) : 0,
      bestSession: visualItems.length > 0 ? Math.max(...visualItems.map(i => i.accuracy || 0)) : 0,
    };

    // Overall Completion Calculation (Explorer Age Group 1)
    const completedModules =
      (letterTracing.completedLetters.length > 0 ? 1 : 0) +
      (soundMatching.sessionsPlayed   > 0 ? 1 : 0) +
      (memoryGame.levelsCompleted     > 0 ? 1 : 0) +
      (shapeSorting.shapesSorted      > 0 ? 1 : 0) +
      (storyReading.storiesCompleted  > 0 ? 1 : 0) +
      (letterDetective.lettersFound   > 0 ? 1 : 0) +
      (sequencing.sequencesSolved     > 0 ? 1 : 0) +
      (visualDetective.mysteriesSolved > 0 ? 1 : 0);

    const overallCompletion = Math.round((completedModules / 8) * 100);

    // Beginner Activities Data Extraction (Since they are 1 record per user)
    const readingPracticeItem = items.find(i => i.activityType === "reading_practice") || {};
    const vocabularyItem = items.find(i => i.activityType === "vocabulary_builder") || {};
    const wordDetectiveItem = items.find(i => i.activityType === "word_detective") || {};
    const storyExplorerItem = items.find(i => i.activityType === "story_explorer") || {};
    const sentenceBuilderItem = items.find(i => i.activityType === "sentence_builder") || {};

    const averageScore = readingPracticeItem.accuracy || 0;
    const wordsRead = readingPracticeItem.wordsRead || 0;
    const completedSessions = readingPracticeItem.attempts || 0;
    const currentReadingLevel = readingPracticeItem.currentLevel || 1;

    const vocabularyData = {
      wordsLearned: vocabularyItem.wordsLearned || 0,
      masteredWords: vocabularyItem.masteredWords?.length || 0,
      accuracy: vocabularyItem.accuracy || 0,
      currentLevel: vocabularyItem.currentLevel || 1,
    };

    const wordDetectiveData = {
      attempted: wordDetectiveItem.attempts || 0,
      correct: wordDetectiveItem.wordsRead || 0, // In word detective, wordsRead is reused for correct answers
      accuracy: wordDetectiveItem.accuracy || 0,
      currentLevel: wordDetectiveItem.currentLevel || 1,
    };

    const completedStoriesCount = storyExplorerItem.attempts || 0;
    const storyExplorerTotalTime = storyExplorerItem.readingTime || 0;
    const storyCompletionPercentage = storyExplorerItem.accuracy || 0; // Comprehension accuracy

    const sentenceAdventureData = {
      completed: sentenceBuilderItem.attempts || 0,
      voiceAccuracy: sentenceBuilderItem.accuracy || 0,
      xp: sentenceBuilderItem.xpEarned || 0,
      currentLevel: sentenceBuilderItem.currentLevel || 1,
    };

    const totalXP = (readingPracticeItem.xpEarned || 0) +
                    (vocabularyItem.xpEarned || 0) +
                    (wordDetectiveItem.xpEarned || 0) +
                    (storyExplorerItem.xpEarned || 0) +
                    (sentenceBuilderItem.xpEarned || 0);

    const recentActivities = items.slice(0, 5).map(item => ({
      activityType: item.activityType,
      letter: item.letter,
      score: item.score,
      accuracy: item.accuracy,
      storyTitle: item.storyTitle,
      date: item.completedAt
    }));

    const summary = {
      totalActivities,
      overallCompletion,
      totalTimeSpent,
      
      // Explorer Age Group 1 metrics
      letterTracing,
      soundMatching,
      memoryGame,
      shapeSorting,
      storyReading,
      letterDetective,
      sequencing,
      visualDetective,
      
      // Beginner Age Group 2 metrics
      averageScore,
      wordsRead,
      completedSessions,
      currentReadingLevel,
      vocabularyData,
      wordDetectiveData,
      completedStoriesCount,
      storyExplorerTotalTime,
      storyCompletionPercentage,
      sentenceAdventureData,
      totalXP,
      
      recentActivities,
      
      // Weekly Progress Chart Data
      weeklyProgress: Array.from({length: 7}).map((_, i) => {
         const date = new Date();
         date.setDate(date.getDate() - (6 - i));
         const dateStr = date.toISOString().split('T')[0];
         const dayItems = items.filter(item => new Date(item.completedAt).toISOString().split('T')[0] === dateStr);
         return {
            date: dateStr,
            activitiesCompleted: dayItems.filter(item => item.completed).length,
            timeSpent: dayItems.reduce((acc, item) => acc + (item.completionTime || item.readingTime || 0), 0),
            accuracy: dayItems.length > 0 ? Math.round(dayItems.reduce((acc, item) => acc + (item.accuracy || 0), 0) / dayItems.length) : 0
         };
      })
    };
    
    console.log("Returning Summary", summary);
    return res.status(200).json(summary);
  } catch (error) {
    console.error("Child Progress Summary Error:", error);
    res.status(500).json({ message: "Server error fetching child summary" });
  }
});

module.exports = router;
