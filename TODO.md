# TODO - Dyslexia assessment gating + persistence

- [ ] Backend: Add `backend/models/Assessment.js` model
- [ ] Backend: Add `backend/routes/assessmentRoutes.js` (save/get/update/complete-check)
- [ ] Backend: Wire assessment routes in `backend/index.js`
- [ ] Frontend: Add assessment completion API client (e.g., `src/utils/assessment.js`)
- [ ] Frontend: Gate main app pages (Dashboard + Reader + Progress + Voice Practice) to redirect to `/assessment` if not completed
- [ ] Frontend: Update `src/components/assessment/ResultDashboard.jsx` to save assessment result to backend MongoDB (and set completed status)
- [ ] Frontend: After completion, redirect behavior already routes to assessment; ensure success state doesn’t allow dashboard
- [ ] Optional: Apply dyslexia-level personalized UI controls based on saved `dyslexiaLevel`
- [ ] Testing: verify signup → /assessment, dashboard blocked until completed, assessment save persists

