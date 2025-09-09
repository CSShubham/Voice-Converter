import { Mic, MicOff, Volume2, Copy, Trash2, Zap, MessageSquare, Sparkles, AlertCircle } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

function STT() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimText = "";
        let avgConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptPart = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcriptPart;
            avgConfidence = result[0].confidence || 0.9;
          } else {
            interimText += transcriptPart;
          }
        }

        setTranscript((prev) => {
          const newTranscript = prev + finalTranscript;
          setWordCount(newTranscript.trim().split(/\s+/).filter(word => word.length > 0).length);
          return newTranscript;
        });
        setInterimTranscript(interimText);
        setConfidence(avgConfidence);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        stopAudioVisualization();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
        stopAudioVisualization();
      };

      setIsSupported(true);
    }
  }, []);

  // Audio visualization
  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (isListening && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average / 255);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopAudioVisualization = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  // STT Functions
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
      startAudioVisualization();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      stopAudioVisualization();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    setWordCount(0);
    setConfidence(0);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="space-y-8">
      {!isSupported ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-red-300/20">
            <AlertCircle size={64} className="text-red-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-6">
            Browser Not Supported
          </h3>
          <p className="text-white/70 max-w-lg mx-auto text-lg leading-relaxed">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari for the best experience.
          </p>
        </div>
      ) : (
        <>
          {/* Main Interface Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - Microphone & Controls */}
            <div className="space-y-6">
              {/* Microphone Visualization */}
              <div className="relative">
                <div className="flex justify-center">
                  {/* Outer Visual Effects */}
                  {isListening && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 animate-ping"></div>
                      </div>
                    </>
                  )}
                  
                  {/* Main Microphone Button */}
                  <div
                    className={`relative w-48 h-48 cursor-pointer transition-all duration-500 ${
                      isListening ? "scale-110" : "hover:scale-105"
                    }`}
                    onClick={isListening ? stopListening : startListening}
                    style={{
                      transform: isListening 
                        ? `scale(${1.1 + audioLevel * 0.15})` 
                        : undefined
                    }}
                  >
                    {/* Glassmorphic Container */}
                    <div className={`w-full h-full rounded-full backdrop-blur-md border-2 flex items-center justify-center relative ${
                      isListening
                        ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-300/50 shadow-2xl shadow-purple-500/25"
                        : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 shadow-xl"
                    }`}>
                      
                      {/* Inner Glow Ring */}
                      <div className={`absolute inset-4 rounded-full border-2 ${
                        isListening 
                          ? "border-white/40 animate-pulse" 
                          : "border-white/10"
                      }`}></div>
                      
                      {/* Microphone Icon */}
                      <div className="relative z-10 flex flex-col items-center">
                        {isListening ? (
                          <>
                            <Mic size={64} className="text-white drop-shadow-xl mb-2" />
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-white/80 rounded-full animate-pulse"
                                  style={{
                                    height: `${8 + (audioLevel * 20) + (Math.sin(Date.now() / 200 + i) * 8)}px`,
                                    animationDelay: `${i * 0.1}s`
                                  }}
                                />
                              ))}
                            </div>
                          </>
                        ) : (
                          <MicOff size={64} className="text-white/70" />
                        )}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full border backdrop-blur-md font-bold text-sm tracking-wider ${
                      isListening
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300/50 animate-pulse"
                        : "bg-white/10 text-white/80 border-white/20"
                    }`}>
                      {isListening ? "🎙️ RECORDING" : "⏸️ READY"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-md border-2 min-w-[180px] ${
                    isListening
                      ? "bg-gradient-to-r from-red-500/80 to-pink-500/80 border-red-300/50 text-white hover:from-red-600/80 hover:to-pink-600/80 shadow-lg shadow-red-500/25"
                      : "bg-gradient-to-r from-purple-500/80 to-pink-500/80 border-purple-300/50 text-white hover:from-purple-600/80 hover:to-pink-600/80 shadow-lg shadow-purple-500/25"
                  } hover:scale-105 hover:shadow-xl`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {isListening ? (
                      <>
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        <span>Start Recording</span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Audio Level Indicator */}
              {isListening && (
                <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <Volume2 size={20} className="text-white/70" />
                    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-100 rounded-full"
                        style={{ width: `${audioLevel * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white/70 text-sm font-medium min-w-[3rem]">
                      {Math.round(audioLevel * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Transcript & Stats */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm font-medium">Words</p>
                      <p className="text-2xl font-bold text-white">{wordCount}</p>
                    </div>
                    <MessageSquare className="text-purple-400" size={24} />
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm font-medium">Accuracy</p>
                      <p className="text-2xl font-bold text-white">{Math.round(confidence * 100)}%</p>
                    </div>
                    <Sparkles className="text-pink-400" size={24} />
                  </div>
                </div>
              </div>

              {/* Transcript Display */}
              <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Live Transcript</h3>
                  {transcript && (
                    <div className="flex space-x-2">
                      <button
                        onClick={copyToClipboard}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                          copied 
                            ? "bg-green-500/80 text-white border border-green-300/50" 
                            : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                        }`}
                      >
                        <Copy size={16} />
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </button>
                      <button
                        onClick={clearTranscript}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 border border-red-300/20 font-medium transition-all duration-300"
                      >
                        <Trash2 size={16} />
                        <span>Clear</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {transcript || interimTranscript ? (
                    <div className="text-white text-lg leading-relaxed">
                      <span className="text-white">{transcript}</span>
                      <span className="text-purple-300/80 italic font-medium">
                        {interimTranscript}
                      </span>
                      {isListening && (
                        <span className="animate-pulse text-pink-400 ml-1 font-bold">|</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                        <Mic size={32} className="text-purple-400" />
                      </div>
                      <p className="text-white/50 text-lg font-medium mb-2">
                        {isListening
                          ? "Listening... Start speaking!"
                          : "Ready to transcribe your voice"}
                      </p>
                      <p className="text-white/30 text-sm">
                        Click the microphone to begin
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Character Count */}
          {transcript && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white/60 text-sm">
                <span>{transcript.length} characters</span>
                <span>•</span>
                <span>{wordCount} words</span>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
        }
      `}</style>
    </div>
  );
}