const express = require("express");
const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

// SAVE PROGRESS
router.post("/save", async (req, res) => {
  try {
    const {
      userId,
      storyId,
      storyTitle,
      readingTime,
      completed,
      score,
      activityType,
      contentSource,
      date,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (storyId && !mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ message: "Invalid storyId" });
    }

    if (!activityType || !["reader", "voice-practice"].includes(activityType)) {
      return res.status(400).json({
        message: "activityType must be 'reader' or 'voice-practice'",
      });
    }

    const progressData = {
      userId,
      storyTitle: storyTitle || "",
      readingTime: Number(readingTime || 0),
      completed: Boolean(completed),
      score: Number(score || 0),
      activityType,
      contentSource: contentSource || "story",
      date: date ? new Date(date) : new Date(),
    };

    if (storyId) {
      progressData.storyId = storyId;
    }

    const newProgress = new Progress(progressData);

    await newProgress.save();

    return res.status(201).json({
      message: "Progress saved successfully",
      progress: newProgress,
    });
  } catch (error) {
    console.error("Save progress error:", error);
    return res.status(500).json({
      message: "Server error: " + error.message,
    });
  }
});

// GET USER PROGRESS HISTORY
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const progress = await Progress.find({ userId })
      .populate("storyId", "title category level")
      .sort({ date: -1 });

    return res.status(200).json(progress);
  } catch (error) {
    console.error("Fetch user progress error:", error);
    return res.status(500).json({
      message: "Server error while fetching progress",
    });
  }
});

// GET SUMMARY
router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const items = await Progress.find({ userId }).sort({ date: -1 });

    const totalSessions = items.length;
    const totalReadingTime = items.reduce(
      (sum, item) => sum + Number(item.readingTime || 0),
      0
    );
    const completedSessions = items.filter((item) => item.completed).length;
    const inProgressSessions = totalSessions - completedSessions;

    const voiceItems = items.filter(
      (item) => item.activityType === "voice-practice"
    );

    const averageScore =
      voiceItems.length > 0
        ? Math.round(
            voiceItems.reduce((sum, item) => sum + Number(item.score || 0), 0) /
              voiceItems.length
          )
        : 0;

    const completedStoriesCount = new Set(
      items
        .filter((item) => item.completed && item.storyId)
        .map((item) => item.storyId.toString())
    ).size;

    const recentActivity = items.slice(0, 5);

    return res.status(200).json({
      totalSessions,
      totalReadingTime,
      completedSessions,
      inProgressSessions,
      averageScore,
      completedStoriesCount,
      recentActivity,
    });
  } catch (error) {
    console.error("Summary error:", error);
    return res.status(500).json({
      message: "Server error while fetching summary",
    });
  }
});

// GET WEEKLY PROGRESS
router.get("/weekly/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const items = await Progress.find({ userId }).sort({ date: 1 });

    const weeklyMap = {};

    items.forEach((item) => {
      const currentDate = new Date(item.date);

      const day = currentDate.getDay();
      const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);

      const weekStart = new Date(currentDate);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const key = weekStart.toISOString().split("T")[0];

      if (!weeklyMap[key]) {
        weeklyMap[key] = {
          weekStart: weekStart.toISOString().split("T")[0],
          weekEnd: weekEnd.toISOString().split("T")[0],
          totalSessions: 0,
          readerSessions: 0,
          voicePracticeSessions: 0,
          totalReadingTime: 0,
          completedSessions: 0,
          totalScore: 0,
          scoreCount: 0,
          completedStories: new Set(),
        };
      }

      weeklyMap[key].totalSessions += 1;
      weeklyMap[key].totalReadingTime += Number(item.readingTime || 0);

      if (item.activityType === "reader") {
        weeklyMap[key].readerSessions += 1;
      }

      if (item.activityType === "voice-practice") {
        weeklyMap[key].voicePracticeSessions += 1;
        weeklyMap[key].totalScore += Number(item.score || 0);
        weeklyMap[key].scoreCount += 1;
      }

      if (item.completed) {
        weeklyMap[key].completedSessions += 1;
      }

      if (item.completed && item.storyId) {
        weeklyMap[key].completedStories.add(item.storyId.toString());
      }
    });

    const weeklyProgress = Object.values(weeklyMap)
      .map((week) => ({
        weekStart: week.weekStart,
        weekEnd: week.weekEnd,
        totalSessions: week.totalSessions,
        readerSessions: week.readerSessions,
        voicePracticeSessions: week.voicePracticeSessions,
        totalReadingTime: week.totalReadingTime,
        completedSessions: week.completedSessions,
        averageScore:
          week.scoreCount > 0
            ? Math.round(week.totalScore / week.scoreCount)
            : 0,
        completedStoriesCount: week.completedStories.size,
      }))
      .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));

    return res.status(200).json(weeklyProgress);
  } catch (error) {
    console.error("Weekly progress error:", error);
    return res.status(500).json({
      message: "Server error while fetching weekly progress",
    });
  }
});

module.exports = router;