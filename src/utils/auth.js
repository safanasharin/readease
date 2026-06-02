export const API_BASE_URL = "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("token");

export const getLoggedInUser = () => {
  const user = localStorage.getItem("loggedInUser");
  return user ? JSON.parse(user) : null;
};

export const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("loggedInUser");
};