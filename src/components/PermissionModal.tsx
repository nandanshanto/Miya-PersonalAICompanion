import React from 'react';
import { motion } from 'motion/react';
import { MicOff, MessageSquare, RefreshCw, Volume2 } from 'lucide-react';

interface Props {
  assistantName?: string;
  errorType?: "blocked" | "not_found" | "generic";
  errorMessage?: string;
  onClose: () => void;
  onContinueTextOnly?: () => void;
  onRetryMic?: () => void;
}

export default function PermissionModal({
  assistantName,
  errorType = "generic",
  errorMessage,
  onClose,
  onContinueTextOnly,
  onRetryMic,
}: Props) {
  const companionName = assistantName?.trim() || "Your virtual companion";
  const isNotFound = errorType === "not_found";

  const handleContinueText = () => {
    if (onContinueTextOnly) {
      onContinueTextOnly();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#141620] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isNotFound ? "from-cyan-500 via-violet-500 to-pink-500" : "from-red-500 to-orange-500"}`} />
        
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isNotFound ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400" : "bg-red-500/15 border border-red-500/30 text-red-400"}`}>
          {isNotFound ? <Volume2 size={30} /> : <MicOff size={30} />}
        </div>
        
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
          {isNotFound ? "No Microphone Detected" : "Microphone Access Blocked"}
        </h2>
        
        <p className="text-white/70 text-xs sm:text-sm mb-5 leading-relaxed">
          {isNotFound ? (
            <>
              No audio input hardware was found on your device or browser. Don't worry — you can chat with <strong>{companionName}</strong> in <strong>Text & Voice Mode</strong>! She will speak back to you aloud.
            </>
          ) : (
            <>
              Your browser has blocked microphone permissions. <strong>{companionName}</strong> cannot hear your voice until it is enabled, or you can continue chatting in Text & Voice mode.
            </>
          )}
        </p>
        
        {isNotFound ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-left w-full mb-6 space-y-2">
            <p className="text-xs text-white/90 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Text & Voice Mode is ready:
            </p>
            <ul className="text-[11px] sm:text-xs text-white/60 space-y-1 list-disc pl-4">
              <li>Type any message into the chat bar.</li>
              <li>{companionName} will answer immediately with her real voice.</li>
              <li>You can plug in a microphone anytime to speak freely.</li>
            </ul>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-left w-full mb-6">
            <p className="text-xs text-white/90 font-medium mb-1.5">How to allow microphone:</p>
            <ol className="text-[11px] sm:text-xs text-white/60 list-decimal pl-4 space-y-1">
              <li>Click the <strong>lock icon (🔒)</strong> or <strong>tune icon (⚙️)</strong> next to the URL in your browser.</li>
              <li>Find <strong>Microphone</strong> and set it to <strong>Allow</strong>.</li>
              <li>Tap Retry or refresh this page.</li>
            </ol>
          </div>
        )}
        
        <div className="flex flex-col w-full gap-2.5">
          <button 
            type="button"
            onClick={handleContinueText}
            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <MessageSquare size={16} />
            Continue in Text & Voice Mode
          </button>
          
          {onRetryMic && (
            <button 
              type="button"
              onClick={onRetryMic}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white/90 font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={15} />
              Retry Microphone Detection
            </button>
          )}

          {!isNotFound && (
            <button 
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white/90 font-medium text-xs sm:text-sm rounded-xl transition-colors"
            >
              I've allowed it, Refresh Page
            </button>
          )}

          <button 
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 bg-transparent text-white/50 hover:text-white/80 text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
