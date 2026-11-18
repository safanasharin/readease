import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * AdvancedNavbar — Premium dark navbar scoped exclusively to the Advanced Age Group dashboard.
 * Uses CSS classes from AdvancedDashboard.css (loaded by AdvancedDashboard.jsx).
 * All logic identical to shared Navbar; only visual presentation differs.
 */
export default function AdvancedNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const showNav = user && user.screeningCompleted;

  const getLinkClass = ({ isActive }) =>
    `adv-navlink${isActive ? " active" : ""}`;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="adv-navbar">
      {/* LOGO */}
      <span
        className="adv-navbar-logo"
        onClick={() =>
          navigate(
            showNav
              ? "/dashboard"
              : user
              ? `/assessment/${user.ageGroup?.toLowerCase()}`
              : "/"
          )
        }
      >
        Readease
      </span>

      {/* LINKS */}
      {showNav && (
        <div className="adv-navbar-links">
          <NavLink to="/dashboard" className={getLinkClass}>
            Home
          </NavLink>
          <NavLink to="/reader" className={getLinkClass}>
            Reader
          </NavLink>
          <NavLink to="/voice-practice" className={getLinkClass}>
            Voice Practice
          </NavLink>
          <NavLink to="/stories" className={getLinkClass}>
            Stories
          </NavLink>
        </div>
      )}

      {/* ACTIONS */}
      <div className="adv-navbar-actions">
        {user ? (
          <button onClick={handleLogout} className="adv-btn-logout">
            Logout
          </button>
        ) : (
          <button onClick={() => navigate("/login")} className="adv-btn-login">
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
