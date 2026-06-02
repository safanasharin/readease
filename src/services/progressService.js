import axios from "axios";

const API = "http://localhost:5000/api/progress";

export const saveProgress = async (progressData) => {
  const response = await axios.post(`${API}/save`, progressData);
  return response.data;
};

export const getUserProgress = async (userId) => {
  const response = await axios.get(`${API}/user/${userId}`);
  return response.data;
};

export const getProgressSummary = async (userId) => {
  const response = await axios.get(`${API}/summary/${userId}`);
  return response.data;
};