"use client";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Press_Start_2P } from 'next/font/google';
import { supabase } from '@/lib/supabase'; 
import Image from 'next/image'

// --- UPGRADED INTERFACE ---
interface Question {
  id?: number;
  category: string;
  question_text: string;
  type: 'mcq' | 'identification' | '4pics';
  options?: string[];      // Used for mcq
  correct_idx?: number;    // Used for mcq
  answer_text?: string;    // Used for identification/4pics
  image_urls?: string[];   // Used for 4pics
}

const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

function GameBoard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = searchParams.get('user') || "PLAYER_1";
  const category = searchParams.get('cat')?.toUpperCase() || "UNKNOWN";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameState, setGameState] = useState<"PLAYING" | "GAME_OVER" | "VICTORY">("PLAYING");
  const [hasSaved, setHasSaved] = useState(false);
  
  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  // New state for Identification / 4pics typing
  const [textInput, setTextInput] = useState("");

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', category);

      if (error) console.error("Database error:", error);

      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions([{ 
          category: "SYSTEM",
          question_text: "NO DATA FOUND IN MAINFRAME", 
          type: "mcq",
          options: ["A", "B", "C", "D"], 
          correct_idx: 0 
        }]);
      }
      setIsLoading(false);
    }
    fetchQuestions();
  }, [category]);

  // --- 2. THE SCORE GUARDIAN (Updated Tiers!) ---
  useEffect(() => {
    if ((gameState === "GAME_OVER" || gameState === "VICTORY") && !hasSaved) {
      const pushResult = async () => {
        setHasSaved(true);
        
        // --- NEW TIER LOGIC ---
        let tier = "BRONZE"; // 0-9
        if (score >= 10 && score <= 14) tier = "SILVER";
        if (score >= 15 && score <= 19) tier = "GOLD";
        if (score >= 20) tier = "DIAMOND";

        console.log("Pushing result to Supabase...");
        const { error } = await supabase
          .from('match_results')
          .insert([{ username, score, tier, category, claimed: false }]);

        if (error) console.error("Insert Error:", error.message);
      };
      pushResult();
    }
  }, [gameState, hasSaved, score, username]);

  // --- 3. GAME LOGIC ---
  const nextQuestion = useCallback(() => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setTimeLeft(15); // Reset timer
      setTextInput(""); // Clear text input
    } else {
      setGameState("VICTORY");
    }
  }, [currentQIndex, questions.length]);

  const handleWrongAnswer = useCallback(() => {
    setTextInput(""); // Clear text input on strike
    if (strikes + 1 >= 3) {
      setGameState("GAME_OVER");
    } else {
      setStrikes((prev) => prev + 1);
      nextQuestion();
    }
  }, [strikes, nextQuestion]);

  // Handler for MCQ Buttons
  const handleMcqAnswer = useCallback((selectedIndex: number) => {
    if (gameState !== "PLAYING" || isLoading) return;
    const isCorrect = selectedIndex === questions[currentQIndex].correct_idx;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      nextQuestion();
    } else {
      handleWrongAnswer();
    }
  }, [gameState, isLoading, currentQIndex, nextQuestion, handleWrongAnswer, questions]);

  // Handler for Text Input (Identification / 4pics)
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState !== "PLAYING" || isLoading || !textInput.trim()) return;
    
    const correctAnswer = questions[currentQIndex].answer_text?.toLowerCase().trim();
    const isCorrect = textInput.toLowerCase().trim() === correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      nextQuestion();
    } else {
      handleWrongAnswer();
    }
  };

  // --- 4. LEADERBOARD LOGIC ---
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    const { data, error } = await supabase
      .from('match_results')
      .select('*')
      .eq('category', category)
      .order('score', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error("Leaderboard fetch error:", error);
    } else {
      setLeaderboard(data || []);
    }
    setLoadingLeaderboard(false);
  };

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
    fetchLeaderboard();
  };

  // --- 5. TIMER LOGIC ---
  useEffect(() => {
    if (gameState !== "PLAYING" || isLoading || questions.length === 0) return;
    if (timeLeft <= 0) {
      const timeout = setTimeout(() => handleWrongAnswer(), 0);
      return () => clearTimeout(timeout);
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState, handleWrongAnswer, isLoading, questions.length]);

  if (isLoading) {
    return (
      <div className="z-20 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-magenta-500 rounded-full animate-spin"></div>
        <p className={`${pressStart2P.className} text-cyan-400 animate-pulse text-sm mt-4`}>ACCESSING DATABANKS...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];
  const timerPercentage = (timeLeft / 15) * 100;
  let timerColor = "bg-cyan-400 shadow-[0_0_10px_#22d3ee]";
  if (timeLeft <= 5) timerColor = "bg-yellow-400 shadow-[0_0_10px_#facc15]";
  if (timeLeft <= 3) timerColor = "bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse";

  return (
    <div className="z-20 w-full max-w-5xl flex flex-col gap-6">
      <div className="flex justify-between items-center backdrop-blur-md bg-black/40 border-2 border-white/20 rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className={`${pressStart2P.className} text-[10px] sm:text-xs text-cyan-400 space-y-2`}>
          <p>USER: <span className="text-white">{username}</span></p>
          <p>SCORE: <span className="text-green-400">{score}</span></p>
        </div>
        <div className="flex gap-2 text-2xl font-black">
          {[1, 2, 3].map((num) => (
            <span key={num} className={`${strikes >= num ? "text-red-500 drop-shadow-[0_0_8px_#ef4444]" : "text-slate-700"} transition-colors`}>X</span>
          ))}
        </div>
      </div>

      {gameState !== "PLAYING" ? (
        <div className="backdrop-blur-md bg-black/40 border-2 border-white/20 rounded-2xl p-10 text-center flex flex-col items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <h1 className={`${pressStart2P.className} text-4xl sm:text-5xl ${gameState === "VICTORY" ? "text-green-400" : "text-red-500"}`}>
            {gameState === "VICTORY" ? "YOU SURVIVED" : "GAME OVER"}
          </h1>
          <p className={`${pressStart2P.className} text-white text-sm mt-4`}>FINAL SCORE: {score}</p>
          <div className="flex gap-4 mt-4">
            <button onClick={handleShowLeaderboard} className={`${pressStart2P.className} border-2 border-yellow-400 text-yellow-400 p-4 hover:bg-yellow-400 hover:text-black transition-colors text-xs`}>
              VIEW LEADERBOARD
            </button>
            <button onClick={() => router.push('/')} className={`${pressStart2P.className} border-2 border-cyan-400 text-cyan-400 p-4 hover:bg-cyan-400 hover:text-black transition-colors text-xs`}>
              RETURN TO TERMINAL
            </button>
          </div>
        </div>
      ) : (
        <div className="backdrop-blur-md bg-black/40 border-2 border-white/20 rounded-2xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <p className={`${pressStart2P.className} text-magenta-500 text-[10px] text-center mb-6`}>[ CATEGORY: {category} ]</p>
          
          <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-6 font-sans tracking-wide">
            {currentQuestion.question_text}
          </h2>

          {/* 4 PICS GRID (Only shows if type is '4pics') */}
          {currentQuestion.type === '4pics' && currentQuestion.image_urls && (
            <div className="grid grid-cols-2 gap-2 mb-6 max-w-md mx-auto">
              {currentQuestion.image_urls.map((url, idx) => (
                <div key={idx} className="aspect-square bg-slate-800 border-2 border-cyan-800 overflow-hidden relative flex items-center justify-center">
                  <div className="w-full h-full">
  <Image 
    src={url} 
    alt={`clue-${idx}`} 
    width={500} // or whatever size is appropriate
    height={500}
    className="w-full h-full object-cover" 
  />
</div>
                </div>
              ))}
            </div>
          )}

          <div className="w-full bg-slate-800 h-3 mb-8 overflow-hidden">
            <div className={`h-full transition-all duration-1000 ease-linear ${timerColor}`} style={{ width: `${timerPercentage}%` }}></div>
          </div>

          {/* DYNAMIC INPUT RENDERER */}
          {currentQuestion.type === 'mcq' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options?.map((opt: string, idx: number) => (
                <button key={idx} onClick={() => handleMcqAnswer(idx)} className="border-2 border-white/20 bg-black/40 backdrop-blur-sm p-4 text-sm sm:text-base font-bold text-cyan-50 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all text-left rounded-lg">
                  <span className="text-magenta-500 mr-2 font-mono">[{["A","B","C","D"][idx]}]</span> {opt}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full">
              <input 
                type="text" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                autoFocus
                placeholder="TYPE ANSWER HERE..."
                className={`${pressStart2P.className} w-full backdrop-blur-sm bg-black/60 border-2 border-white/30 rounded-lg p-4 text-cyan-400 text-xs md:text-sm text-center uppercase focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_#22d3ee]`}
              />
              <button type="submit" className={`${pressStart2P.className} w-full border-2 border-magenta-500/50 bg-magenta-900/30 backdrop-blur-sm rounded-lg text-magenta-400 p-4 hover:bg-magenta-500/50 hover:text-white hover:border-magenta-400 transition-colors text-xs`}>
                SUBMIT
              </button>
            </form>
          )}
        </div>
      )}

      {/* LEADERBOARD MODAL */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="backdrop-blur-md bg-black/60 border-2 border-white/20 rounded-2xl p-8 w-full max-w-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`${pressStart2P.className} text-2xl text-yellow-400`}>
                {category} LEADERBOARD
              </h2>
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="text-white/50 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            {loadingLeaderboard ? (
              <div className="flex justify-center py-8">
                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <p className={`${pressStart2P.className} text-center text-white/50 py-8 text-sm`}>
                NO RECORDS FOUND
              </p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-4 gap-4 text-xs text-white/50 pb-2 border-b border-white/10">
                  <span className={`${pressStart2P.className}`}>RANK</span>
                  <span className={`${pressStart2P.className}`}>PLAYER</span>
                  <span className={`${pressStart2P.className}`}>SCORE</span>
                  <span className={`${pressStart2P.className}`}>TIER</span>
                </div>
                {leaderboard.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className={`grid grid-cols-4 gap-4 p-3 rounded-lg text-sm ${
                      entry.username === username 
                        ? 'bg-yellow-400/20 border border-yellow-400/50' 
                        : 'bg-white/5'
                    }`}
                  >
                    <span className={`${pressStart2P.className} ${
                      idx === 0 ? 'text-yellow-400' : 
                      idx === 1 ? 'text-slate-300' : 
                      idx === 2 ? 'text-orange-400' : 'text-white/70'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className={`${pressStart2P.className} text-white truncate`}>
                      {entry.username}
                    </span>
                    <span className={`${pressStart2P.className} text-green-400`}>
                      {entry.score}
                    </span>
                    <span className={`${pressStart2P.className} ${
                      entry.tier === 'DIAMOND' ? 'text-cyan-400' :
                      entry.tier === 'GOLD' ? 'text-yellow-400' :
                      entry.tier === 'SILVER' ? 'text-slate-300' :
                      'text-orange-400'
                    }`}>
                      {entry.tier}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayScreen() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  if (!mounted) return <div className="min-h-screen bg-purple-950" />; 
  return (
    <main className="min-h-screen bg-purple-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
      <Suspense fallback={<div className={`${pressStart2P.className} z-20 text-cyan-400 animate-pulse`}>LOADING GRID...</div>}>
        <GameBoard />
      </Suspense>
    </main>
  );
}