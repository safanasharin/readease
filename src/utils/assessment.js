import api from "./api";

export const assessmentApi = {
  saveAssessment: (data) => api.post("/assessment/save", data),
  saveInitialAssessment: (data) => api.post("/assessment", data),
  getAssessment: (userId) => api.get(`/assessment/${userId}`),
  updateDyslexiaLevel: (userId, dyslexiaLevel) =>
    api.patch(`/assessment/${userId}/level`, { dyslexiaLevel }),
  checkCompletion: (userId) =>
    api.get(`/assessment/${userId}/completion`).then((r) => r.data),
};

