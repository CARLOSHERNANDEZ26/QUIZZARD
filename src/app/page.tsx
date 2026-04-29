"use client";
import { useState, useEffect } from "react";
import { Press_Start_2P } from 'next/font/google';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

export default function Home() {
  const [username, setUsername] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const router = useRouter();
  
const [mounted, setMounted] = useState(false); 
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0); 
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-purple-950" />; 
  }

  const handleUnlock = () => {
    if (adminPin === "2026") {
      setIsPaid(true);
      setShowAdminModal(false);
      setAdminPin("");
    } else {
      alert("SYSTEM ERROR: CRITICAL SECURITY VIOLATION - TERMINAL LOCKED");
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-purple-950 text-white font-sans flex flex-col items-center justify-start py-12 px-6 relative overflow-y-auto overflow-x-hidden gap-8">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-950 to-black pointer-events-none" />
      
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 z-0 w-[60vw] h-[60vw] rounded-full pointer-events-none opacity-40 filter drop-shadow-[0_0_15px_#fb923c]" 
           style={{
             background: 'linear-gradient(180deg, #d946ef 10%, #fb923c 60%, #fdba74 90%)',
             maskImage: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0) 80%)',
             WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0) 80%)',
           }}>
      </div>
      
      {/* WIREFRAME MOUNTAINS */}
      <div className="fixed bottom-[40vh] left-0 w-full z-0 flex items-end pointer-events-none opacity-30">
        <div className="h-[30vh] w-[20vw] left-[15%] relative" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}>
           <div className="absolute inset-[1px] border-[0.5px] border-cyan-500/30" style={{background: 'linear-gradient(180deg, rgba(34, 211, 238, 0.2), transparent)'}}></div>
        </div>
        <div className="h-[38vh] w-[25vw] left-[35%] relative" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}>
           <div className="absolute inset-[1px] border-[0.5px] border-cyan-500/30" style={{background: 'linear-gradient(180deg, rgba(34, 211, 238, 0.3), transparent)'}}></div>
        </div>
        <div className="h-[28vh] w-[18vw] left-[60%] relative" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}>
           <div className="absolute inset-[1px] border-[0.5px] border-cyan-500/30" style={{background: 'linear-gradient(180deg, rgba(34, 211, 238, 0.2), transparent)'}}></div>
        </div>
      </div>

      {/* GRID FLOOR */}
      <div className="fixed bottom-0 left-0 w-full h-[40vh] z-10 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px)', backgroundSize: '100% 40px' }}></div>

      {/* TITLES */}
      <div className="z-20 flex flex-col items-center mt-4">
        <h1 
          onClick={() => setShowAdminModal(true)}
          className={`${pressStart2P.className} text-6xl md:text-8xl text-center font-black uppercase cursor-crosshair transition-colors duration-300`}
          style={{
            background: 'linear-gradient(180deg, #22d3ee 20%, #d946ef 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0px 6px 0px #86198f) drop-shadow(0px 0px 15px rgba(217, 70, 239, 0.7))'
          }}
        >
          QUIZZARD
        </h1>
      </div>

     {/* POSTER ICONS */}
      <div className="z-20 flex justify-center items-center gap-8 md:gap-16 my-4">
        <div className="flex flex-col items-center gap-3">
          <Image src="/pixel_brain.png" alt="Innovation" width={256} height={256} className="object-contain" />
          <span className={`${pressStart2P.className} text-[20px] text-orange-400`}>Innovation</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Image src="/pixel_atom.png" alt="Inventing" width={256} height={256} className="object-contain" />
          <span className={`${pressStart2P.className} text-[20px] text-cyan-400`}>Inventing</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Image src="/pixel_booksie.png" alt="Inspire" width={256} height={256} className="object-contain" />
          <span className={`${pressStart2P.className} text-[20px] text-yellow-400`}>Inspire</span>
        </div>
      </div>

      {/* MAIN TERMINAL BOX */}
      <div className="z-20 w-full max-w-sm border-4 border-cyan-400 bg-black/80 p-8 sm:p-10 shadow-[0_0_30px_rgba(34,211,238,0.5)]"> 
        <div className="space-y-6">
          <div>
            <label className={`${pressStart2P.className} block text-magenta-500 text-center uppercase text-[10px] mb-4`}>
              Enter USERNAME:
            </label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              className="w-full bg-black/70 border-2 border-magenta-500 p-4 text-cyan-400 text-center outline-none focus:border-cyan-400"
              placeholder="TYPE HERE..."
            />
          </div>

         <button 
            onClick={() => router.push(`/category?user=${username}`)} // <--- ADD THIS
            disabled={!isPaid || !username}
            className={`${pressStart2P.className} w-full p-5 font-black uppercase text-[11px] border-4 transition-all ${
              isPaid ? "border-cyan-400 text-cyan-400 shadow-[0_0_20px_#06b6d4] animate-pulse" : "border-slate-800 text-slate-800"
            }`}
          >
            {isPaid ? "PROCEED TO SELECTION" : "AWAITING PAYMENT"}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="z-20 w-full max-w-sm mt-4 border-2 border-cyan-400 bg-slate-950/90 p-4 rounded-lg">
        <p className="text-cyan-400 font-mono text-xs text-center">quizzardbyodevs@gmail.com</p>
      </div>

      {/* ADMIN MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="border-4 border-dashed border-red-500 p-8 bg-black w-full max-w-xs shadow-[0_0_30px_rgba(239,68,68,0.4)]">
            <h2 className={`${pressStart2P.className} text-red-500 mb-6 text-center text-sm uppercase`}>ADMIN ACCESS</h2>
            <input 
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full bg-black border-2 border-red-800 p-3 text-red-500 text-center mb-6 outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleUnlock} className={`${pressStart2P.className} flex-1 border-2 border-red-500 py-3 text-[10px] text-red-400`}>UNLOCK</button>
              <button onClick={() => setShowAdminModal(false)} className={`${pressStart2P.className} flex-1 border-2 border-slate-800 py-3 text-[10px] text-slate-500`}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}