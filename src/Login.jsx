import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { getHubRoute, getAssessmentRoute } from "./adaptive-engine/interventionEngine";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setAge("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.user, data.token);

        alert("Login successful");
        clearForm();
        
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
          navigate(getAssessmentRoute(data.user?.ageGroup));
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || age === "") {
      alert("Please fill all fields");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 4 || ageNum > 14) {
      alert("Age must be between 4 and 14");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          age,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        alert("Signup successful! Let's start with a quick reading assessment.");
        clearForm();
        navigate(getAssessmentRoute(data.user?.ageGroup));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        {isLogin ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-3 border rounded"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-3 border rounded"
              />

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded"
              >
                Login
              </button>
            </form>

            <p className="mt-3 text-sm text-center">
              Don't have an account?{" "}
              <span
                onClick={() => {
                  clearForm();
                  setIsLogin(false);
                }}
                className="text-teal-600 cursor-pointer"
              >
                Sign Up
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>

            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mb-3 border rounded"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-3 border rounded"
              />

              <label htmlFor="age" className="block mb-1 font-medium">Age</label>
              <input
                type="number"
                id="age"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="4"
                max="14"
                className="w-full p-3 mb-3 border rounded"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-3 border rounded"
              />

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded"
              >
                Create Account
              </button>
            </form>

            <p className="mt-3 text-sm text-center">
              Already have an account?{" "}
              <span
                onClick={() => {
                  clearForm();
                  setIsLogin(true);
                }}
                className="text-teal-600 cursor-pointer"
              >
                Login
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}