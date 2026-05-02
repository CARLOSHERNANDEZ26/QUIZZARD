"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Press_Start_2P } from 'next/font/google';

const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

export default function GlobalBGM() {
  const pathname = usePathname();
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. Initialize the audio ONLY ONCE for the whole app
  useEffect(() => {
    if (typeof window !== 'undefined' && !bgmRef.current) {
      bgmRef.current = new Audio('/sounds/main.mp3');
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.4; // Keep it low so click sounds pop!
    }
  }, []);

  // 2. Watch where the player navigates!
  useEffect(() => {
    if (!bgmRef.current) return;

    // If they enter the actual game board, STOP the main menu music
    if (pathname === '/play') {
      bgmRef.current.pause();
    } 
    // Otherwise (Home, Leaderboard, Category), keep it playing if it was toggled ON
    else if (isPlaying) {
      bgmRef.current.play().catch(e => console.log("BGM blocked:", e));
    }
  }, [pathname, isPlaying]);

  const toggleMusic = () => {
    // Optional: Add a click sound here if you want!
    // new Audio('/sounds/ClickSound.mp3').play().catch(e => console.log(e));
    
    if (isPlaying) {
      bgmRef.current?.pause();
      setIsPlaying(false);
    } else {
      bgmRef.current?.play().catch(e => console.log("BGM blocked:", e));
      setIsPlaying(true);
    }
  };

  // 3. Hide this button completely when they are playing the actual quiz
  if (pathname === '/play') return null;

  return (
    <button
      onClick={toggleMusic}
      className={`${pressStart2P.className} fixed top-6 right-6 z-[100] border-2 ${isPlaying ? 'border-green-400 text-green-400' : 'border-red-500 text-red-500'} bg-black/50 p-3 text-[10px] hover:scale-105 transition-transform`}
    >
      [ BGM: {isPlaying ? 'ON' : 'OFF'} ]
    </button>
  );
}