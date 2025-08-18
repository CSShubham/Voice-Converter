import { Mic, MicOff, MicVocal } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

function STT() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

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

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimText += transcriptPart;
          }
        }

        setTranscript((prev) => prev + finalTranscript);
        setInterimTranscript(interimText);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      setIsSupported(true);
    }
  }, []);
  // STT Functions
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
  };

  return (
    <>
      <div className="space-y-6">
        {!isSupported ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Speech Recognition Not Supported
            </h3>
            <p className="text-white/70">
              Your browser doesn't support speech recognition. Please use
              Chrome, Edge, or Safari.
            </p>
          </div>
        ) : (
          <>
            {/* Microphone Visualization */}
            <div className="flex justify-center mb-6">
              <div
                className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? "bg-gradient-to-r from-red-400 to-pink-500 shadow-lg shadow-red-500/30 scale-110"
                    : "bg-gradient-to-r from-blue-400 to-cyan-500 hover:scale-105"
                }`}
              >
                <span className="text-4xl">{isListening ? <Mic size={45}/> : <MicOff size={45}/>}</span>
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                )}
              </div>
            </div>

            {/* Transcript Display */}
            <div>
              <label className="block text-white/90 font-medium mb-3 text-lg">
                Transcript
              </label>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 min-h-[150px] backdrop-blur-sm">
                {transcript || interimTranscript ? (
                  <div className="text-white text-lg leading-relaxed">
                    <span className="text-white">{transcript}</span>
                    <span className="text-white/60 italic">
                      {interimTranscript}
                    </span>
                    {isListening && (
                      <span className="animate-pulse text-cyan-300">|</span>
                    )}
                  </div>
                ) : (
                  <p className="text-white/50 text-center py-8 text-lg">
                    {isListening
                      ? "Listening... Speak now!"
                      : "Your speech will appear here"}
                  </p>
                )}
              </div>
            </div>

            {/* STT Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`group relative px-8 py-4 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[140px] ${
                  isListening
                    ? "bg-gradient-to-r from-red-500 to-pink-500"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  {isListening ? (
                    <>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl"><MicVocal/></span>
                      <span>Start Listening</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {transcript && (
                <>
                  <button
                    onClick={clearTranscript}
                    className="group relative px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">🗑️</span>
                      <span>Clear</span>
                    </div>
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="group relative px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">📋</span>
                      <span>Copy</span>
                    </div>
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default STT;
