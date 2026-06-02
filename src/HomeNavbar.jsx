import { useEffect, useState } from "react";

function NavItemButton({
  label,
  onClick,
  active,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-[16px] transition-all duration-200 ${
        active
          ? "text-teal-600 font-semibold"
          : "text-gray-600 hover:text-teal-600"
      }`}
    >
      {label}

      {/* Active underline */}
      {active && (
        <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-teal-600 rounded-full" />
      )}
    </button>
  );
}

export default function HomeNavbar({
  onLoginClick,
  onGetStartedClick,
}) {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      const features = document.getElementById("features");
      const about = document.getElementById("about");

      if (
        about &&
        scrollY >= about.offsetTop - 120
      ) {
        setActiveSection("about");
      } else if (
        features &&
        scrollY >= features.offsetTop - 120
      ) {
        setActiveSection("features");
      } else {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="text-3xl font-bold text-teal-600 tracking-tight"
          >
            Readease
          </button>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <NavItemButton
              label="Home"
              active={activeSection === "home"}
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            />

            <NavItemButton
              label="Features"
              active={activeSection === "features"}
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            />

            <NavItemButton
              label="About"
              active={activeSection === "about"}
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            />
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onLoginClick}
              className="hidden sm:block text-gray-700 font-medium hover:text-teal-600 transition"
            >
              Login
            </button>

            <button
              type="button"
              onClick={onGetStartedClick}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-teal-700 hover:shadow-lg transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* IMPORTANT:
          Add spacing because navbar is fixed
      */}
      <div className="h-24" />
    </>
  );
}