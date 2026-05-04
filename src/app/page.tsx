"use client";
import { useState, useEffect } from "react";
import { Press_Start_2P } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

// THE SOUND ENGINE (For UI clicks only. BGM is handled globally now!)
const playSFX = (soundFile: string) => {
  if (typeof window !== 'undefined') {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.play().catch((err) => console.log("Audio blocked:", err));
  }
};

export default function Home() {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false); 
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0); 
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-purple-950" />; 
  }

  const handleCodeSubmit = async () => {
    playSFX('ClickSound.mp3');
    if (!username) {
      setErrorMessage("PLEASE ENTER YOUR NAME");
      setShowErrorModal(true);
      return;
    }
    
    // Check if username already exists in database
    try {
      const { data: existingUser, error } = await supabase
        .from('match_results')
        .select('username')
        .eq('username', username)
        .limit(1);
      
      if (error) {
        console.error("Database error:", error);
        setErrorMessage("DATABASE ERROR - PLEASE TRY AGAIN");
        setShowErrorModal(true);
        return;
      }
      
      // If user exists, show duplicate name modal
      if (existingUser && existingUser.length > 0) {
        setErrorMessage(`USERNAME "${username}" ALREADY EXISTS - PLEASE CHOOSE A DIFFERENT NAME`);
        setShowErrorModal(true);
        return;
      }
    } catch (err) {
      console.error("Error checking username:", err);
      setErrorMessage("ERROR VALIDATING USERNAME - PLEASE TRY AGAIN");
      setShowErrorModal(true);
      return;
    }
    
    // The code to access category page
    if (code.toUpperCase() === "EXPO2026") {
      setShowCodeModal(false);
      setCode("");
      setUsername("");
      router.push(`/category?user=${username}`);
    } else {
      setErrorMessage("INVALID CODE - ACCESS DENIED");
      setShowErrorModal(true);
    }
  };

  return (
    <main className="min-h-screen bg-purple-950 text-white font-sans flex flex-col items-center justify-start pt-32 pb-12 px-6 relative overflow-y-auto overflow-x-hidden gap-8">
      {/* BACKGROUND IMAGE */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/quizzard_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
         
        }}
      />

      <div className="z-20 flex flex-col items-center justify-center flex-1 gap-8">
        <button
          onMouseEnter={() => playSFX('ClickSound.mp3')}
          onClick={() => { playSFX('ClickSound.mp3'); setShowCodeModal(true); }}
          className={`${pressStart2P.className} px-16 py-8 text-4xl md:text-6xl font-black uppercase border-4 border-cyan-400 text-cyan-400 bg-black/80 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_50px_rgba(34,211,238,0.8)] transition-all hover:scale-105 animate-pulse`}
        >
          PLAY
        </button>

        <button
          onMouseEnter={() => playSFX('ClickSound.mp3')}
          onClick={() => { playSFX('ClickSound.mp3'); router.push('/leaderboard'); }}
          className={`${pressStart2P.className} px-8 py-4 text-xl md:text-2xl font-bold uppercase border-4 border-yellow-400 text-yellow-400 bg-black/80 shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.7)] transition-all hover:scale-105`}
        >
          LEADERBOARD
        </button>
      </div>

      <div className="z-20 w-full max-w-sm mt-4 border-2 border-cyan-400 bg-slate-950/90 p-4 rounded-lg">
        <p className="text-cyan-400 font-mono text-xs text-center">quizzardbyodevs@gmail.com</p>
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="border-4 border-cyan-400 p-8 bg-black w-full max-w-xs shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            <h2 className={`${pressStart2P.className} text-cyan-400 mb-6 text-center text-sm uppercase`}>ENTER DETAILS</h2>
            
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              className="w-full bg-black border-2 border-cyan-800 p-4 text-cyan-400 text-center mb-4 outline-none focus:border-cyan-400 uppercase"
              placeholder="NAME..."
              autoFocus
            />
            
            <input 
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-black border-2 border-cyan-800 p-4 text-cyan-400 text-center mb-6 outline-none focus:border-cyan-400 uppercase"
              placeholder="CODE..."
              onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
            />
            
            <div className="flex gap-2">
              <button onMouseEnter={() => playSFX('ClickSound.mp3')} onClick={handleCodeSubmit} className={`${pressStart2P.className} flex-1 border-2 border-cyan-500 py-3 text-[10px] text-cyan-400 hover:bg-cyan-500/20`}>ENTER</button>
              <button onMouseEnter={() => playSFX('ClickSound.mp3')} onClick={() => {setShowCodeModal(false); setCode(""); setUsername("");}} className={`${pressStart2P.className} flex-1 border-2 border-slate-800 py-3 text-[10px] text-slate-500`}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="border-4 border-red-500 p-8 bg-black w-full max-w-xs shadow-[0_0_30px_rgba(239,68,68,0.4)]">
            <h2 className={`${pressStart2P.className} text-red-500 mb-4 text-center text-sm uppercase`}>ERROR</h2>
            <p className={`${pressStart2P.className} text-white mb-6 text-center text-xs`}>
              {errorMessage}
            </p>
            <button 
              onMouseEnter={() => playSFX('ClickSound.mp3')}
              onClick={() => setShowErrorModal(false)} 
              className={`${pressStart2P.className} w-full border-2 border-red-500 py-3 text-[10px] text-red-400 hover:bg-red-500/20`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}