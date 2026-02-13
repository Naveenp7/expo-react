import { useState, useEffect, useRef } from 'react';
import CameraFeed from './components/CameraFeed';
import StatusPanel from './components/StatusPanel';
import { useDetection } from './hooks/useDetection';
import { useVoice } from './hooks/useVoice';
import { MessageSquare } from 'lucide-react';

function App() {
  const { webcamRef, canvasRef, personDetected, personCount, isPersonClose, isLoaded: isModelLoaded } = useDetection();
  const {
    isSpeaking,
    transcript,
    response,
    speak,
    startListening
  } = useVoice();

  const [status, setStatus] = useState<'IDLE' | 'WELCOMING' | 'LISTENING' | 'SPEAKING'>('IDLE');
  const [cooldown, setCooldown] = useState(false);
  const welcomeTriggered = useRef(false);

  // State Machine Logic
  useEffect(() => {
    // 1. Person is CLOSE -> Welcome
    if (isPersonClose && !cooldown && !welcomeTriggered.current && status === 'IDLE' && isModelLoaded) {
      triggerWelcome();
    }

    // 2. No visitors -> Reset triggers early if clear for 3 seconds
    if (!personDetected && (cooldown || welcomeTriggered.current)) {
      const resetTimeout = setTimeout(() => {
        setCooldown(false);
        welcomeTriggered.current = false;
        if (status === 'LISTENING') setStatus('IDLE');
        console.log("Area clear: Resetting greeting triggers.");
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }
  }, [isPersonClose, personDetected, cooldown, status, isModelLoaded]);

  const triggerWelcome = () => {
    welcomeTriggered.current = true;
    setStatus('WELCOMING');
    setCooldown(true);

    const welcomeMsg = "Hello! Welcome to our Tech Expo. I am your AI assistant. How can I help you today?";
    speak(welcomeMsg);

    // After welcome, start listening
    setTimeout(() => {
      setStatus('LISTENING');
      startListening();
    }, 5000);

    // Hard fallback reset after 15s if no absence detected
    setTimeout(() => {
      setCooldown(false);
      welcomeTriggered.current = false;
    }, 15000);
  };

  // Sync Voice State with App State
  useEffect(() => {
    if (isSpeaking) {
      setStatus('SPEAKING');
    } else if (status === 'SPEAKING') {
      // If voice stopped, go back to listening or idle
      setStatus('LISTENING');
    }
  }, [isSpeaking]);


  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-cyan-500/30 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-full px-8 py-4 neon-border-cyan">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-500 box-shadow-glow animate-pulse"></div>
            <h1 className="text-2xl font-tech font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-glow">
              MES TECH FEST 2026
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-tech text-cyan-400/80">
            <button
              onClick={startListening}
              className="px-3 py-1 rounded border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              RESTART VOICE
            </button>
            <span>SYS.VER.2.0</span>
            <span className="w-px h-4 bg-white/20"></span>
            <span>AI CORE: ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="pt-28 p-8 h-screen grid grid-cols-12 gap-8 max-w-[1600px] mx-auto">

        {/* Left: Camera Feed (8 cols) */}
        <div className="col-span-8 relative rounded-3xl overflow-hidden glass-panel neon-border-cyan shadow-2xl transition-all duration-500 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)] group">

          {/* Decorative Corner Brackets */}
          <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-500/50 rounded-tl-xl z-20"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-cyan-500/50 rounded-tr-xl z-20"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-cyan-500/50 rounded-bl-xl z-20"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-cyan-500/50 rounded-br-xl z-20"></div>

          <CameraFeed
            webcamRef={webcamRef}
            canvasRef={canvasRef}
            isLoaded={isModelLoaded}
          />

          {/* Scanning Line overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[10%] w-full animate-scan pointer-events-none z-10"></div>

          {/* Live Transcript Overlay */}
          {(transcript || response) && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-4/5 max-w-3xl text-center z-30">
              <div className="glass-panel p-8 rounded-2xl neon-border-purple transition-all duration-300 transform translate-y-0 opacity-100">
                {status === 'SPEAKING' ? (
                  <p className="text-2xl text-cyan-300 font-medium leading-relaxed font-malayalam drop-shadow-md">
                    {response}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-purple-300/80 text-sm uppercase tracking-[0.2em] font-mono-tech mb-2">
                      <MessageSquare className="w-4 h-4 animate-bounce" />
                      Listening to Input...
                    </div>
                    <p className="text-3xl text-white font-medium font-malayalam min-h-[3rem] drop-shadow-lg">
                      {transcript || "..."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Status Panel (4 cols) */}
        <div className="col-span-4 h-full flex flex-col">
          <StatusPanel
            status={status}
            personDetected={personDetected}
            personCount={personCount}
          />
        </div>

      </main>
    </div>
  );
}

export default App;
