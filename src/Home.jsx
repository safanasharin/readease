import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HomeNavbar from "./components/HomeNavbar";
import { useAuth } from "./context/AuthContext";
import { motion } from "framer-motion";
import { 
  Sparkles, Brain, BookOpen, Star, ArrowRight, 
  ShieldCheck, Gamepad2, GraduationCap, Users, 
  CheckCircle2, Heart, Award, Target, Activity, MessageCircle
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    age: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!isLogin && !formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    // Age validation for signup
    if (!isLogin) {
      if (!formData.age) {
        newErrors.age = "Age is required";
      } else {
        const ageNum = parseInt(formData.age, 10);
        if (isNaN(ageNum) || ageNum < 4 || ageNum > 14) {
          newErrors.age = "Age must be between 4 and 14";
        }
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    return newErrors;
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
      age: "",
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || "Invalid email or password" });
        setIsSubmitting(false);
        return;
      }

      // Call login context provider
      login(data.user, data.token);

      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setIsSubmitting(false);
      resetForm();
      setErrors({});
      
      if (data.user?.screeningCompleted) {
        const { ageGroup, dyslexiaLevel, riskLevel } = data.user;
        const normalizedAge = (ageGroup || "").toLowerCase();

        if (normalizedAge === "explorer") navigate("/explorer");
        else if (normalizedAge === "beginner") navigate("/beginner");
        else if (normalizedAge === "intermediate") navigate("/intermediate");
        else if (normalizedAge === "advanced") navigate("/advanced");
        else if (dyslexiaLevel) {
          const severity = dyslexiaLevel.toLowerCase();
          let level = "level1";
          if (severity === "moderate") level = "level2";
          if (severity === "severe") level = "level3";
          navigate(`/dashboard/${level}`);
        } else if (riskLevel) {
          navigate(`/dashboard/${riskLevel}`);
        } else {
          navigate("/beginner"); // fallback
        }
      } else {
        navigate(`/assessment/${data.user?.ageGroup?.toLowerCase() || 'beginner'}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "Server error. Please try again." });
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          age: formData.age,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || "Signup failed" });
        setIsSubmitting(false);
        return;
      }

      // Log user in automatically on signup
      login(data.user, data.token);

      setIsSubmitting(false);
      resetForm();
      setErrors({});
      alert("Signup successful! Let's start with a quick reading assessment.");
      navigate(`/assessment/${data.user?.ageGroup?.toLowerCase() || 'beginner'}`);
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: "Server error. Please try again." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-white flex flex-col overflow-x-hidden selection:bg-teal-200">
      <HomeNavbar
        onLoginClick={() => {
          setIsLogin(true);
          setErrors({});
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onGetStartedClick={() => {
          setIsLogin(false);
          setErrors({});
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        
        {/* Left Side: Content */}
        <div className="flex-1 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-50 text-teal-700 font-bold text-sm mb-8 shadow-sm border border-teal-100"
          >
            <Sparkles size={18} className="text-yellow-500" /> AI-Powered Reading Platform
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black mb-6 leading-[1.1] text-slate-900 tracking-tight"
          >
            Learning Made <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-purple-600 to-sky-500 drop-shadow-sm">
              Easy for Every Child
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-lg lg:text-xl mb-10 max-w-lg leading-relaxed font-medium"
          >
            An AI-powered learning platform designed specifically to support children with dyslexia, dysgraphia, and reading difficulties.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start"
          >
            <button 
              onClick={() => { setIsLogin(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-teal-200 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Learning <ArrowRight size={20} />
            </button>
            <a 
              href="#features" 
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-full font-bold text-lg transition-all hover:border-teal-300 flex items-center justify-center"
            >
              Learn More
            </a>
          </motion.div>
        </div>

        {/* Right Side: Auth Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-[45%] relative z-10"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-white p-8 lg:p-10 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative">
            <div className="flex gap-3 mb-8 bg-slate-100 p-1.5 rounded-full">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrors({}); }}
                className={`flex-1 py-3 rounded-full font-bold transition-all ${isLogin ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrors({}); }}
                className={`flex-1 py-3 rounded-full font-bold transition-all ${!isLogin ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Sign up
              </button>
            </div>

            <h2 className="text-3xl font-black mb-2 text-slate-800">
              {isLogin ? "Welcome back!" : "Join the adventure!"}
            </h2>
            <p className="text-slate-500 mb-8 font-medium">
              {isLogin ? "Access your personalized dashboard" : "Create an account to start learning"}
            </p>

            {errors.general && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 font-bold flex items-center gap-2">
                <ShieldCheck size={18}/> {errors.general}
              </div>
            )}

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-3 focus:outline-none focus:border-teal-500 focus:bg-white font-medium transition-colors"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.fullName}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-3 focus:outline-none focus:border-teal-500 focus:bg-white font-medium transition-colors"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Learner's age (4-14)"
                    min="4" max="14"
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-3 focus:outline-none focus:border-teal-500 focus:bg-white font-medium transition-colors"
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1 font-bold">{errors.age}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-3 focus:outline-none focus:border-teal-500 focus:bg-white font-medium transition-colors"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-5 py-3 focus:outline-none focus:border-teal-500 focus:bg-white font-medium transition-colors"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-bold">{errors.confirmPassword}</p>}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-600 cursor-pointer" onClick={() => setFormData(prev => ({...prev, rememberMe: !prev.rememberMe}))}>Remember me</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-200 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
              >
                {isSubmitting ? "Loading..." : isLogin ? "Access Account" : "Create Account"}
              </button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="py-24 bg-slate-50 relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-black text-teal-600 uppercase tracking-widest mb-4">Core Features</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Designed for Different Learning Minds</h3>
            <p className="text-lg text-slate-600 font-medium">Everything your child needs to build confidence, improve reading, and enjoy the learning process.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="text-purple-500" size={32} />} 
              color="purple"
              title="Personalized Learning" 
              desc="Adaptive pathways that adjust to your child's unique reading level and pace." 
            />
            <FeatureCard 
              icon={<Sparkles className="text-yellow-500" size={32} />} 
              color="yellow"
              title="AI Reading Assistant" 
              desc="Real-time voice recognition that listens and provides gentle, instant feedback." 
            />
            <FeatureCard 
              icon={<Gamepad2 className="text-sky-500" size={32} />} 
              color="sky"
              title="Interactive Activities" 
              desc="Gamified vocabulary builders, memory matching, and tracing exercises." 
            />
            <FeatureCard 
              icon={<Activity className="text-emerald-500" size={32} />} 
              color="emerald"
              title="Progress Tracking" 
              desc="Detailed analytics capturing fluency, accuracy, and daily learning streaks." 
            />
            <FeatureCard 
              icon={<GraduationCap className="text-teal-500" size={32} />} 
              color="teal"
              title="Multi-Age Learning" 
              desc="Distinct environments categorized into four tailored age groups (4-14 years)." 
            />
            <FeatureCard 
              icon={<Users className="text-rose-500" size={32} />} 
              color="rose"
              title="Parent Monitoring" 
              desc="A dedicated dashboard to review sessions, monitor growth, and celebrate wins." 
            />
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-4">Simple Process</h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-16">How ReadEase Works</h3>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-slate-100 -z-10"></div>
            
            <StepCard step="1" title="Create Account" desc="Sign up and complete a quick reading assessment." />
            <StepCard step="2" title="Choose Level" desc="Get automatically placed in the perfect age group." />
            <StepCard step="3" title="Play & Learn" desc="Complete interactive activities and read stories." />
            <StepCard step="4" title="Track Progress" desc="Parents monitor growth via detailed analytics." />
          </div>
        </div>
      </section>

      {/* 4. AGE GROUP SECTION */}
      <section id="age-groups" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
          <h2 className="text-sm font-black text-sky-400 uppercase tracking-widest mb-4">Tailored Environments</h2>
          <h3 className="text-4xl md:text-5xl font-black mb-16">Four Distinct Learning Paths</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AgeCard title="Explorer" age="4-6 Years" desc="Phonics, letter tracing, and foundational vocabulary." color="bg-pink-500" />
            <AgeCard title="Beginner" age="6-8 Years" desc="Short sentences, word building, and voice reading." color="bg-sky-500" />
            <AgeCard title="Intermediate" age="8-10 Years" desc="Paragraph comprehension and fluency building." color="bg-emerald-500" />
            <AgeCard title="Advanced" age="10-14 Years" desc="Complex narratives, literature, and rapid reading." color="bg-purple-500" />
          </div>
        </div>
      </section>

      {/* 5. BENEFITS SECTION */}
      <section id="benefits" className="py-24 bg-[#EAF7F5] relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          
          {/* LEFT SIDE: Benefits Cards */}
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-sm font-black text-teal-600 uppercase tracking-widest mb-4">Why ReadEase?</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                Empowering Children to Overcome Reading Barriers
              </h3>
              <p className="text-slate-600 text-lg font-medium">
                Our platform provides a supportive, engaging environment tailored to unique learning styles, making reading a joyful experience.
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                { icon: <BookOpen size={22} className="text-teal-600" />, title: "Improves Reading Skills & Fluency", bg: "bg-teal-50", border: "border-teal-100", shadow: "hover:shadow-teal-100/50", text: "text-teal-900" },
                { icon: <Brain size={22} className="text-purple-600" />, title: "Builds Extensive Vocabulary", bg: "bg-purple-50", border: "border-purple-100", shadow: "hover:shadow-purple-100/50", text: "text-purple-900" },
                { icon: <Star size={22} className="text-yellow-600" />, title: "Increases Self-Confidence", bg: "bg-yellow-50", border: "border-yellow-100", shadow: "hover:shadow-yellow-100/50", text: "text-yellow-900" },
                { icon: <Target size={22} className="text-rose-600" />, title: "Enhances Focus & Attention Span", bg: "bg-rose-50", border: "border-rose-100", shadow: "hover:shadow-rose-100/50", text: "text-rose-900" },
                { icon: <Heart size={22} className="text-sky-600" />, title: "Supports Special Learning Needs", bg: "bg-sky-50", border: "border-sky-100", shadow: "hover:shadow-sky-100/50", text: "text-sky-900" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02, x: 8 }}
                  className={`flex items-center gap-5 bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow-sm hover:shadow-md border border-white transition-all cursor-default ${item.shadow}`}
                >
                  <div className={`p-3.5 rounded-[1rem] ${item.bg} border ${item.border} shadow-sm`}>
                    {item.icon}
                  </div>
                  <span className={`text-lg font-bold ${item.text}`}>{item.title}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Visual Illustration & Floating Cards */}
          <div className="flex-1 w-full relative min-h-[500px] flex items-center justify-center lg:justify-end">
            {/* Background glowing blobs for illustration */}
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-4000"></div>
            
            {/* Main Central Container */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
              whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative z-10 w-80 h-80 sm:w-96 sm:h-96 bg-white rounded-full flex items-center justify-center shadow-2xl border-8 border-white overflow-visible"
            >
              {/* Using a cheerful educational image */}
              <div className="w-full h-full rounded-full overflow-hidden bg-[#EAF7F5] relative">
                <img 
                  src="https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Happy child reading" 
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-purple-500/20 mix-blend-overlay"></div>
              </div>
              
              {/* Decorative badge */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white z-20"
              >
                <Star size={32} className="text-white fill-white" />
              </motion.div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [-12, 12, -12] }} 
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute top-10 left-0 lg:-left-10 bg-white/90 backdrop-blur-md p-4 rounded-[1.5rem] shadow-xl border border-white flex items-center gap-4 z-20"
            >
              <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 shadow-inner"><BookOpen size={24} /></div>
              <div>
                <div className="font-black text-slate-800">Reading</div>
                <div className="text-xs font-bold text-slate-500">Stories & Phonics</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [12, -12, 12] }} 
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
              className="absolute bottom-16 -right-4 lg:-right-8 bg-white/90 backdrop-blur-md p-4 rounded-[1.5rem] shadow-xl border border-white flex items-center gap-4 z-20"
            >
              <div className="bg-yellow-100 p-2.5 rounded-xl text-yellow-600 shadow-inner"><Brain size={24} /></div>
              <div>
                <div className="font-black text-slate-800">Vocabulary</div>
                <div className="text-xs font-bold text-slate-500">Word Building</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [-8, 8, -8], x: [-5, 5, -5] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-1/2 -left-8 lg:-left-16 bg-white/90 backdrop-blur-md p-4 rounded-[1.5rem] shadow-xl border border-white flex items-center gap-4 z-20"
            >
              <div className="bg-sky-100 p-2.5 rounded-xl text-sky-600 shadow-inner"><MessageCircle size={24} /></div>
              <div>
                <div className="font-black text-slate-800">Listening</div>
                <div className="text-xs font-bold text-slate-500">Audio Guides</div>
              </div>
            </motion.div>

            {/* Decorative Alphabet Letters */}
            <motion.div 
              animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute top-4 right-10 text-6xl font-black text-teal-400 opacity-60 select-none z-0 filter drop-shadow-md"
            >
              A
            </motion.div>
            <motion.div 
              animate={{ rotate: [0, -20, 0], scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute bottom-8 left-10 text-7xl font-black text-purple-400 opacity-60 select-none z-0 filter drop-shadow-md"
            >
              B
            </motion.div>
            <motion.div 
              animate={{ rotate: [0, 25, 0], scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
              className="absolute top-1/3 -right-6 text-5xl font-black text-rose-400 opacity-50 select-none z-0 filter drop-shadow-md"
            >
              C
            </motion.div>
          </div>

        </div>
      </section>



      {/* 7. FOOTER SECTION */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center">
          <div className="flex items-center gap-2 text-white font-black text-2xl mb-6">
            <BookOpen className="text-teal-400" /> ReadEase
          </div>
          <p className="mb-6 font-medium max-w-md">An AI-powered learning platform designed to support children with dyslexia and reading difficulties.</p>
          <div className="flex gap-6 mb-8 font-bold">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Contact Support</a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} ReadEase Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Subcomponents for cleaner code
function FeatureCard({ icon, title, desc, color }) {
  const colorMap = {
    purple: "bg-purple-50 border-purple-100 group-hover:border-purple-300",
    yellow: "bg-yellow-50 border-yellow-100 group-hover:border-yellow-300",
    sky: "bg-sky-50 border-sky-100 group-hover:border-sky-300",
    emerald: "bg-emerald-50 border-emerald-100 group-hover:border-emerald-300",
    teal: "bg-teal-50 border-teal-100 group-hover:border-teal-300",
    rose: "bg-rose-50 border-rose-100 group-hover:border-rose-300",
  };

  return (
    <div className={`p-8 rounded-[2rem] bg-white border-2 border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${colorMap[color]}`}>
        {icon}
      </div>
      <h4 className="text-2xl font-black text-slate-800 mb-3">{title}</h4>
      <p className="text-slate-600 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }) {
  return (
    <div className="relative flex flex-col items-center bg-white p-6 rounded-3xl z-10 hover:-translate-y-2 transition-transform">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 font-black text-2xl flex items-center justify-center mb-6 shadow-sm border-4 border-white">
        {step}
      </div>
      <h4 className="text-xl font-black text-slate-800 mb-3">{title}</h4>
      <p className="text-slate-600 font-medium">{desc}</p>
    </div>
  );
}

function AgeCard({ title, age, desc, color }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-[2rem] hover:bg-slate-800 transition-colors text-left group">
      <div className={`text-xs font-black px-3 py-1 rounded-full w-max mb-6 ${color} text-white`}>{age}</div>
      <h4 className="text-2xl font-black text-white mb-3 group-hover:text-teal-300 transition-colors">{title}</h4>
      <p className="text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}