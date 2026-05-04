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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameState, setGameState] = useState<"PLAYING" | "GAME_OVER" | "CONGRATULATIONS" | "CHOOSING_POWERUP">("PLAYING");
  const [hasSaved, setHasSaved] = useState(false);
  
  // Leaderboard state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 5;
  
  const [textInput, setTextInput] = useState("");

  // --- NEW: STREAK & POWER-UP STATE ---
  const [streak, setStreak] = useState(0);
  const [powerUps, setPowerUps] = useState({ fiftyFifty: 0, timeFreeze: 0, lifeLine: 0 });
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);

  // --- FISHER-YATES SHUFFLE ALGORITHM ---
  const fisherYatesShuffle = (array: Question[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // --- 1. DATA FETCHING (40 QUESTIONS) ---
  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase.from('questions').select('*').eq('category', category).limit(40);
      if (error) console.error("Database error:", error);

      if (data && data.length > 0) {
        // Use Fisher-Yates shuffle for proper randomization
        const shuffled = fisherYatesShuffle(data);
        setQuestions(shuffled);
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
    if ((gameState === "GAME_OVER" || gameState === "CONGRATULATIONS") && !hasSaved) {
      const pushResult = async () => {
        setHasSaved(true);
        let tier = "BRONZE"; 
        if (score >= 500 && score <= 749) tier = "SILVER";
        if (score >= 750 && score <= 999) tier = "GOLD";
        if (score >= 1000) tier = "DIAMOND";

        const { error } = await supabase.from('match_results').insert([{ username, score, tier, category, claimed: false }]);
        if (error) console.error("Insert Error:", error.message);
      };
      pushResult();
    }
  }, [gameState, hasSaved, score, username, category]);

  // --- 3. GAME LOGIC ---
  const nextQuestion = useCallback(() => {
    // Check for win condition first (1020 points = 34 correct answers)
    if (score >= 1020) {
      setGameState("CONGRATULATIONS");
      return;
    }

    // Check if reached 40th question
    if (currentQuestionIndex + 1 >= 40) {
      // Fetch new set of 40 questions
      fetchNewQuestionSet();
      return;
    }

    // Move to next question
    setCurrentQuestionIndex((prev) => prev + 1);
    setTimeLeft(15); 
    setTextInput(""); 
    setEliminatedOptions([]); // Reset 50/50
    setIsTimeFrozen(false);   // Reset Freeze
  }, [currentQuestionIndex, score]);

  // --- FETCH NEW QUESTION SET ---
  const fetchNewQuestionSet = useCallback(async () => {
    const { data, error } = await supabase.from('questions').select('*').eq('category', category).limit(40);
    if (error) console.error("Database error:", error);

    if (data && data.length > 0) {
      const shuffled = fisherYatesShuffle(data);
      setQuestions(shuffled);
      setCurrentQuestionIndex(0);
      setTimeLeft(15);
      setTextInput("");
      setEliminatedOptions([]);
      setIsTimeFrozen(false);
    }
  }, [category]);

  const handleCorrectAnswer = useCallback(() => {
    playSFX('CorrectAnswer.mp3');
    setScore((prev) => {
      const newScore = prev + 30;
      // Check for congratulations condition (1020 points = 34 correct answers)
      if (newScore >= 1020) {
        setGameState("CONGRATULATIONS");
      }
      return newScore;
    });
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
    playSFX('WrongAnswer.mp3');
    setTextInput(""); 
    setStreak(0); // Lose streak!
    
    // Deduct life and check for game over
    setLives((prev: number) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        playSFX('GameOver.mp3');
        setGameState("GAME_OVER");
        return 0;
      }
      return newLives;
    });
    
    // Only move to next question if still alive
    if (lives > 1) {
      nextQuestion();
    }
  }, [lives, nextQuestion]);

  const handleMcqAnswer = useCallback((selectedIndex: number) => {
    if (gameState !== "PLAYING" || isLoading) return;
    if (selectedIndex === questions[currentQuestionIndex].correct_idx) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  }, [gameState, isLoading, currentQuestionIndex, handleCorrectAnswer, handleWrongAnswer, questions]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState !== "PLAYING" || isLoading || !textInput.trim()) return;
    
    const correctAnswer = questions[currentQuestionIndex].answer_text?.toLowerCase().trim();
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
    if (powerUps.fiftyFifty <= 0 || questions[currentQuestionIndex].type !== 'mcq' || eliminatedOptions.length > 0) return;
    playSFX('PowerUp.mp3');
    const correctIdx = questions[currentQuestionIndex].correct_idx!;
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
    if (powerUps.lifeLine <= 0 || lives >= 3) return;
    playSFX('PowerUp.mp3');
    setLives((prev: number) => Math.min(prev + 1, 3)); // Heal 1 life, max 3
    setPowerUps(prev => ({ ...prev, lifeLine: prev.lifeLine - 1 }));
  };

  // --- 4. LEADERBOARD LOGIC ---
  const fetchLeaderboard = async (page = 1) => {
    setLoadingLeaderboard(true);
    const offset = (page - 1) * itemsPerPage;
    
    // Fetch paginated data
    const { data, error, count } = await supabase
      .from('match_results')
      .select('*', { count: 'exact' })
      .eq('category', category)
      .order('score', { ascending: false })
      .range(offset, offset + itemsPerPage - 1);
    
    if (error) {
      console.error("Leaderboard fetch error:", error);
    } else {
      setLeaderboard(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    }
    setLoadingLeaderboard(false);
  };

  // Real-time subscription
  useEffect(() => {
    if (!showLeaderboard) return;

    const subscription = supabase
      .channel(`leaderboard_${category}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'match_results', filter: `category=eq.${category}` },
        (payload) => {
          console.log('Leaderboard update:', payload);
          fetchLeaderboard(currentPage); // Refresh current page
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [showLeaderboard, category, currentPage]);

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
    setCurrentPage(1);
    fetchLeaderboard(1);
  };

  const handlePageChange = (page: number) => {
    fetchLeaderboard(page);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // --- 6. TIMER LOGIC ---
  useEffect(() => {
    if (gameState !== "PLAYING" || isLoading || questions.length === 0 || isTimeFrozen) return;
    if (questions[currentQuestionIndex]?.type === '4pics') return;

    if (timeLeft <= 0) {
      const timeout = setTimeout(() => handleWrongAnswer(), 0);
      return () => clearTimeout(timeout);
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState, handleWrongAnswer, isLoading, questions.length, currentQuestionIndex, questions, isTimeFrozen]);

  if (isLoading) {
    return (
      <div className="z-20 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-magenta-500 rounded-full animate-spin"></div>
        <p className={`${pressStart2P.className} text-cyan-400 animate-pulse text-sm mt-4`}>ACCESSING DATABANKS...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
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
            <span key={num} className={`${lives < num ? "text-red-500 drop-shadow-[0_0_8px_#ef4444]" : "text-slate-700"} transition-colors`}>❤</span>
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
      {(gameState === "GAME_OVER" || gameState === "CONGRATULATIONS") && (
        <div className="relative">
          {/* CONFETTI ANIMATION - Only for Congratulations */}
          {gameState === "CONGRATULATIONS" && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-20px`,
                    animation: `fall ${1.5 + Math.random() * 1.5}s linear infinite`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ['#facc15', '#22d3ee', '#f87171', '#a78bfa', '#34d399', '#fbbf24', '#ef4444', '#3b82f6'][Math.floor(Math.random() * 8)],
                  }}
                />
              ))}
            </div>
          )}
          
          <div className="backdrop-blur-md bg-black/40 border-2 border-white/20 rounded-2xl p-10 text-center flex flex-col items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10">
            <h1 className={`${pressStart2P.className} text-4xl sm:text-5xl ${gameState === "CONGRATULATIONS" ? "text-green-400 animate-pulse" : "text-red-500"}`}>
              {gameState === "CONGRATULATIONS" ? "CONGRATULATIONS! 1020 POINTS!" : "GAME OVER"}
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
            <button onClick={useLifeLine} disabled={powerUps.lifeLine === 0 || lives >= 3} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center relative transition-all ${powerUps.lifeLine > 0 && lives < 3 ? 'border-red-400 bg-red-900/40 hover:scale-110 cursor-pointer shadow-[0_0_10px_#f87171]' : 'border-slate-600 bg-black/50 opacity-50 cursor-not-allowed'}`}>
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
              <div className="grid grid-cols-2 gap-2 mb-4 max-w-sm mx-auto">
                {currentQuestion.image_urls.map((url, idx) => (
                  <div key={idx} className="aspect-square bg-slate-800 border-2 border-cyan-800 overflow-hidden relative flex items-center justify-center">
                    <div className="w-full h-full">
                      <Image 
                        src={url} 
                        alt={`clue-${idx}`} 
                        width={300} 
                        height={300}
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

      {/* LEADERBOARD MODAL */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="backdrop-blur-md bg-black/60 border-2 border-white/20 rounded-2xl p-8 w-full max-w-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="text-center mb-6">
              <h2 className={`${pressStart2P.className} text-2xl text-yellow-400`}>
                {category} LEADERBOARD
              </h2>
            </div>
            
            <div className="max-h-[50vh] overflow-hidden flex flex-col">
              {loadingLeaderboard && leaderboard.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : leaderboard.length === 0 && !loadingLeaderboard ? (
                <p className={`${pressStart2P.className} text-center text-white/50 py-8 text-sm`}>
                  NO RECORDS FOUND
                </p>
              ) : (
                <>
                  <div className="space-y-2 overflow-y-auto flex-1">
                    <div className="grid grid-cols-4 gap-4 text-xs text-white/50 pb-2 border-b border-white/10 sticky top-0 bg-black/60 backdrop-blur-md">
                      <span className={`${pressStart2P.className}`}>RANK</span>
                      <span className={`${pressStart2P.className}`}>PLAYER</span>
                      <span className={`${pressStart2P.className}`}>SCORE</span>
                      <span className={`${pressStart2P.className}`}>TIER</span>
                    </div>
                    {leaderboard.map((entry, idx) => {
                      const globalRank = (currentPage - 1) * itemsPerPage + idx + 1;
                      return (
                        <div 
                          key={entry.id || idx} 
                          className={`grid grid-cols-4 gap-4 p-3 rounded-lg text-sm transition-all ${
                            entry.username === username 
                              ? 'bg-yellow-400/20 border border-yellow-400/50' 
                              : 'bg-white/5'
                          }`}
                        >
                          <span className={`${pressStart2P.className} ${
                            globalRank === 1 ? 'text-yellow-400' : 
                            globalRank === 2 ? 'text-slate-300' : 
                            globalRank === 3 ? 'text-orange-400' : 'text-white/70'
                          }`}>
                            #{globalRank}
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
                      );
                    })}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-4 border-t border-white/10">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`${pressStart2P.className} px-3 py-1 text-xs border border-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors`}
                      >
                        ←
                      </button>
                      <span className={`${pressStart2P.className} text-xs text-white/70 px-2`}>
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`${pressStart2P.className} px-3 py-1 text-xs border border-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors`}
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* RETURN BUTTON AT BOTTOM OF MODAL */}
            <div className="text-center mt-6 pt-4 border-t border-white/20">
              <button 
                onMouseEnter={() => playSFX('ClickSound.mp3')}
                onClick={() => { playSFX('ClickSound.mp3'); setShowLeaderboard(false); }}
                className={`${pressStart2P.className} border-2 border-white/20 text-white/50 p-4 hover:border-cyan-400 hover:text-cyan-400 transition-colors text-[10px] bg-black/80 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.8)]`}
              >
                [ RETURN ]
              </button>
            </div>
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
    <>
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0.8;
          }
        }
      `}</style>
      
      <main className="min-h-screen bg-purple-950 flex flex-col items-center justify-center pt-6 pb-6 px-6 relative overflow-hidden">
      {/* BACKGROUND IMAGE */}
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
      <Suspense fallback={<div className={`${pressStart2P.className} z-20 text-cyan-400 animate-pulse`}>LOADING GRID...</div>}>
        <GameBoard />
      </Suspense>
    </main>
    </>
  );
}