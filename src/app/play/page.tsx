"use client";
import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Press_Start_2P } from 'next/font/google';
import { supabase } from '@/lib/supabase'; 
import Image from 'next/image'

// --- THE SOUND ENGINE ---
const playSFX = (soundFile: string) => {
  if (typeof window !== 'undefined') {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.play().catch((err) => console.log("Audio blocked by browser:", err));
  }
};

// --- UPGRADED INTERFACE ---
interface Question {
  id?: number;
  category: string;
  question_text: string;
  type: 'mcq' | 'identification' | '4pics';
  options?: string[];      
  correct_idx?: number;    
  answer_text?: string;    
  image_urls?: string[];   
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
  const [gameState, setGameState] = useState<"PLAYING" | "GAME_OVER" | "VICTORY" | "CHOOSING_POWERUP">("PLAYING");
  const [hasSaved, setHasSaved] = useState(false);
  
  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ username: string; score: number; tier: string }[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  const [textInput, setTextInput] = useState("");

  // --- NEW: STREAK & POWER-UP STATE ---
  const [streak, setStreak] = useState(0);
  const [powerUps, setPowerUps] = useState({ fiftyFifty: 0, timeFreeze: 0, lifeLine: 0 });
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase.from('questions').select('*').eq('category', category);
      if (error) console.error("Database error:", error);

      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions([{ category: "SYSTEM", question_text: "NO DATA FOUND IN MAINFRAME", type: "mcq", options: ["A", "B", "C", "D"], correct_idx: 0 }]);
      }
      setIsLoading(false);
    }
    fetchQuestions();
  }, [category]);

  // --- AUDIO: BACKGROUND MUSIC ---
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio only once
    if (typeof window !== 'undefined' && !bgmRef.current) {
      bgmRef.current = new Audio('/sounds/QuizTaking.mp3');
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.3;
    }

    const bgm = bgmRef.current;
    if (!bgm) return;

    if (gameState === "PLAYING") {
      bgm.play().catch(e => console.log("BGM Blocked:", e));
    } else if (gameState === "CHOOSING_POWERUP") {
      bgm.pause(); // <-- PAUSES MUSIC WHILE THEY CHOOSE!
    } else {
      bgm.pause();
      bgm.currentTime = 0; // Resets when game is over
    }
  }, [gameState]);

  // Cleanup: Stops music entirely if they leave the play screen early
  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  // --- 2. THE SCORE GUARDIAN ---
  useEffect(() => {
    if ((gameState === "GAME_OVER" || gameState === "VICTORY") && !hasSaved) {
      const pushResult = async () => {
        setHasSaved(true);
        let tier = "BRONZE"; 
        if (score >= 10 && score <= 14) tier = "SILVER";
        if (score >= 15 && score <= 19) tier = "GOLD";
        if (score >= 20) tier = "DIAMOND";

        const { error } = await supabase.from('match_results').insert([{ username, score, tier, category, claimed: false }]);
        if (error) console.error("Insert Error:", error.message);
      };
      pushResult();
    }
  }, [gameState, hasSaved, score, username, category]);

  // --- 3. GAME LOGIC ---
  const nextQuestion = useCallback(() => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setTimeLeft(15); 
      setTextInput(""); 
      setEliminatedOptions([]); // Reset 50/50
      setIsTimeFrozen(false);   // Reset Freeze
    } else {
      setGameState("VICTORY");
    }
  }, [currentQIndex, questions.length]);

  const handleCorrectAnswer = useCallback(() => {
    playSFX('CorrectAnswer.mp3');
    setScore((prev) => prev + 1);
    const newStreak = streak + 1;
    setStreak(newStreak);

    // STREAK CHECK! Every 5 correct answers triggers a power-up choice
    if (newStreak % 5 === 0) {
      setGameState("CHOOSING_POWERUP");
    } else {
      nextQuestion();
    }
  }, [streak, nextQuestion]);

  const handleWrongAnswer = useCallback(() => {
    setTextInput(""); 
    setStreak(0); // Lose streak!
    
    if (strikes + 1 >= 3) {
      playSFX('GameOver.mp3');
      setGameState("GAME_OVER");
    } else {
      playSFX('WrongAnswer.mp3');
      setStrikes((prev) => prev + 1);
      nextQuestion();
    }
  }, [strikes, nextQuestion]);

  const handleMcqAnswer = useCallback((selectedIndex: number) => {
    if (gameState !== "PLAYING" || isLoading) return;
    if (selectedIndex === questions[currentQIndex].correct_idx) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  }, [gameState, isLoading, currentQIndex, handleCorrectAnswer, handleWrongAnswer, questions]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState !== "PLAYING" || isLoading || !textInput.trim()) return;
    
    const correctAnswer = questions[currentQIndex].answer_text?.toLowerCase().trim();
    if (textInput.toLowerCase().trim() === correctAnswer) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  // --- 4. POWER-UP MECHANICS ---
  const handleChoosePowerUp = (type: 'fiftyFifty' | 'timeFreeze' | 'lifeLine') => {
    playSFX('PowerUp.mp3');
    setPowerUps(prev => ({ ...prev, [type]: prev[type] + 1 }));
    setGameState("PLAYING");
    nextQuestion();
  };

  const useFiftyFifty = () => {
    if (powerUps.fiftyFifty <= 0 || questions[currentQIndex].type !== 'mcq' || eliminatedOptions.length > 0) return;
    playSFX('PowerUp.mp3');
    const correctIdx = questions[currentQIndex].correct_idx!;
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
    const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
    setEliminatedOptions(shuffled.slice(0, 2)); // Hide 2 wrong options
    setPowerUps(prev => ({ ...prev, fiftyFifty: prev.fiftyFifty - 1 }));
  };

  const useTimeFreeze = () => {
    if (powerUps.timeFreeze <= 0 || isTimeFrozen) return;
    playSFX('PowerUp.mp3');
    setIsTimeFrozen(true);
    setPowerUps(prev => ({ ...prev, timeFreeze: prev.timeFreeze - 1 }));
  };

  const useLifeLine = () => {
    if (powerUps.lifeLine <= 0 || strikes <= 0) return;
    playSFX('PowerUp.mp3');
    setStrikes(prev => prev - 1); // Heal 1 strike
    setPowerUps(prev => ({ ...prev, lifeLine: prev.lifeLine - 1 }));
  };

  // --- 5. LEADERBOARD LOGIC ---
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    const { data, error } = await supabase.from('match_results').select('*').eq('category', category).order('score', { ascending: false }).limit(10);
    if (error) console.error("Leaderboard fetch error:", error);
    else setLeaderboard(data || []);
    setLoadingLeaderboard(false);
  };

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
    fetchLeaderboard();
  };

  // --- 6. TIMER LOGIC ---
  useEffect(() => {
    if (gameState !== "PLAYING" || isLoading || questions.length === 0 || isTimeFrozen) return;
    if (questions[currentQIndex]?.type === '4pics') return;

    if (timeLeft <= 0) {
      const timeout = setTimeout(() => handleWrongAnswer(), 0);
      return () => clearTimeout(timeout);
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState, handleWrongAnswer, isLoading, questions.length, currentQIndex, questions, isTimeFrozen]);

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
  if (isTimeFrozen) timerColor = "bg-blue-300 shadow-[0_0_15px_#93c5fd] animate-pulse";
  else if (timeLeft <= 5) timerColor = "bg-yellow-400 shadow-[0_0_10px_#facc15]";
  else if (timeLeft <= 3) timerColor = "bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse";

  return (
    <div className="z-20 w-full max-w-5xl flex flex-col gap-6">
      
      {/* HUD UPDATE: Added Streak! */}
      <div className="flex justify-between items-center backdrop-blur-md bg-black/40 border-2 border-white/20 rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className={`${pressStart2P.className} text-[10px] sm:text-xs text-cyan-400 space-y-2`}>
          <p>USER: <span className="text-white">{username}</span></p>
          <p>SCORE: <span className="text-green-400">{score}</span> <span className="text-yellow-400 ml-4 animate-pulse">STREAK: {streak}🔥</span></p>
        </div>
        <div className="flex gap-2 text-2xl font-black">
          {[1, 2, 3].map((num) => (
            <span key={num} className={`${strikes >= num ? "text-red-500 drop-shadow-[0_0_8px_#ef4444]" : "text-slate-700"} transition-colors`}>X</span>
          ))}
        </div>
      </div>

      {/* REWARD MODAL */}
      {gameState === "CHOOSING_POWERUP" && (
        <div className="backdrop-blur-xl bg-black/80 border-4 border-yellow-400 rounded-2xl p-10 text-center flex flex-col items-center gap-6 shadow-[0_0_40px_rgba(250,204,21,0.5)]">
          <h1 className={`${pressStart2P.className} text-2xl sm:text-3xl text-yellow-400 drop-shadow-[0_0_10px_#facc15]`}>STREAK REWARD!</h1>
          <p className={`${pressStart2P.className} text-white text-xs mb-4`}>SELECT YOUR POWER-UP</p>
          
          <div className="grid grid-cols-3 gap-6">
            <button onMouseEnter={() => playSFX('ClickSound.mp3')} onClick={() => handleChoosePowerUp('fiftyFifty')} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
              <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-cyan-400 p-3 shadow-[0_0_15px_#22d3ee] flex items-center justify-center">
                <Image src="/Eliminate.png" alt="50/50" width={50} height={50} className="object-contain" />
              </div>
              <span className={`${pressStart2P.className} text-[8px] text-cyan-400`}>50/50</span>
            </button>

            <button onMouseEnter={() => playSFX('ClickSound.mp3')} onClick={() => handleChoosePowerUp('timeFreeze')} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
              <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-blue-400 p-3 shadow-[0_0_15px_#60a5fa] flex items-center justify-center">
                <Image src="/TimeFreeze.png" alt="Time Freeze" width={50} height={50} className="object-contain" />
              </div>
              <span className={`${pressStart2P.className} text-[8px] text-blue-400`}>FREEZE</span>
            </button>

            <button onMouseEnter={() => playSFX('ClickSound.mp3')} onClick={() => handleChoosePowerUp('lifeLine')} className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
              <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-red-400 p-3 shadow-[0_0_15px_#f87171] flex items-center justify-center">
                <Image src="/heart.png" alt="Life Line" width={50} height={50} className="object-contain" />
              </div>
              <span className={`${pressStart2P.className} text-[8px] text-red-400`}>UNDO STRIKE</span>
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER & VICTORY */}
      {(gameState === "GAME_OVER" || gameState === "VICTORY") && (
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
              RETURN TO START
            </button>
          </div>
        </div>
      )}

      {/* MAIN GAME BOARD */}
      {gameState === "PLAYING" && (
        <div className="flex flex-col gap-4 w-full">
          
          {/* INVENTORY BAR */}
          <div className="flex justify-center gap-4 mb-2">
            <button onClick={useFiftyFifty} disabled={powerUps.fiftyFifty === 0 || currentQuestion.type !== 'mcq'} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center relative transition-all ${powerUps.fiftyFifty > 0 && currentQuestion.type === 'mcq' ? 'border-cyan-400 bg-cyan-900/40 hover:scale-110 cursor-pointer shadow-[0_0_10px_#22d3ee]' : 'border-slate-600 bg-black/50 opacity-50 cursor-not-allowed'}`}>
              <Image src="/Eliminate.png" alt="50/50" width={24} height={24} />
              <span className={`${pressStart2P.className} absolute -bottom-2 -right-2 bg-black border border-cyan-400 text-[8px] text-white px-1`}>{powerUps.fiftyFifty}</span>
            </button>
            <button onClick={useTimeFreeze} disabled={powerUps.timeFreeze === 0 || isTimeFrozen} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center relative transition-all ${powerUps.timeFreeze > 0 && !isTimeFrozen ? 'border-blue-400 bg-blue-900/40 hover:scale-110 cursor-pointer shadow-[0_0_10px_#60a5fa]' : 'border-slate-600 bg-black/50 opacity-50 cursor-not-allowed'}`}>
              <Image src="/TimeFreeze.png" alt="Freeze" width={24} height={24} />
              <span className={`${pressStart2P.className} absolute -bottom-2 -right-2 bg-black border border-blue-400 text-[8px] text-white px-1`}>{powerUps.timeFreeze}</span>
            </button>
            <button onClick={useLifeLine} disabled={powerUps.lifeLine === 0 || strikes === 0} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center relative transition-all ${powerUps.lifeLine > 0 && strikes > 0 ? 'border-red-400 bg-red-900/40 hover:scale-110 cursor-pointer shadow-[0_0_10px_#f87171]' : 'border-slate-600 bg-black/50 opacity-50 cursor-not-allowed'}`}>
              <Image src="/heart.png" alt="Heart" width={24} height={24} />
              <span className={`${pressStart2P.className} absolute -bottom-2 -right-2 bg-black border border-red-400 text-[8px] text-white px-1`}>{powerUps.lifeLine}</span>
            </button>
          </div>

          <div className="backdrop-blur-md bg-black/40 border-2 border-white/20 rounded-2xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <p className={`${pressStart2P.className} text-magenta-500 text-[10px] text-center mb-6`}>[ CATEGORY: {category} ]</p>
            
            <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-6 font-sans tracking-wide">
              {currentQuestion.question_text}
            </h2>

            {/* 4 PICS GRID */}
            {currentQuestion.type === '4pics' && currentQuestion.image_urls && (
              <div className="grid grid-cols-2 gap-2 mb-6 max-w-md mx-auto">
                {currentQuestion.image_urls.map((url, idx) => (
                  <div key={idx} className="aspect-square bg-slate-800 border-2 border-cyan-800 overflow-hidden relative flex items-center justify-center">
                    <div className="w-full h-full">
                      <Image 
                        src={url} 
                        alt={`clue-${idx}`} 
                        width={500} 
                        height={500}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TIMER PROGRESS BAR */}
            {currentQuestion.type !== '4pics' && (
              <div className="w-full bg-slate-800 h-3 mb-8 overflow-hidden rounded-full">
                <div className={`h-full transition-all duration-1000 ease-linear ${timerColor}`} style={{ width: `${timerPercentage}%` }}></div>
              </div>
            )}

            {/* DYNAMIC INPUT RENDERER */}
            {currentQuestion.type === 'mcq' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.options?.map((opt: string, idx: number) => (
                  <button 
                    key={idx} 
                    onMouseEnter={() => playSFX('ClickSound.mp3')}
                    onClick={() => handleMcqAnswer(idx)} 
                    // Hide if 50/50 eliminated it!
                    className={`border-2 border-white/20 bg-black/40 backdrop-blur-sm p-4 text-sm sm:text-base font-bold text-cyan-50 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all text-left rounded-lg ${eliminatedOptions.includes(idx) ? 'invisible' : ''}`}
                  >
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
                <button type="submit" onMouseEnter={() => playSFX('ClickSound.mp3')} className={`${pressStart2P.className} w-full border-2 border-magenta-500/50 bg-magenta-900/30 backdrop-blur-sm rounded-lg text-magenta-400 p-4 hover:bg-magenta-500/50 hover:text-white hover:border-magenta-400 transition-colors text-xs`}>
                  SUBMIT
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LEADERBOARD MODAL (Kept exactly as you had it) */}
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