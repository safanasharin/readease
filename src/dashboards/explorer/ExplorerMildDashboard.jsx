import { useNavigate } from "react-router-dom";
import { Star, Unlock, Lock, Compass } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function ExplorerMildDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f8ff] font-sans pb-10 overflow-hidden relative">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 text-6xl opacity-20 transform -rotate-12">☁️</div>
      <div className="absolute top-40 right-20 text-6xl opacity-20 transform rotate-12">☁️</div>
      <div className="absolute bottom-20 left-40 text-8xl opacity-10">🌲</div>
      <div className="absolute bottom-10 right-10 text-8xl opacity-10">⛰️</div>

      <div className="pt-24 max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Header / Mascot Area */}
        <div className="flex flex-col items-center justify-center mb-12 animate-bounce-slow">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-[#87ceeb] shadow-xl mb-4 transform hover:scale-110 transition-transform cursor-pointer">
            <span className="text-7xl">🐵</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#4682b4] text-center drop-shadow-md">
            Let's Play!
          </h1>
          
          <div className="mt-6 bg-yellow-300 border-4 border-yellow-400 rounded-full px-6 py-2 flex items-center gap-2 shadow-md">
            <Star className="text-yellow-600 fill-current" size={28} />
            <span className="text-2xl font-black text-yellow-800">3</span>
          </div>
        </div>

        {/* Adventure Map Layout - Highly Visual */}
        <div className="relative bg-[#dcfce7] rounded-[50px] p-8 md:p-12 border-8 border-[#86efac] shadow-2xl">
          
          {/* Path Line (SVG or simple div connections could go here, simulating with layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            {/* Zone 1: Forest */}
            <div 
              onClick={() => navigate("/reader")}
              className="bg-white rounded-[40px] p-6 border-8 border-green-400 shadow-xl cursor-pointer transform hover:-translate-y-4 hover:rotate-2 transition-all group flex flex-col items-center text-center"
            >
              <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">🌲</div>
              <h2 className="text-2xl font-black text-green-700">Letters</h2>
              <div className="mt-4 bg-green-100 rounded-full p-2">
                <Unlock className="text-green-600" size={24} />
              </div>
            </div>

            {/* Zone 2: River */}
            <div 
              onClick={() => navigate("/voice-practice")}
              className="bg-white rounded-[40px] p-6 border-8 border-blue-400 shadow-xl cursor-pointer transform hover:-translate-y-4 hover:-rotate-2 transition-all group flex flex-col items-center text-center md:mt-16"
            >
              <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">🌊</div>
              <h2 className="text-2xl font-black text-blue-700">Animals</h2>
              <div className="mt-4 bg-blue-100 rounded-full p-2">
                <Unlock className="text-blue-600" size={24} />
              </div>
            </div>

            {/* Zone 3: Mountain */}
            <div 
              className="bg-gray-100 rounded-[40px] p-6 border-8 border-gray-300 shadow-inner flex flex-col items-center text-center opacity-70 md:mt-32"
            >
              <div className="text-7xl mb-4 filter grayscale">⛰️</div>
              <h2 className="text-2xl font-black text-gray-500">Colors</h2>
              <div className="mt-4 bg-gray-200 rounded-full p-2">
                <Lock className="text-gray-500" size={24} />
              </div>
            </div>

          </div>
          
          {/* Compass Decoration */}
          <div className="absolute bottom-[-30px] right-[-30px] bg-white rounded-full p-4 border-4 border-yellow-400 shadow-xl hidden md:block">
            <Compass size={64} className="text-yellow-500 animate-pulse" />
          </div>

        </div>

      </div>
    </div>
  );
}
