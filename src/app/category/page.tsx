"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { Press_Start_2P } from 'next/font/google';
import { Suspense } from 'react';

const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

function CategorySelection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = searchParams.get('user') || "PLAYER_1";

  const categories = [
    { name: "SCIENCE", color: "border-green-400 text-green-400 shadow-[0_0_15px_#4ade80]", hover: "hover:bg-green-400" },
    { name: "GEN MATH", color: "border-red-400 text-red-400 shadow-[0_0_15px_#f87171]", hover: "hover:bg-red-400" },
    { name: "TECHNOLOGY", color: "border-cyan-400 text-cyan-400 shadow-[0_0_15px_#22d3ee]", hover: "hover:bg-cyan-400" },
    { name: "HISTORY", color: "border-yellow-400 text-yellow-400 shadow-[0_0_15px_#facc15]", hover: "hover:bg-yellow-400" }
  ];

  const handleSelect = (category: string) => {
    // This will route them to the actual quiz game loop next!
    router.push(`/play?user=${username}&cat=${category.toLowerCase()}`);
  };

  return (
    <main className="min-h-screen bg-purple-950 flex flex-col items-center justify-center pt-6 pb-6 px-6 relative overflow-hidden">
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

      {/* Glassmorphism Container */}
      <div className="z-20 w-full max-w-5xl flex flex-col items-center gap-12 backdrop-blur-md bg-black/40 border-2 border-white/20 rounded-2xl p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        
        {/* Header */}
        <div className="text-center">
          <p className={`${pressStart2P.className} text-magenta-500 text-xs md:text-sm mb-4 animate-pulse`}>
            WELCOME, {username}
          </p>
          <h1 className={`${pressStart2P.className} text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]`}>
            SELECT DOMAIN
          </h1>
        </div>

        {/* 2x2 Grid for Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleSelect(cat.name)}
              className={`${pressStart2P.className} ${cat.color} ${cat.hover} hover:text-black backdrop-blur-sm bg-black/60 border-4 p-8 md:p-12 text-lg md:text-xl transition-all duration-200 transform hover:scale-105`}
            >
              {cat.name}
            </button>
          ))}
        </div>

     
      </div>
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-purple-950 flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <CategorySelection />
    </Suspense>
  );
}

              