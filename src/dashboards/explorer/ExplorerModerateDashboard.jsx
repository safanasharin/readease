import { useNavigate } from "react-router-dom";
import { Mic, Volume2, Image as ImageIcon, Sparkles, Gift } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function ExplorerModerateDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff0f5] font-sans pb-10 overflow-hidden relative">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 text-6xl opacity-20 transform -rotate-12">🎈</div>
      <div className="absolute top-40 right-10 text-6xl opacity-20 transform rotate-12">🎈</div>
      <div className="absolute bottom-20 left-20 text-6xl opacity-20">🐼</div>

      <div className="pt-24 max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header / Mascot Area */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-[#ffb6c1] shadow-xl transform hover:rotate-12 transition-transform cursor-pointer">
            <span className="text-7xl">🐼</span>
          </div>
          <div className="text-center md:text-left bg-white p-6 rounded-[30px] border-4 border-[#ffe4e1] shadow-lg relative">
            {/* Speech bubble tail */}
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-r-[20px] border-r-white border-b-[10px] border-b-transparent hidden md:block"></div>
            <h1 className="text-3xl md:text-4xl font-black text-[#db7093] mb-2">
              Follow Me!
            </h1>
            <p className="text-xl font-bold text-gray-500">
              Let's play and learn together!
            </p>
          </div>
        </div>

        {/* Guided Pathway */}
        <div className="relative">
          
          {/* Connecting Line */}
          <div className="absolute left-[50px] top-[50px] bottom-[50px] w-4 bg-[#ffb6c1] rounded-full z-0 hidden md:block"></div>

          <div className="space-y-8 relative z-10">
            
            {/* Step 1: Active & Highlighted (Smart Hint) */}
            <div className="flex flex-col md:flex-row items-center gap-6 group">
              <div className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center border-8 border-white shadow-xl z-10 animate-pulse cursor-pointer flex-shrink-0" onClick={() => navigate("/voice-practice")}>
                <span className="text-4xl text-white font-black">1</span>
              </div>
              <div 
                onClick={() => navigate("/voice-practice")}
                className="flex-1 bg-white p-6 rounded-[40px] border-8 border-green-300 shadow-xl cursor-pointer transform hover:scale-105 transition-all flex items-center gap-6"
              >
                <div className="bg-green-100 p-4 rounded-full">
                  <Mic className="text-green-600" size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-green-700">Speak!</h2>
                </div>
                {/* Visual "Smart Hint" Arrow */}
                <div className="ml-auto animate-bounce-horizontal">
                  <span className="text-4xl">👉</span>
                </div>
              </div>
            </div>

            {/* Step 2: Next (Locked/Inactive look) */}
            <div className="flex flex-col md:flex-row items-center gap-6 opacity-60">
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center border-8 border-white shadow-md z-10 flex-shrink-0">
                <span className="text-4xl text-white font-black">2</span>
              </div>
              <div className="flex-1 bg-white p-6 rounded-[40px] border-8 border-gray-200 shadow-sm flex items-center gap-6">
                <div className="bg-gray-100 p-4 rounded-full">
                  <Volume2 className="text-gray-400" size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-400">Match Sound</h2>
                </div>
              </div>
            </div>

            {/* Step 3: Next */}
            <div className="flex flex-col md:flex-row items-center gap-6 opacity-60">
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center border-8 border-white shadow-md z-10 flex-shrink-0">
                <span className="text-4xl text-white font-black">3</span>
              </div>
              <div className="flex-1 bg-white p-6 rounded-[40px] border-8 border-gray-200 shadow-sm flex items-center gap-6">
                <div className="bg-gray-100 p-4 rounded-full">
                  <ImageIcon className="text-gray-400" size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-400">Match Picture</h2>
                </div>
              </div>
            </div>
            
            {/* Final Reward Box */}
            <div className="flex flex-col md:flex-row items-center gap-6 opacity-60 pt-4">
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center border-8 border-white shadow-md z-10 flex-shrink-0">
                <Gift className="text-yellow-100" size={40} />
              </div>
              <div className="flex-1 bg-[#fff8dc] p-6 rounded-[40px] border-8 border-yellow-300 shadow-sm flex items-center gap-6">
                <h2 className="text-3xl font-black text-yellow-600">Surprise Gift!</h2>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
