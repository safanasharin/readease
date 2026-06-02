import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('loggedInUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const apiRequests = {
  // Auth
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth'),

  // Stories
  getStories: (params) => api.get('/stories', { params }),
  getStory: (id) => api.get(`/stories/${id}`),
  createStory: (data) => api.post('/stories', data),

  // Activities
  saveActivity: (data) => api.post('/activities', data),
  getActivities: (userId) => api.get(`/activities/${userId}`),
  getWeekly: (userId) => api.get(`/activities/${userId}/weekly`),

  // Progress
  saveProgress: (data) => api.post('/progress/save', data),
  getProgress: (userId) => api.get(`/progress/${userId}`),
};

