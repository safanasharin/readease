const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    // Validate required fields
if (!name) return res.status(400).json({ message: "Name is required" });
if (!email) return res.status(400).json({ message: "Email is required" });
if (!password) return res.status(400).json({ message: "Password is required" });
if (age === undefined || age === "") {
  return res.status(400).json({ message: "Age is required" });
}
const ageNum = parseInt(age, 10);
if (isNaN(ageNum) || ageNum < 4 || ageNum > 14) {
  return res.status(400).json({ message: "Age must be between 4 and 14" });
}

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      age,
    });

  await user.save();

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        ageGroup: user.ageGroup,
        dyslexiaLevel: user.dyslexiaLevel || null,
        riskLevel: user.riskLevel,
        screeningCompleted: user.screeningCompleted,
        hasCompletedAssessment: false,
        assessmentCompleted: false,
        assessmentScore: 0,
        assessmentDate: null,
        readingScore: 0,
        writingScore: 0,
        phonicsScore: 0,
        strengths: [],
        weaknesses: [],
        recommendedActivities: [],
        interventionPlan: {},
        progressPercentage: 0,
        currentStreak: 0,
        lastLogin: null,
        assessmentStatus: "not_started",
        supportLevel: "emerging_support",
        skillProgress: {
          phonologicalAwareness: 0,
          visualProcessing: 0,
          workingMemory: 0,
          attentionControl: 0,
          fineMotorSkills: 0,
          languageComprehension: 0,
        },
        dailySession: {
          totalMinutes: 0,
          completedActivities: 0,
          lastPlayed: null,
        },
        supportProfile: {
          supportLevel: "emerging_support",
          strengths: [],
          weakSkills: [],
          recommendedActivities: [],
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return the complete user profile from MongoDB (single source of truth)
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        ageGroup: user.ageGroup,
        dyslexiaLevel: user.dyslexiaLevel,
        riskLevel: user.riskLevel,
        screeningCompleted: user.screeningCompleted,
        hasCompletedAssessment: user.hasCompletedAssessment || false,
        assessmentCompleted: user.assessmentCompleted || false,
        assessmentScore: user.assessmentScore || 0,
        assessmentDate: user.assessmentDate || null,
        readingScore: user.readingScore || 0,
        writingScore: user.writingScore || 0,
        phonicsScore: user.phonicsScore || 0,
        strengths: user.strengths || [],
        weaknesses: user.weaknesses || [],
        recommendedActivities: user.recommendedActivities || [],
        interventionPlan: user.interventionPlan || {},
        progressPercentage: user.progressPercentage || 0,
        currentStreak: user.currentStreak || 0,
        lastLogin: user.lastLogin,
        gamification: user.gamification || {},
        accessibilityPreferences: user.accessibilityPreferences || {},
        assessmentStatus: user.assessmentStatus || (user.screeningCompleted ? "completed" : "not_started"),
        supportLevel: user.supportLevel || "emerging_support",
        skillProgress: user.skillProgress || {
          phonologicalAwareness: 0,
          visualProcessing: 0,
          workingMemory: 0,
          attentionControl: 0,
          fineMotorSkills: 0,
          languageComprehension: 0,
        },
        dailySession: user.dailySession || {
          totalMinutes: 0,
          completedActivities: 0,
          lastPlayed: null,
        },
        supportProfile: user.supportProfile || {
          supportLevel: "emerging_support",
          strengths: [],
          weakSkills: [],
          recommendedActivities: [],
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
});

// GET PROFILE
const auth = require("../middleware/auth");
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure fields exist (initializer fallback)
    let updated = false;
    if (!user.assessmentStatus) {
      user.assessmentStatus = user.screeningCompleted ? "completed" : "not_started";
      updated = true;
    }
    if (!user.supportLevel) {
      if (user.riskLevel === "level3" || user.dyslexiaLevel?.toLowerCase() === "severe") {
        user.supportLevel = "intensive_support";
      } else if (user.riskLevel === "level2" || user.dyslexiaLevel?.toLowerCase() === "moderate") {
        user.supportLevel = "guided_support";
      } else {
        user.supportLevel = "emerging_support";
      }
      updated = true;
    }
    if (updated) {
      await user.save();
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("GET /me error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// SAVE ACCESSIBILITY PREFERENCES
router.post("/accessibility", auth, async (req, res) => {
  try {
    const { fontSize, lineSpacing, overlayColor, ttsEnabled, dyslexicFontEnabled } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.accessibilityPreferences = {
      fontSize: fontSize !== undefined ? fontSize : user.accessibilityPreferences.fontSize,
      lineSpacing: lineSpacing !== undefined ? lineSpacing : user.accessibilityPreferences.lineSpacing,
      overlayColor: overlayColor !== undefined ? overlayColor : user.accessibilityPreferences.overlayColor,
      ttsEnabled: ttsEnabled !== undefined ? ttsEnabled : user.accessibilityPreferences.ttsEnabled,
      dyslexicFontEnabled: dyslexicFontEnabled !== undefined ? dyslexicFontEnabled : user.accessibilityPreferences.dyslexicFontEnabled,
    };

    await user.save();
    return res.status(200).json({
      message: "Accessibility preferences updated",
      accessibilityPreferences: user.accessibilityPreferences,
      user
    });
  } catch (error) {
    console.error("Accessibility update error:", error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;