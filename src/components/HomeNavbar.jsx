import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

function HomeNavButton({ label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2.5 font-bold text-sm transition-all duration-300 rounded-full ${
        active
          ? "text-teal-700 bg-teal-50"
          : "text-slate-600 hover:text-teal-700 hover:bg-white/80"
      }`}
    >
      {label}
    </button>
  );
}

export default function HomeNavbar({ onLoginClick, onGetStartedClick }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToId = (id) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}>
      <nav className={`max-w-7xl mx-auto px-6 py-3 transition-all duration-500 flex items-center justify-between
        ${scrolled 
          ? "bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] mx-4 md:mx-auto" 
          : "bg-transparent border-transparent mx-4 md:mx-auto"
        }
      `}>
        {/* Logo */}
        <button
          type="button"
          onClick={() => scrollToId('home')}
          className="flex items-center gap-3 text-2xl font-black text-slate-800 hover:text-teal-600 transition-colors group"
          aria-label="Readease Home"
        >
          <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-2 rounded-[1rem] shadow-sm group-hover:scale-105 transition-transform duration-300">
            <BookOpen size={22} className="text-white" />
          </div>
          ReadEase
        </button>

        {/* Centered links - Glass Pill */}
        <div className={`hidden lg:flex items-center justify-center gap-1 px-2 py-1.5 rounded-full transition-all duration-500 ${scrolled ? 'bg-white/50 border border-white/60 shadow-sm' : ''}`}>
          <HomeNavButton label="Home" onClick={() => scrollToId('home')} />
          <HomeNavButton label="Features" onClick={() => scrollToId('features')} />
          <HomeNavButton label="Process" onClick={() => scrollToId('how-it-works')} />
          <HomeNavButton label="Paths" onClick={() => scrollToId('age-groups')} />
          <HomeNavButton label="Benefits" onClick={() => scrollToId('benefits')} />
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLoginClick}
            className="hidden md:block text-slate-700 font-bold text-sm hover:text-teal-600 transition-colors px-4 py-2 rounded-full hover:bg-slate-50"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={onGetStartedClick}
            className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-200/50 transition-all duration-300 hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </nav>
    </div>
  );
}
