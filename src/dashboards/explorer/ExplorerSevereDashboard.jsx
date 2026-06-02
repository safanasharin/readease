import { useNavigate } from "react-router-dom";
import { Mic, Volume2, BookOpen, Star, Info, Settings } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function ExplorerSevereDashboard() {
  const navigate = useNavigate();

  const playAudio = (text) => {
    console.log("Playing:", text);
    // Integrate Web Speech API in production
  };

  return (
    <div className="min-h-screen bg-[#fffaeb] font-sans pb-10">
      <Navbar />

      <div className="pt-24 max-w-5xl mx-auto px-6">
        
        {/* BIG Mascot Header - Auto plays on hover or click */}
        <div 
          onClick={() => playAudio("Hello! Let's play a listening game.")}
          className="flex flex-col items-center justify-center mb-16 cursor-pointer group"
        >
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center border-8 border-[#ffc0cb] shadow-2xl mb-6 transform group-hover:scale-110 transition-transform">
            <span className="text-8xl">🐘</span>
          </div>
          <div className="bg-[#fff0f5] px-10 py-4 rounded-full border-4 border-[#ffb6c1] shadow-lg flex items-center gap-4">
            <Volume2 className="text-[#db7093] animate-pulse" size={36} />
            <span className="text-4xl font-black text-[#db7093]">Tap to Listen!</span>
          </div>
        </div>

        {/* Giant Activity Buttons - Audio First */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          
          {/* Card 1 */}
          <div 
            onClick={() => navigate("/voice-practice")}
            className="bg-white rounded-[50px] p-10 border-[12px] border-[#a0c4ff] shadow-2xl cursor-pointer transform hover:scale-105 transition-all text-center flex flex-col items-center relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 opacity-20">
              <Mic size={150} className="text-[#a0c4ff]" />
            </div>
            
            <div className="text-8xl mb-8 relative z-10">🎤</div>
            <button 
              onClick={(e) => { e.stopPropagation(); playAudio("Say the word!"); }}
              className="w-full bg-[#a0c4ff] hover:bg-[#8bb4f8] text-[#003087] font-black text-4xl py-6 rounded-full flex items-center justify-center gap-4 border-b-[8px] border-[#749feb] active:border-b-0 active:mt-[8px] transition-all relative z-10"
            >
              <Volume2 size={40} /> Speak
            </button>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => playAudio("Let's read a story!")}
            className="bg-white rounded-[50px] p-10 border-[12px] border-[#b9fbc0] shadow-2xl cursor-pointer transform hover:scale-105 transition-all text-center flex flex-col items-center relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -left-10 opacity-20">
              <BookOpen size={150} className="text-[#b9fbc0]" />
            </div>
            
            <div className="text-8xl mb-8 relative z-10">📖</div>
            <button 
              onClick={(e) => { e.stopPropagation(); playAudio("Listen to the story!"); }}
              className="w-full bg-[#b9fbc0] hover:bg-[#a0f0a9] text-[#145020] font-black text-4xl py-6 rounded-full flex items-center justify-center gap-4 border-b-[8px] border-[#8ee098] active:border-b-0 active:mt-[8px] transition-all relative z-10"
            >
              <Volume2 size={40} /> Story
            </button>
          </div>
          
        </div>

        {/* ========================================================= */}
        {/* PARENT SUPPORT CENTER - Hidden from child's primary view */}
        {/* ========================================================= */}
        <div className="mt-32 pt-10 border-t-4 border-dashed border-gray-300">
          <div className="bg-[#f8f9fa] rounded-3xl p-8 border-4 border-[#dee2e6]">
            
            <div className="flex items-center gap-3 mb-6 border-b-2 border-gray-200 pb-4">
              <Settings className="text-gray-500" size={28} />
              <h2 className="text-2xl font-black text-[#495057] tracking-wider uppercase">Parent Support Center</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-500 font-bold uppercase text-sm mb-1 flex items-center gap-2"><Info size={16}/> Current Level</h3>
                  <p className="text-xl font-bold text-gray-800">Severe Dyslexia Support</p>
                  <p className="text-gray-600 text-sm">UI is locked to Audio-First Assistance mode.</p>
                </div>
                
                <div>
                  <h3 className="text-gray-500 font-bold uppercase text-sm mb-1">Today's Practice</h3>
                  <p className="text-3xl font-black text-[#339af0]">12 <span className="text-base text-gray-500 font-normal">/ 20 mins</span></p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-[#339af0] h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-500 font-bold uppercase text-sm mb-1">Weekly Progress</h3>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-800">14 Words Spoken</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border-2 border-orange-200">
                <h3 className="font-black text-orange-800 mb-4">Parent Tips for Today</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">1.</span>
                    <p className="text-gray-700 text-sm"><span className="font-bold block text-gray-900">Practice animal names together.</span> Use the "Speak" activity and encourage them to repeat after the Elephant.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">2.</span>
                    <p className="text-gray-700 text-sm"><span className="font-bold block text-gray-900">Read aloud for 10 minutes.</span> Use physical books while pointing at the words.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold">3.</span>
                    <p className="text-gray-700 text-sm"><span className="font-bold block text-gray-900">Encourage without pressure.</span> If they struggle, just let them tap the Listen button again.</p>
                  </li>
                </ul>
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
