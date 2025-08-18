import { useState } from "react";
import TTS from "./components/TTS";
import STT from "./components/STT";
import { AudioWaveform, Megaphone, MicVocal } from 'lucide-react';
function App() {
  const [activeTab, setActiveTab] = useState("tts");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">

      <div className="relative z-10 w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-3xl"><AudioWaveform size={45} className="text-white"/></span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              Voice Converter
            </h1>
            <p className="text-white/70 text-lg">
              Transform text to speech and speech to text
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setActiveTab("tts")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "tts"
                  ? "bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-center flex items-center justify-center gap-3"><Megaphone size={24}/> Text To Speech</span>
            </button>
            <button
              onClick={() => setActiveTab("stt")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "stt"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-center flex items-center justify-center gap-2"><MicVocal size={24}/> Speech to Text</span>
            </button>
          </div>

          {/* TTS Content */}
          {activeTab === "tts" && <TTS />}

          {/* STT Content */}
          {activeTab === "stt" && <STT />}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/50">
          <p className="text-sm">
            Built with Web Speech API • Modern voice technology
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
