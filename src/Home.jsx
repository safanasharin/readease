import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Features from "./components/Features";
import About from "./components/About";
import HomeNavbar from "./components/HomeNavbar";
import { useAuth } from "./context/AuthContext";

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
    <div className="min-h-screen font-sans text-gray-800 bg-white flex flex-col">
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


      <div className="flex flex-col lg:flex-row pt-12 pb-16 px-6 lg:px-12 max-w-7xl mx-auto w-full gap-12 mt">
        <div className="flex-1 flex flex-col justify-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 font-semibold text-sm mb-4 w-max border border-teal-100">
            ✨ AI-Powered Reading Assistant
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-gray-900 tracking-tight">
            Unlock the joy of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400">
              reading with ease.
            </span>
          </h1>

          <p className="text-gray-600 text-lg mb-10 max-w-lg leading-relaxed">
            Readease provides personalized accessibility tools, guided reading, and voice support to empower dyslexic learners and build reading confidence.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p className="text-base text-gray-700 font-medium">Bionic reading & customizable fonts</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p className="text-base text-gray-700 font-medium">Real-time voice pronunciation feedback</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p className="text-base text-gray-700 font-medium">Detailed progress & fluency analytics</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[40%] flex justify-center items-center">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setErrors({});
                }}
                className={`flex-1 py-3 rounded-full font-semibold ${isLogin
                    ? "bg-teal-600 text-white shadow"
                    : "bg-teal-100 text-teal-700"
                  }`}
              >
                Log in
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setErrors({});
                }}
                className={`flex-1 py-3 rounded-full font-semibold ${!isLogin
                    ? "bg-teal-600 text-white shadow"
                    : "bg-teal-100 text-teal-700"
                  }`}
              >
                Sign up
              </button>
            </div>

            <h2 className="text-2xl font-bold mb-1 text-gray-800">
              {isLogin ? "Log in" : "Create account"}
            </h2>

            <p className="text-gray-500 mb-6 text-sm">
              {isLogin ? "Access your account" : "Create your account to continue"}
            </p>

            {errors.general && (
              <p className="text-red-500 text-sm mb-3">{errors.general}</p>
            )}

            <form onSubmit={isLogin ? handleLogin : handleSignup}>
              {!isLogin && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-gray-300 bg-yellow-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 bg-yellow-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

                {!isLogin && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Enter your age"
                      min="4"
                      max="14"
                      className="w-full rounded-lg border border-gray-300 bg-yellow-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    {errors.age && (
                      <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                    )}
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-gray-300 bg-yellow-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

              {!isLogin && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full rounded-lg border border-gray-300 bg-yellow-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-teal-700 transition disabled:opacity-70"
              >
                {isSubmitting
                  ? "Processing..."
                  : isLogin
                    ? "Log in"
                    : "Sign up"}
              </button>
            </form>

            <p className="text-center text-sm mt-4 text-gray-500">
              {isLogin ? "New user?" : "Already have account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-teal-600 font-semibold"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <Features />
      <About />

      <footer className="bg-gray-900 text-white py-10 text-center mt-auto">
        <p className="text-gray-400">© {new Date().getFullYear()} Readease. All rights reserved.</p>
      </footer>
    </div>
  );
}