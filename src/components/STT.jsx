import { 
  Mic, MicOff, Volume2, Copy, Trash2, Zap, MessageSquare, Sparkles, 
  AlertCircle, Settings, Download, Share, RotateCcw, Pause, Play,
  Languages, Clock, Activity, Eye, EyeOff 
} from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";

function STT() {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState("en-US");
  const [sessionTime, setSessionTime] = useState(0);
  const [waveformData, setWaveformData] = useState(Array(30).fill(0));
  const [showSettings, setShowSettings] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState("gradient");
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptRef = useRef(null);
  const sessionStartRef = useRef(null);
  const waveformIntervalRef = useRef(null);

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" },
    { code: "zh-CN", name: "Chinese (Mandarin)" },
    { code: "pt-BR", name: "Portuguese (Brazil)" },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimText = "";
        let avgConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptPart = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcriptPart + " ";
            avgConfidence = result[0].confidence || 0.9;
          } else {
            interimText += transcriptPart;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => {
            const newTranscript = prev + finalTranscript;
            const words = newTranscript.trim().split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length);
            return newTranscript;
          });
        }
        
        setInterimTranscript(interimText);
        if (avgConfidence > 0) setConfidence(avgConfidence);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        }
        setIsListening(false);
        stopAudioVisualization();
      };

      recognitionRef.current.onend = () => {
        if (!isPaused) {
          setIsListening(false);
          setInterimTranscript("");
          stopAudioVisualization();
        }
      };

      setIsSupported(true);
    }
  }, [language, isPaused]);

  // Session timer
  useEffect(() => {
    let interval;
    if (isListening && !isPaused) {
      if (!sessionStartRef.current) {
        sessionStartRef.current = Date.now();
      }
      interval = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }, 1000);
    } else if (!isListening) {
      sessionStartRef.current = null;
      setSessionTime(0);
    }
    return () => clearInterval(interval);
  }, [isListening, isPaused]);

  // Auto-scroll transcript
  useEffect(() => {
    if (autoScroll && transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript, autoScroll]);

  // Advanced audio visualization
  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const waveformArray = new Uint8Array(30);
      
      const updateAudioLevel = () => {
        if (isListening && !isPaused && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average level
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average / 255);
          
          // Update waveform data
          for (let i = 0; i < 30; i++) {
            const index = Math.floor((i / 30) * dataArray.length);
            waveformArray[i] = dataArray[index] || 0;
          }
          setWaveformData([...waveformArray]);
          
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check your permissions.");
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
    setWaveformData(Array(30).fill(0));
  };

  // Enhanced STT Functions
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setIsPaused(false);
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      startAudioVisualization();
    }
  }, [isListening, language]);

  const pauseListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      setIsPaused(true);
      recognitionRef.current.stop();
      stopAudioVisualization();
    }
  }, [isListening]);

  const resumeListening = useCallback(() => {
    if (recognitionRef.current && isPaused) {
      setIsPaused(false);
      recognitionRef.current.start();
      startAudioVisualization();
    }
  }, [isPaused]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsPaused(false);
      stopAudioVisualization();
    }
  }, []);

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
    setWordCount(0);
    setConfidence(0);
    setSessionTime(0);
    sessionStartRef.current = null;
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

  const downloadTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareTranscript = async () => {
    if (navigator.share && transcript) {
      try {
        await navigator.share({
          title: 'Voice Transcript',
          text: transcript,
        });
      } catch (error) {
        copyToClipboard(); // Fallback to copy
      }
    } else {
      copyToClipboard();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getThemeClasses = () => {
    switch (theme) {
      case "minimal":
        return "from-gray-500/80 to-gray-600/80 border-gray-300/30";
      case "ocean":
        return "from-blue-500/80 to-cyan-500/80 border-blue-300/30";
      case "forest":
        return "from-green-500/80 to-emerald-500/80 border-green-300/30";
      default:
        return "from-purple-500/80 to-pink-500/80 border-purple-300/30";
    }
  };

  return (
    <div className="space-y-8">
      {!isSupported ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-red-300/20">
            <AlertCircle size={64} className="text-red-400" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-6">Browser Not Supported</h3>
          <p className="text-white/70 max-w-lg mx-auto text-lg leading-relaxed">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari for the best experience.
          </p>
        </div>
      ) : (
        <>
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <Sparkles className="text-purple-400" size={32} />
                VoiceScribe
              </h2>
              {sessionTime > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white/80">
                  <Clock size={16} />
                  <span className="font-mono">{formatTime(sessionTime)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  showSettings 
                    ? "bg-purple-500/80 text-white border border-purple-300/50" 
                    : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                }`}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Settings</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white/80 font-medium mb-3">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 appearance-none"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-gray-800">
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-3">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full slider"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-3">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 appearance-none"
                  >
                    <option value="gradient" className="bg-gray-800">Purple Gradient</option>
                    <option value="ocean" className="bg-gray-800">Ocean Blue</option>
                    <option value="forest" className="bg-gray-800">Forest Green</option>
                    <option value="minimal" className="bg-gray-800">Minimal Gray</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    autoScroll 
                      ? "bg-green-500/80 text-white border border-green-300/50" 
                      : "bg-white/10 text-white/80 border border-white/20"
                  }`}
                >
                  {autoScroll ? <Eye size={16} /> : <EyeOff size={16} />}
                  <span>Auto Scroll</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Interface */}
          <div className="grid xl:grid-cols-3 gap-8">
            {/* Left - Microphone & Waveform */}
            <div className="xl:col-span-1 space-y-6">
              {/* Microphone Visualization */}
              <div className="relative">
                <div className="flex justify-center">
                  {/* Outer Visual Effects */}
                  {(isListening && !isPaused) && (
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
                      (isListening && !isPaused) ? "scale-110" : "hover:scale-105"
                    }`}
                    onClick={isListening ? (isPaused ? resumeListening : pauseListening) : startListening}
                    style={{
                      transform: (isListening && !isPaused) 
                        ? `scale(${1.1 + audioLevel * 0.15})` 
                        : undefined
                    }}
                  >
                    <div className={`w-full h-full rounded-full backdrop-blur-md border-2 flex items-center justify-center relative ${
                      (isListening && !isPaused)
                        ? `bg-gradient-to-br ${getThemeClasses()} shadow-2xl`
                        : isPaused
                        ? "bg-gradient-to-br from-orange-500/30 to-yellow-500/30 border-orange-300/50 shadow-2xl shadow-orange-500/25"
                        : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 shadow-xl"
                    }`}>
                      
                      <div className={`absolute inset-4 rounded-full border-2 ${
                        (isListening && !isPaused)
                          ? "border-white/40 animate-pulse" 
                          : isPaused
                          ? "border-orange-300/40 animate-pulse"
                          : "border-white/10"
                      }`}></div>
                      
                      <div className="relative z-10 flex flex-col items-center">
                        {isPaused ? (
                          <Play size={64} className="text-white drop-shadow-xl" />
                        ) : (isListening && !isPaused) ? (
                          <>
                            <Mic size={64} className="text-white drop-shadow-xl mb-2" />
                            <div className="flex space-x-1">
                              {waveformData.slice(0, 5).map((height, i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-white/80 rounded-full"
                                  style={{
                                    height: `${Math.max(8, (height / 255) * 24)}px`,
                                    animation: `pulse ${0.5 + i * 0.1}s infinite alternate`
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
                    
                    <div className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full border backdrop-blur-md font-bold text-sm tracking-wider ${
                      (isListening && !isPaused)
                        ? `bg-gradient-to-r ${getThemeClasses()} text-white animate-pulse`
                        : isPaused
                        ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-orange-300/50"
                        : "bg-white/10 text-white/80 border-white/20"
                    }`}>
                      {isPaused ? "⏸️ PAUSED" : (isListening && !isPaused) ? "🎙️ RECORDING" : "⏹️ READY"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Waveform Visualization */}
              <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="text-purple-400" size={20} />
                  Audio Spectrum
                </h4>
                
                <div className="flex items-end justify-center space-x-1 h-32">
                  {waveformData.map((height, index) => (
                    <div
                      key={index}
                      className={`w-2 rounded-full transition-all duration-150 ${
                        (isListening && !isPaused) 
                          ? `bg-gradient-to-t ${getThemeClasses().split(' ')[0]} ${getThemeClasses().split(' ')[1]}`
                          : "bg-gradient-to-t from-gray-600 to-gray-500"
                      }`}
                      style={{
                        height: `${Math.max(4, (height / 255) * 100)}%`,
                        opacity: (isListening && !isPaused) ? 0.8 + (height / 255) * 0.2 : 0.3
                      }}
                    />
                  ))}
                </div>
                
                {(isListening && !isPaused) && (
                  <div className="mt-4 text-center">
                    <div className="text-white/60 text-sm">
                      Input Level: {Math.round(audioLevel * 100)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-3">
                  {!isListening ? (
                    <button
                      onClick={startListening}
                      className={`group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-md border-2 min-w-[180px] bg-gradient-to-r ${getThemeClasses()} text-white hover:scale-105 hover:shadow-xl shadow-lg`}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Zap size={20} />
                        <span>Start Recording</span>
                      </div>
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={isPaused ? resumeListening : pauseListening}
                        className={`group relative px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-md border-2 ${
                          isPaused
                            ? "bg-gradient-to-r from-green-500/80 to-emerald-500/80 border-green-300/50 text-white"
                            : "bg-gradient-to-r from-orange-500/80 to-yellow-500/80 border-orange-300/50 text-white"
                        } hover:scale-105 hover:shadow-xl shadow-lg`}
                      >
                        <div className="flex items-center justify-center gap-3">
                          {isPaused ? <Play size={20} /> : <Pause size={20} />}
                          <span>{isPaused ? "Resume" : "Pause"}</span>
                        </div>
                      </button>
                      
                      <button
                        onClick={stopListening}
                        className="group relative px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-md border-2 bg-gradient-to-r from-red-500/80 to-pink-500/80 border-red-300/50 text-white hover:scale-105 hover:shadow-xl shadow-lg"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-3 h-3 bg-white rounded-sm"></div>
                          <span>Stop</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {transcript && (
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        copied 
                          ? "bg-green-500/80 text-white border border-green-300/50" 
                          : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      <Copy size={16} />
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                    
                    <button
                      onClick={downloadTranscript}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 border border-blue-300/20 font-medium transition-all duration-300"
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                    
                    <button
                      onClick={shareTranscript}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 border border-green-300/20 font-medium transition-all duration-300"
                    >
                      <Share size={16} />
                      <span>Share</span>
                    </button>
                    
                    <button
                      onClick={clearTranscript}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 border border-red-300/20 font-medium transition-all duration-300"
                    >
                      <Trash2 size={16} />
                      <span>Clear</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right - Stats & Transcript */}
            <div className="xl:col-span-2 space-y-6">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <p className="text-white/60 text-sm font-medium">Characters</p>
                      <p className="text-2xl font-bold text-white">{transcript.length}</p>
                    </div>
                    <Sparkles className="text-pink-400" size={24} />
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm font-medium">Accuracy</p>
                      <p className="text-2xl font-bold text-white">{Math.round(confidence * 100)}%</p>
                    </div>
                    <Activity className="text-green-400" size={24} />
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm font-medium">Language</p>
                      <p className="text-lg font-bold text-white">
                        {languages.find(l => l.code === language)?.name.split(' ')[0] || 'EN'}
                      </p>
                    </div>
                    <Languages className="text-blue-400" size={24} />
                  </div>
                </div>
              </div>

              {/* Enhanced Transcript Display */}
              <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden min-h-[500px]">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Live Transcript</h3>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Languages size={16} />
                    <span>{languages.find(l => l.code === language)?.name}</span>
                  </div>
                </div>

                <div 
                  ref={transcriptRef}
                  className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {transcript || interimTranscript ? (
                    <div className="text-white leading-relaxed">
                      <div className="whitespace-pre-wrap">
                        {transcript.split('\n').map((line, index) => (
                          <p key={index} className="mb-2 text-white">
                            {line}
                          </p>
                        ))}
                      </div>
                      {interimTranscript && (
                        <div className="text-purple-300/80 italic font-medium inline">
                          {interimTranscript}
                          {(isListening && !isPaused) && (
                            <span className="animate-pulse text-pink-400 ml-1 font-bold">|</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                        <Mic size={40} className="text-purple-400" />
                      </div>
                      <p className="text-white/50 text-xl font-medium mb-2">
                        {isPaused
                          ? "Recording paused..."
                          : (isListening && !isPaused)
                          ? "Listening... Start speaking!"
                          : "Ready to transcribe your voice"}
                      </p>
                      <p className="text-white/30 text-sm">
                        {isPaused
                          ? "Click the microphone to resume"
                          : isListening
                          ? `Powered by ${languages.find(l => l.code === language)?.name || 'Speech Recognition'}`
                          : "Click the microphone to begin recording"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Footer */}
                {(isListening || transcript) && (
                  <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-white/60">
                        <span>{wordCount} words</span>
                        <span>•</span>
                        <span>{transcript.length} characters</span>
                        {sessionTime > 0 && (
                          <>
                            <span>•</span>
                            <span>{formatTime(sessionTime)} elapsed</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {confidence > 0 && (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              confidence > 0.8 ? 'bg-green-400' : 
                              confidence > 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                            <span className="text-white/60">{Math.round(confidence * 100)}% accuracy</span>
                          </div>
                        )}
                        
                        {(isListening && !isPaused) && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-red-300 font-medium">LIVE</span>
                          </div>
                        )}
                        
                        {isPaused && (
                          <div className="flex items-center gap-1">
                            <Pause size={14} className="text-orange-400" />
                            <span className="text-orange-300 font-medium">PAUSED</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Audio Level Progress Bar */}
                    {(isListening && !isPaused) && (
                      <div className="mt-2">
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-100 rounded-full bg-gradient-to-r ${
                              audioLevel > 0.7 ? 'from-red-400 to-red-500' :
                              audioLevel > 0.4 ? 'from-yellow-400 to-orange-500' :
                              'from-green-400 to-emerald-500'
                            }`}
                            style={{ width: `${audioLevel * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions Panel */}
              {transcript && (
                <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white">Quick Actions</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const words = transcript.split(' ');
                          const sentences = transcript.split(/[.!?]+/).filter(s => s.trim());
                          alert(`📊 Statistics:\n\n• ${words.length} words\n• ${sentences.length} sentences\n• ${transcript.length} characters\n• Average sentence length: ${Math.round(words.length / sentences.length)} words\n• Estimated reading time: ${Math.ceil(words.length / 200)} minutes`);
                        }}
                        className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 border border-purple-300/20 font-medium transition-all duration-300"
                      >
                        View Stats
                      </button>
                      
                      <button
                        onClick={() => {
                          const formattedText = transcript
                            .replace(/\s+/g, ' ')
                            .replace(/([.!?])\s*/g, '$1\n\n')
                            .trim();
                          setTranscript(formattedText);
                        }}
                        className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 border border-blue-300/20 font-medium transition-all duration-300"
                      >
                        Format Text
                      </button>
                      
                      <button
                        onClick={clearTranscript}
                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 border border-red-300/20 font-medium transition-all duration-300"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Floating Status Indicator */}
          {(isListening || isPaused) && (
            <div className="fixed bottom-6 right-6 z-50">
              <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-md border shadow-2xl ${
                isPaused
                  ? "bg-orange-500/20 border-orange-300/30 text-orange-200"
                  : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-300/30 text-white"
              }`}>
                {isPaused ? (
                  <>
                    <Pause className="animate-pulse" size={20} />
                    <div>
                      <div className="font-bold">Recording Paused</div>
                      <div className="text-sm opacity-80">Click mic to resume</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Mic className="animate-pulse" size={20} />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                    <div>
                      <div className="font-bold">Recording Live</div>
                      <div className="text-sm opacity-80">{formatTime(sessionTime)}</div>
                    </div>
                  </>
                )}
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
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
          transition: all 0.3s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 6px 16px rgba(168, 85, 247, 0.6);
          transform: scale(1.1);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default STT;