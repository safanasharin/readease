import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from the backend using the stored token
  const fetchUserProfile = useCallback(async (authToken) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!res.ok) {
        // Token is invalid or expired — clear session
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        return null;
      }
      const data = await res.json();
      const fetchedUser = data.user;
      
      setUser(fetchedUser);
      return fetchedUser;
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      return null;
    }
  }, []);

  // On mount, restore session from localStorage token
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const login = (userData, userToken) => {
    localStorage.setItem("token", userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Refresh user data from the backend
  const refreshUser = useCallback(async () => {
    if (token) {
      return fetchUserProfile(token);
    }
    return null;
  }, [token, fetchUserProfile]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
