/* eslint-disable */
import { Routes, Route, Navigate } from "react-router-dom";
import AssessmentGuard from "./components/auth/AssessmentGuard";
import { RewardProvider } from "./rewardSystem/RewardContext";
import RewardPopup from "./components/explorer/RewardPopup";

// Public pages
import Home from "./Home";
import Support from "./Support";

// Assessment pages
import ExplorerAssessment from "./pages/assessment/explorer/ExplorerAssessment";
import AdaptiveAssessment from "./pages/AdaptiveAssessment";

// Centralized Dashboard Router
import DashboardRouter from "./dashboards/DashboardRouter";
import ParentDashboardRouter from "./pages/parent/ParentDashboardRouter";
import AgeGroup3ParentDashboard from "./pages/parent/AgeGroup3ParentDashboard";

// Explorer activities
import TracingActivity from "./pages/explorer/activities/TracingActivity";
import MemoryActivity from "./pages/explorer/activities/MemoryActivity";
import StoryActivity from "./pages/explorer/activities/StoryActivity";
import SortingActivity from "./pages/explorer/activities/SortingActivity";
import SoundMatchingActivity from "./pages/explorer/activities/SoundMatchingActivity";
import LetterConfusionActivity from "./pages/explorer/activities/LetterConfusionActivity";
import SequencingActivity from "./pages/explorer/activities/SequencingActivity";
import VisualDiscriminationActivity from "./pages/explorer/activities/VisualDiscriminationActivity";
import ChildProgressDashboard from "./pages/explorer/ChildProgressDashboard";
import ChildParentDashboard from "./pages/explorer/ChildParentDashboard";

// Beginner Activities
import ReadingPractice from "./pages/beginner/ReadingPractice";
import VocabularyBuilder from "./pages/beginner/VocabularyBuilder";
import WordDetective from "./pages/beginner/WordDetective";
import StoryExplorer from "./pages/beginner/StoryExplorer";
import SentenceBuilder from "./pages/beginner/SentenceBuilder";

// Shared protected pages
import Reader from "./Reader";
import Progress from "./Progress";
import VoicePractice from "./VoicePractice";
import Stories from "./Stories";

function App() {
  return (
    <RewardProvider>
      <RewardPopup />
      <Routes>
      {/* ── Public ──────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/support" element={<Support />} />

      {/* ── Assessments ─────────────────────────── */}
      <Route path="/assessment/explorer"
        element={<AssessmentGuard><ExplorerAssessment /></AssessmentGuard>} />
      <Route path="/assessment/beginner"
        element={<AssessmentGuard><AdaptiveAssessment /></AssessmentGuard>} />
      <Route path="/assessment/intermediate"
        element={<AssessmentGuard><AdaptiveAssessment /></AssessmentGuard>} />
      <Route path="/assessment/advanced"
        element={<AssessmentGuard><AdaptiveAssessment /></AssessmentGuard>} />
      <Route path="/assessment/:ageGroup"
        element={<AssessmentGuard><AdaptiveAssessment /></AssessmentGuard>} />
      <Route path="/assessment"
        element={<AssessmentGuard><AdaptiveAssessment /></AssessmentGuard>} />
      <Route path="/initial-assessment"
        element={<AssessmentGuard><AdaptiveAssessment /></AssessmentGuard>} />

      {/* ── Centralized Dashboard ───────────────── */}
      <Route path="/dashboard"
        element={<AssessmentGuard><DashboardRouter /></AssessmentGuard>} />
      <Route path="/explorer"
        element={<AssessmentGuard><DashboardRouter /></AssessmentGuard>} />
      <Route path="/beginner"
        element={<AssessmentGuard><DashboardRouter /></AssessmentGuard>} />
      <Route path="/intermediate"
        element={<AssessmentGuard><DashboardRouter /></AssessmentGuard>} />
      <Route path="/advanced"
        element={<AssessmentGuard><DashboardRouter /></AssessmentGuard>} />

      {/* ── Beginner Activities ──────────────────── */}
      <Route path="/activity/reading-practice"
        element={<AssessmentGuard><ReadingPractice /></AssessmentGuard>} />
      <Route path="/activity/vocabulary-builder"
        element={<AssessmentGuard><VocabularyBuilder /></AssessmentGuard>} />
      <Route path="/activity/word-detective"
        element={<AssessmentGuard><WordDetective /></AssessmentGuard>} />
      <Route path="/activity/story-explorer"
        element={<AssessmentGuard><StoryExplorer /></AssessmentGuard>} />
      <Route path="/activity/sentence-builder"
        element={<AssessmentGuard><SentenceBuilder /></AssessmentGuard>} />

      {/* ── Explorer Activities ──────────────────── */}
      <Route path="/explorer/activity/tracing"
        element={<AssessmentGuard><TracingActivity /></AssessmentGuard>} />
      <Route path="/explorer/activity/memory"
        element={<AssessmentGuard><MemoryActivity /></AssessmentGuard>} />
      <Route path="/explorer/activity/story"
        element={<AssessmentGuard><StoryActivity /></AssessmentGuard>} />
      <Route path="/explorer/activity/sorting"
        element={<AssessmentGuard><SortingActivity /></AssessmentGuard>} />
      <Route path="/explorer/activity/sound-matching"
        element={<AssessmentGuard><SoundMatchingActivity /></AssessmentGuard>} />
      <Route path="/explorer/activity/letter-confusion"
        element={<AssessmentGuard><LetterConfusionActivity /></AssessmentGuard>} />
      <Route path="/explorer/activity/sequencing"
        element={<AssessmentGuard><SequencingActivity /></AssessmentGuard>} />
      <Route path="/explorer/activity/visual-detective"
        element={<AssessmentGuard><VisualDiscriminationActivity /></AssessmentGuard>} />

      {/* ── Parent Dashboard ────────────────────── */}
      <Route path="/parent"
        element={<AssessmentGuard><ParentDashboardRouter /></AssessmentGuard>} />
      <Route path="/parent-age3"
        element={<AssessmentGuard><AgeGroup3ParentDashboard /></AssessmentGuard>} />
      <Route path="/child-parent"
        element={<AssessmentGuard><ChildParentDashboard /></AssessmentGuard>} />

      {/* ── Beginner Activities ──────────────────── */}
      <Route path="/beginner/activity/:activityId"
        element={<AssessmentGuard><DashboardRouter /></AssessmentGuard>} />

      {/* ── Intermediate Activities ──────────────── */}
      <Route path="/intermediate/activity/:activityId"
        element={<AssessmentGuard><DashboardRouter /></AssessmentGuard>} />

      {/* ── Advanced Activities ──────────────────── */}
      <Route path="/advanced/activity/:activityId"
        element={<AssessmentGuard><DashboardRouter /></AssessmentGuard>} />

      {/* ── Shared Protected Pages ──────────────── */}
      <Route path="/reader"
        element={<AssessmentGuard><Reader /></AssessmentGuard>} />
      <Route path="/progress"
        element={<AssessmentGuard><Progress /></AssessmentGuard>} />
      <Route path="/voice-practice"
        element={<AssessmentGuard><VoicePractice /></AssessmentGuard>} />
      <Route path="/stories"
        element={<AssessmentGuard><Stories /></AssessmentGuard>} />
      </Routes>
    </RewardProvider>
  );
}

export default App;