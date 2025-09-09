import React, { useState, useEffect } from "react";
import { Volume2, Square, Settings, Copy, Sparkles, Zap, Music } from 'lucide-react';

function TTS() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioWaves, setAudioWaves] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  // Generate audio waves animation
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setAudioWaves(prev => prev.map(() => Math.random() * 100));
      }, 150);
      return () => clearInterval(interval);
    } else {
      setAudioWaves([]);
    }
  }, [isSpeaking]);

  useEffect(() => {
    setAudioWaves(Array.from({ length: 20 }, () => 20));
  }, []);

  const handleSpeak = () => {
    if (text.trim() === "") {
      alert("Please enter some text!");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find((v) => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsLoading(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }, 300);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Text Input Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-purple-400" size={24} />
            Your Message
          </h3>
          <div className="text-white/50 text-sm font-medium">
            {text.length} characters
          </div>
        </div>
        
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here and watch it transform into beautiful speech..."
            className="w-full h-40 p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300/50 transition-all duration-300 resize-none text-lg leading-relaxed"
          />
          
          {text && (
            <button
              onClick={copyToClipboard}
              className={`absolute top-4 right-4 p-2 rounded-xl transition-all duration-300 ${
                copied 
                  ? "bg-green-500/80 text-white" 
                  : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
              }`}
            >
              <Copy size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Voice & Controls */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="text-purple-400" size={20} />
              Voice Settings
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 font-medium mb-3">
                  Voice Selection
                </label>
                <div className="relative">
                  <select
                    value={selectedVoice || ""}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300/50 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    {voices.map((voice, idx) => (
                      <option
                        key={idx}
                        value={voice.name}
                        className="bg-gray-800 text-white"
                      >
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-3">
                  Speed: <span className="text-purple-300 font-bold">{rate.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${((rate - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.1) ${((rate - 0.5) / 1.5) * 100}%)`
                  }}
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-3">
                  Pitch: <span className="text-purple-300 font-bold">{pitch.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${((pitch - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.1) ${((pitch - 0.5) / 1.5) * 100}%)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audio Visualization */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Music className="text-pink-400" size={20} />
              Audio Visualization
            </h4>
            
            {/* Audio Waves */}
            <div className="flex items-end justify-center space-x-1 h-32 mb-6">
              {audioWaves.map((height, index) => (
                <div
                  key={index}
                  className={`w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all duration-150 ${
                    isSpeaking ? 'animate-pulse' : ''
                  }`}
                  style={{
                    height: `${isSpeaking ? height : 20}%`,
                    animationDelay: `${index * 50}ms`
                  }}
                />
              ))}
            </div>

            {/* Status Display */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl backdrop-blur-sm border ${
                isSpeaking
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-300/30 text-white"
                  : isLoading
                  ? "bg-orange-500/20 border-orange-300/30 text-orange-200"
                  : "bg-white/5 border-white/20 text-white/60"
              }`}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-orange-300/30 border-t-orange-300 rounded-full animate-spin"></div>
                    <span className="font-medium">Preparing...</span>
                  </>
                ) : isSpeaking ? (
                  <>
                    <Volume2 className="text-purple-400 animate-pulse" size={20} />
                    <span className="font-medium">Speaking...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="text-white/40" size={20} />
                    <span className="font-medium">Ready</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <button
          onClick={handleSpeak}
          disabled={isLoading || isSpeaking || !text.trim()}
          className="group relative px-8 py-4 bg-gradient-to-br from-purple-500/80 to-pink-500/80 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[180px] backdrop-blur-sm border border-purple-300/30"
        >
          <div className="flex items-center justify-center gap-3">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : isSpeaking ? (
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-5 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            ) : (
              <Zap size={20} />
            )}
            <span>
              {isLoading ? "Preparing..." : isSpeaking ? "Speaking..." : "Start Speaking"}
            </span>
          </div>
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        <button
          onClick={handleStop}
          disabled={!isSpeaking && !isLoading}
          className="group relative px-8 py-4 bg-gradient-to-br from-red-500/80 to-pink-500/80 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[140px] backdrop-blur-sm border border-red-300/30"
        >
          <div className="flex items-center justify-center gap-3">
            <Square size={18} />
            <span>Stop</span>
          </div>
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
        }
      `}</style>
    </div>
  );
}

export default TTS;