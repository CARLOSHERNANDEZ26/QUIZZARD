"use client";
import { useState, useEffect } from "react";
import { Press_Start_2P } from 'next/font/google';
import { supabase } from '@/lib/supabase';
import { useRouter } from "next/navigation";

const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

// THE SOUND ENGINE
const playSFX = (soundFile: string) => {
  if (typeof window !== 'undefined') {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.play().catch((err) => console.log("Audio blocked:", err));
  }
};

interface Leader {
  username: string;
  score: number;
  tier: string;
  category: string;
}

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const itemsPerPage = 5;

  // Fix hydration mismatch on load
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const fetchLeaderboard = async (page = 1) => {
    setLoading(true);
    const offset = (page - 1) * itemsPerPage;
    
    const { data, error, count } = await supabase
      .from('match_results')
      .select('username, score, tier, category', { count: 'exact' })
      .order('score', { ascending: false })
      .order('played_at', { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    if (error) {
      console.error("Error fetching leaderboard:", error);
    } else {
      setLeaders(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    }
    setLoading(false);
  };

  // Auto-refresh the board every 10 seconds for the live TV feed!
  useEffect(() => {
    const initTimer = setTimeout(() => fetchLeaderboard(currentPage), 0);
    const interval = setInterval(() => fetchLeaderboard(currentPage), 10000); 
    
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [currentPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const handlePageChange = (page: number) => {
    fetchLeaderboard(page);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "DIAMOND": return "text-cyan-300 drop-shadow-[0_0_10px_#67e8f9] animate-pulse";
      case "GOLD": return "text-yellow-400 drop-shadow-[0_0_8px_#facc15]";
      case "SILVER": return "text-slate-300 drop-shadow-[0_0_8px_#cbd5e1]";
      case "BRONZE": return "text-orange-700 drop-shadow-[0_0_8px_#c2410c]";
      default: return "text-white";
    }
  };

  if (!mounted) return <div className="min-h-screen bg-purple-950" />;

  return (
    <main className="min-h-screen bg-purple-950 flex flex-col items-center justify-start pt-6 pb-12 px-6 relative overflow-hidden">
      
      {/* THE STICKY ESCAPE BUTTON! Always in the bottom right corner */}
      <button 
        onMouseEnter={() => playSFX('ClickSound.mp3')}
        onClick={() => { playSFX('ClickSound.mp3'); router.push('/'); }}
        className={`${pressStart2P.className} fixed bottom-6 right-6 z-50 border-2 border-white/20 text-white/50 p-4 hover:border-cyan-400 hover:text-cyan-400 transition-colors text-[10px] bg-black/80 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.8)]`}
      >
        [ RETURN TO MAIN MENU ]
      </button>

      {/* MATCHING BACKGROUND IMAGE */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/quizzard_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(5px)'
        }}
      />

      <div className="z-20 w-full max-w-5xl flex flex-col items-center gap-8 mt-4 pb-24">
        {/* Title */}
        <h1 className={`${pressStart2P.className} text-4xl md:text-6xl text-center text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-600 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]`}>
          WALL OF FAME
        </h1>

        {/* Leaderboard Table (Glassmorphism style) */}
        <div className="w-full backdrop-blur-md bg-black/60 border-4 border-yellow-400 p-6 md:p-10 shadow-[0_0_30px_#facc15] flex flex-col gap-4 rounded-xl">
          
          {/* Table Headers */}
          <div className={`${pressStart2P.className} grid grid-cols-5 gap-4 text-yellow-400 text-[10px] md:text-sm border-b-2 border-yellow-400/50 pb-4 mb-2`}>
            <div className="text-center">RANK</div>
            <div className="col-span-2">PLAYER</div>
            <div className="text-center">CATEGORY</div>
            <div className="text-right">SCORE/TIER</div>
          </div>

          {/* Player Rows */}
          {loading && leaders.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : leaders.length === 0 && !loading ? (
            <p className={`${pressStart2P.className} text-cyan-400 text-center animate-pulse py-12 text-xs`}>
              AWAITING CHALLENGERS...
            </p>
          ) : (
            <>
              {leaders.map((player, index) => {
                const globalRank = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div 
                    key={`${player.username}-${globalRank}`} 
                    className={`${pressStart2P.className} grid grid-cols-5 gap-4 items-center text-xs md:text-base py-4 border-b border-white/10 hover:bg-white/5 transition-colors rounded-lg px-2`}
                  >
                    {/* Rank (Special styling for top 3) */}
                    <div className={`text-center ${globalRank === 1 ? "text-yellow-400 text-xl md:text-2xl drop-shadow-[0_0_8px_#facc15]" : globalRank === 2 ? "text-slate-300 text-lg md:text-xl" : globalRank === 3 ? "text-orange-500 text-lg md:text-xl" : "text-white/50"}`}>
                      #{globalRank}
                    </div>
                    
                    {/* Username */}
                    <div className="col-span-2 text-white truncate pr-4 uppercase tracking-wider">
                      {player.username}
                    </div>

                    {/* Category */}
                    <div className="text-center text-magenta-400 text-[10px] md:text-xs">
                      {player.category || "UNKNOWN"}
                    </div>
                    
                    {/* Score & Tier */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-green-400">{player.score} PTS</span>
                      <span className={`text-[8px] md:text-[10px] ${getTierColor(player.tier)}`}>
                        [{player.tier}]
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-6 border-t border-white/20">
                  <button
                    onMouseEnter={() => playSFX('ClickSound.mp3')}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${pressStart2P.className} px-4 py-2 text-xs border-2 border-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 hover:border-yellow-400 transition-colors`}
                  >
                    ← PREV
                  </button>
                  <span className={`${pressStart2P.className} text-xs text-white/70 px-4`}>
                    PAGE {currentPage} / {totalPages}
                  </span>
                  <button
                    onMouseEnter={() => playSFX('ClickSound.mp3')}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${pressStart2P.className} px-4 py-2 text-xs border-2 border-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 hover:border-yellow-400 transition-colors`}
                  >
                    NEXT →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}