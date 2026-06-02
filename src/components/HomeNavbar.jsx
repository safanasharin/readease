
import { useMemo } from "react";

function HomeNavButton({ label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "text-teal-600 font-semibold"
          : "text-gray-600 font-medium hover:text-teal-600 transition-colors"
      }
    >
      {label}
    </button>
  );
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomeNavbar({ onLoginClick, onGetStartedClick }) {
  // Keep it simple: if you scroll, we still highlight Home (to avoid guessing).
  // The click behavior still smooth-scrolls to #features and #about when present.
  const activeSection = useMemo(() => "home", []);


  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-2xl font-bold text-teal-600 hover:text-teal-700 transition"
          aria-label="Readease Home"
        >
          Readease
        </button>

        {/* Centered links */}
        <div className="hidden md:flex items-center justify-center gap-10">
          <HomeNavButton
            label="Home"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />

          <HomeNavButton
            label="Features"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          />

          <HomeNavButton
            label="About"
            onClick={() =>
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          />
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onLoginClick}
            className="text-gray-700 font-medium hover:text-teal-600 transition"
          >
            Login
          </button>
          <button
            type="button"
            onClick={onGetStartedClick}
            className="bg-teal-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-teal-700 hover:shadow-md transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

