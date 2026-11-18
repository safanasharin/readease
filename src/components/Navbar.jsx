import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const showNav = user && user.screeningCompleted;

  const linkStyle = ({ isActive }) =>
    isActive
      ? "text-teal-600 font-bold"
      : "text-gray-700 font-semibold hover:text-teal-600 transition";

  const handleStartAssessment = () => {
    navigate("/assessment");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md px-8 py-4 z-50 flex justify-between items-center">
      {/* LOGO */}
      <h1 className="text-2xl font-bold text-teal-600 cursor-pointer" onClick={() => navigate(showNav ? "/dashboard" : user ? `/assessment/${user.ageGroup?.toLowerCase()}` : "/")}>
        Readease
      </h1>

      {/* LINKS */}
      {showNav && (
        <div className="flex gap-8 text-lg">
          <NavLink to="/dashboard" className={linkStyle}>
            Home
          </NavLink>

          <NavLink to="/reader" className={linkStyle}>
            Reader
          </NavLink>

          <NavLink to="/voice-practice" className={linkStyle}>
            Voice Practice
          </NavLink>

          <NavLink to="/stories" className={linkStyle}>
            Stories
          </NavLink>

          {user && ["explorer", "beginner", "1", "2"].includes(String(user.ageGroup).toLowerCase()) && (
            <NavLink 
              to="/parent" 
              className={linkStyle}
            >
              Progress
            </NavLink>
          )}
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex gap-4 items-center">
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-teal-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-teal-700 cursor-pointer"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}