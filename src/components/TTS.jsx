import React, { useState, useEffect } from "react";
import { MicVocal, OctagonX, SquareStop, Volume2 } from 'lucide-react';
function TTS() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[10].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

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
  return (
    <>
      <div className="space-y-6">
        {/* Text Input */}
        <div>
          <label className="block text-white/90 font-medium mb-3 text-lg">
            Your Message
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here and watch it come to life..."
              className="w-full h-36 p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 resize-none text-lg"
            />
            <div className="absolute bottom-3 right-3 text-white/50 text-sm">
              {text.length} characters
            </div>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-white/90 font-medium mb-3 text-lg">
              Voice
            </label>
            <div className="relative">
              <select
                value={selectedVoice || ""}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
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
                <svg
                  className="w-5 h-5 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Speed and Pitch Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-white/90 font-medium mb-2">
                Speed:{" "}
                <span className="text-purple-300 font-bold">
                  {rate.toFixed(1)}x
                </span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div>
              <label className="block text-white/90 font-medium mb-2">
                Pitch:{" "}
                <span className="text-purple-300 font-bold">
                  {pitch.toFixed(1)}
                </span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        {/* TTS Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleSpeak}
            disabled={isLoading || isSpeaking}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[140px]"
          >
            <div className="flex items-center justify-center gap-3">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isSpeaking ? (
                <div className="flex gap-1">
                  <div className="w-1 h-5 bg-white rounded-full animate-pulse"></div>
                  <div className="w-1 h-5 bg-white rounded-full animate-pulse animation-delay-200"></div>
                  <div className="w-1 h-5 bg-white rounded-full animate-pulse animation-delay-400"></div>
                </div>
              ) : (
                <span className="text-xl"><Volume2/></span>
              )}
              <span>
                {isLoading
                  ? "Preparing..."
                  : isSpeaking
                  ? "Speaking..."
                  : "Speak"}
              </span>
            </div>
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={handleStop}
            className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[140px]"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl"><OctagonX/></span>
              <span>Stop</span>
            </div>
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </>
  );
}

export default TTS;
