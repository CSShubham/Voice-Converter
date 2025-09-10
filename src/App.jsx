import { useState, useEffect } from "react";
import TTS from "./components/TTS";
import STT from "./components/STT";
import { AudioWaveform, Megaphone, MicVocal, Sparkles } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState("tts");
  // const [particles, setParticles] = useState([]);

  // Generate floating particles
  // useEffect(() => {
  //   const generateParticles = () => {
  //     const newParticles = [];
  //     for (let i = 0; i < 30; i++) {
  //       newParticles.push({
  //         id: i,
  //         x: Math.random() * 100,
  //         y: Math.random() * 100,
  //         size: Math.random() * 3 + 1,
  //         speedX: (Math.random() - 0.5) * 0.3,
  //         speedY: (Math.random() - 0.5) * 0.3,
  //         opacity: Math.random() * 0.4 + 0.1,
  //       });
  //     }
  //     setParticles(newParticles);
  //   };

  //   generateParticles();
  //   const interval = setInterval(() => {
  //     setParticles(prev => prev.map(particle => ({
  //       ...particle,
  //       x: (particle.x + particle.speedX + 100) % 100,
  //       y: (particle.y + particle.speedY + 100) % 100,
  //     })));
  //   }, 100);

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20"></div>
      
      {/* Floating Particles */}
      {/* <div className="absolute inset-0">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
              transform: `scale(${particle.size})`,
            }}
          />
        ))}
      </div> */}

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          {/* Main Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="text-center py-12 px-8 border-b border-white/10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-500/80 to-pink-500/80 rounded-2xl backdrop-blur-sm border border-purple-300/30">
                  <AudioWaveform size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    SpeakFlow
                  </h1>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Sparkles size={16} className="text-purple-400" />
                    <span className="text-purple-300 font-medium">AI Powered</span>
                  </div>
                </div>
              </div>
              <p className="text-white/60 text-xl font-medium">
                Transform text to speech and speech to text with cutting-edge AI
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="px-8 pt-8">
              <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
                <button
                  onClick={() => setActiveTab("tts")}
                  className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-500 ${
                    activeTab === "tts"
                      ? "bg-gradient-to-br from-purple-500/80 to-pink-500/80 text-white shadow-lg shadow-purple-500/25 transform scale-[1.02] border border-purple-300/30"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Megaphone size={24} />
                    <span>Text To Speech</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("stt")}
                  className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg transition-all duration-500 ${
                    activeTab === "stt"
                      ? "bg-gradient-to-br from-purple-500/80 to-pink-500/80 text-white shadow-lg shadow-purple-500/25 transform scale-[1.02] border border-purple-300/30"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <MicVocal size={24} />
                    <span>Speech To Text</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
              <div className="min-h-[500px]">
                {activeTab === "tts" && <TTS />}
                {activeTab === "stt" && <STT />}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-white/40">
            <p className="text-sm font-medium">
              Built with Web Speech API • Powered by Modern AI Technology
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;