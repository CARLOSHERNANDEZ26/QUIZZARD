"use client";
import { useState, useEffect } from "react";
import { Press_Start_2P } from 'next/font/google';
import { useRouter } from 'next/navigation';

const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

export default function Home() {
  const [showCodeModal, setShowCodeModal] = useState(false);
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

  const handleCodeSubmit = () => {
    if (!username) {
      alert("PLEASE ENTER YOUR NAME");
      return;
    }
    // The code to access category page - you can change this
    if (code === "QUIZ2026") {
      setShowCodeModal(false);
      setCode("");
      setUsername("");
      router.push(`/category?user=${username}`);
    } else {
      alert("INVALID CODE - ACCESS DENIED");
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-purple-950 text-white font-sans flex flex-col items-center justify-start py-12 px-6 relative overflow-y-auto overflow-x-hidden gap-8">
      {/* BACKGROUND IMAGE */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/quizzard_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(5px)'
        }}
      />

      {/* PLAY BUTTON */}
      <div className="z-20 flex flex-col items-center justify-center flex-1">
        <button
          onClick={() => setShowCodeModal(true)}
          className={`${pressStart2P.className} px-16 py-8 text-4xl md:text-6xl font-black uppercase border-4 border-cyan-400 text-cyan-400 bg-black/80 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_50px_rgba(34,211,238,0.8)] transition-all hover:scale-105 animate-pulse`}
        >
          PLAY
        </button>
      </div>

      {/* FOOTER */}
      <div className="z-20 w-full max-w-sm mt-4 border-2 border-cyan-400 bg-slate-950/90 p-4 rounded-lg">
        <p className="text-cyan-400 font-mono text-xs text-center">quizzardbyodevs@gmail.com</p>
      </div>

      {/* CODE ENTRY MODAL */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="border-4 border-cyan-400 p-8 bg-black w-full max-w-xs shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            <h2 className={`${pressStart2P.className} text-cyan-400 mb-6 text-center text-sm uppercase`}>ENTER DETAILS</h2>
            
            <label className={`${pressStart2P.className} block text-cyan-600 text-[10px] mb-2 uppercase`}>Username:</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              className="w-full bg-black border-2 border-cyan-800 p-4 text-cyan-400 text-center mb-4 outline-none focus:border-cyan-400 uppercase"
              placeholder="NAME..."
              autoFocus
            />
            
            <label className={`${pressStart2P.className} block text-cyan-600 text-[10px] mb-2 uppercase`}>Access Code:</label>
            <input 
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-black border-2 border-cyan-800 p-4 text-cyan-400 text-center mb-6 outline-none focus:border-cyan-400 uppercase"
              placeholder="CODE..."
              onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
            />
            
            <div className="flex gap-2">
              <button onClick={handleCodeSubmit} className={`${pressStart2P.className} flex-1 border-2 border-cyan-500 py-3 text-[10px] text-cyan-400 hover:bg-cyan-500/20`}>ENTER</button>
              <button onClick={() => {setShowCodeModal(false); setCode(""); setUsername("");}} className={`${pressStart2P.className} flex-1 border-2 border-slate-800 py-3 text-[10px] text-slate-500`}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}