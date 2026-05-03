"use client";
import { useState } from "react";
import { Press_Start_2P } from 'next/font/google';
import Image from 'next/image';

const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

interface NavigationProps {
  onBackgroundToggle: () => void;
  isBackgroundOn: boolean;
}

export default function Navigation({ onBackgroundToggle, isBackgroundOn }: NavigationProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modal: string) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-24">
            {/* Navigation Links - Centered */}
            <div className="flex items-center space-x-8">
              <button
                onClick={() => openModal('categories')}
                className={`${pressStart2P.className} text-white border border-purple-200/50 px-4 py-2 bg-purple-500/10 transition-all duration-200 text-sm hover:scale-110 hover:bg-purple-500/20 hover:border-purple-300/70`}
              >
                CATEGORIES
              </button>
              <button
                onClick={() => openModal('faq')}
                className={`${pressStart2P.className} text-white border border-purple-200/50 px-4 py-2 bg-purple-500/10 transition-all duration-200 text-sm hover:scale-110 hover:bg-purple-500/20 hover:border-purple-300/70`}
              >
                FAQ's
              </button>
              <button
                onClick={() => openModal('howToPlay')}
                className={`${pressStart2P.className} text-yellow-400 border-2 border-yellow-400 px-6 py-3 bg-yellow-400/20 transition-all duration-200 text-base hover:scale-110 hover:bg-yellow-400 hover:text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]`}
              >
                HOW TO PLAY
              </button>
              <button
                onClick={() => openModal('rewards')}
                className={`${pressStart2P.className} text-white border border-purple-200/50 px-4 py-2 bg-purple-500/10 transition-all duration-200 text-sm hover:scale-110 hover:bg-purple-500/20 hover:border-purple-300/70`}
              >
                REWARDS
              </button>
              <button
                onClick={() => openModal('socials')}
                className={`${pressStart2P.className} text-white border border-purple-200/50 px-4 py-2 bg-purple-500/10 transition-all duration-200 text-sm hover:scale-110 hover:bg-purple-500/20 hover:border-purple-300/70`}
              >
                SOCIALS
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* How to Play Modal */}
      {activeModal === 'howToPlay' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 transition-all duration-300">
          <div className="backdrop-blur-md bg-black/60 border-2 border-cyan-400 rounded-2xl p-8 w-full max-w-2xl shadow-[0_8px_32px_rgba(34,211,238,0.3)] transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <h2 className={`${pressStart2P.className} text-2xl text-cyan-400`}>
                HOW TO PLAY
              </h2>
            </div>
            
            <div className="space-y-4 text-white/80">
              <div className={`${pressStart2P.className} text-sm space-y-3`}>
                <p><span className="text-yellow-400">OBJECTIVE:</span> Answer questions correctly to reach 1000 points!</p>
                <p><span className="text-red-400">LIVES:</span> You start with 3 lives. Wrong answers cost 1 life.</p>
                <p><span className="text-blue-400">TIMER:</span> Each question has a 15-second time limit.</p>
                <p><span className="text-orange-400">STREAKS:</span> Build streaks for power-up rewards every 5 correct answers.</p>
                <p><span className="text-green-400">POWER-UPS:</span> Use 50/50, Time Freeze, or Life Line strategically.</p>
                <p><span className="text-purple-400">WIN:</span> Reach 1000 points or survive with the highest score!</p>
              </div>
              
              <div className="border-t border-white/20 pt-4">
                <h3 className={`${pressStart2P.className} text-lg text-cyan-400 mb-2`}>QUESTION TYPES</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-yellow-300">Multiple Choice:</span> Select the correct answer</p>
                  <p className="text-sm"><span className="text-yellow-300">Identification:</span> Type your answer</p>
                  <p className="text-sm"><span className="text-yellow-300">4 Pics:</span> Guess what the images represent</p>
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-4">
                <h3 className={`${pressStart2P.className} text-lg text-cyan-400 mb-2`}>SCORING</h3>
                <div className="space-y-1">
                  <p className="text-sm">Correct Answer: +30 points</p>
                  <p className="text-sm">Wrong Answer: -1 life</p>
                  <p className="text-sm">Time Out: -1 life</p>
                </div>
              </div>
            </div>
            
            {/* RETURN Button */}
            <div className="text-center mt-6 pt-4 border-t border-white/20">
              <button 
                onClick={closeModal}
                className={`${pressStart2P.className} border-2 border-cyan-400 text-cyan-400 p-4 hover:bg-cyan-400 hover:text-black transition-colors text-xs bg-black/80 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.8)]`}
              >
                [ RETURN ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Modal */}
      {activeModal === 'categories' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 transition-all duration-300">
          <div className="backdrop-blur-md bg-black/60 border-2 border-yellow-400 rounded-2xl p-8 w-full max-w-3xl shadow-[0_8px_32px_rgba(250,204,21,0.3)] transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <h2 className={`${pressStart2P.className} text-2xl text-yellow-400`}>
                CATEGORIES
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center group cursor-pointer transform transition-all duration-200 hover:scale-110">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)] group-hover:shadow-[0_0_30px_rgba(34,197,94,0.8)]">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className={`${pressStart2P.className} text-green-400 text-xs`}>SCIENCE</h3>
                <p className="text-white/60 text-xs mt-1">Chemistry, Physics, Biology</p>
              </div>
              
              <div className="text-center group cursor-pointer transform transition-all duration-200 hover:scale-110">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`${pressStart2P.className} text-red-400 text-xs`}>GEN MATH</h3>
                <p className="text-white/60 text-xs mt-1">Algebra, Geometry, Statistics</p>
              </div>
              
              <div className="text-center group cursor-pointer transform transition-all duration-200 hover:scale-110">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`${pressStart2P.className} text-cyan-400 text-xs`}>TECHNOLOGY</h3>
                <p className="text-white/60 text-xs mt-1">Programming, Hardware, Internet</p>
              </div>
              
              <div className="text-center group cursor-pointer transform transition-all duration-200 hover:scale-110">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.5)] group-hover:shadow-[0_0_30px_rgba(250,204,21,0.8)]">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className={`${pressStart2P.className} text-yellow-400 text-xs`}>HISTORY</h3>
                <p className="text-white/60 text-xs mt-1">World History, Events, People</p>
              </div>
            </div>
            
            {/* RETURN Button */}
            <div className="text-center mt-6 pt-4 border-t border-white/20">
              <button 
                onClick={closeModal}
                className={`${pressStart2P.className} border-2 border-yellow-400 text-yellow-400 p-4 hover:bg-yellow-400 hover:text-black transition-colors text-xs bg-black/80 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(250,204,21,0.8)]`}
              >
                [ RETURN ]
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <p className={`${pressStart2P.className} text-white/60 text-xs`}>
                Each category contains 40+ medium difficulty questions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Modal */}
      {activeModal === 'rewards' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 transition-all duration-300">
          <div className="backdrop-blur-md bg-black/60 border-2 border-purple-400 rounded-2xl p-8 w-full max-w-2xl shadow-[0_8px_32px_rgba(168,85,247,0.3)] transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <h2 className={`${pressStart2P.className} text-2xl text-purple-400`}>
                REWARDS
              </h2>
            </div>
            
            <div className="space-y-4">
              {/* 450 Points Reward */}
              <div className="backdrop-blur-sm bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-400/50 rounded-xl p-4 transform transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`${pressStart2P.className} text-blue-400 text-sm`}>PHOTO CARD</h3>
                      <p className="text-white/60 text-xs mt-1">Exclusive Quizzard collectible photo card</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${pressStart2P.className} text-blue-400 text-lg`}>450</div>
                    <div className="text-white/60 text-xs">POINTS</div>
                  </div>
                </div>
              </div>

              {/* 650 Points Reward */}
              <div className="backdrop-blur-sm bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-400/50 rounded-xl p-4 transform transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        <circle cx="17.5" cy="9.5" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`${pressStart2P.className} text-purple-400 text-sm`}>3D PRINTED CCS KEYCHAIN</h3>
                      <p className="text-white/60 text-xs mt-1">Custom CCS keychain (Quantity: 2)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${pressStart2P.className} text-purple-400 text-lg`}>650</div>
                    <div className="text-white/60 text-xs">POINTS</div>
                  </div>
                </div>
              </div>

              {/* 1000 Points Reward */}
              <div className="backdrop-blur-sm bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-400/50 rounded-xl p-4 transform transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5zM5 15a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2v-3a2 2 0 00-2-2H5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2v-3a2 2 0 00-2-2h-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`${pressStart2P.className} text-yellow-400 text-sm`}>GAMING MOUSE</h3>
                      <p className="text-white/60 text-xs mt-1">High-performance gaming mouse (Quantity: 1)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${pressStart2P.className} text-yellow-400 text-lg animate-pulse`}>1000</div>
                    <div className="text-white/60 text-xs">POINTS</div>
                  </div>
                </div>
              </div>
              
              {/* RETURN Button */}
              <div className="text-center mt-6 pt-4 border-t border-white/20">
                <button 
                  onClick={closeModal}
                  className={`${pressStart2P.className} border-2 border-purple-400 text-purple-400 p-4 hover:bg-purple-400 hover:text-black transition-colors text-xs bg-black/80 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.8)]`}
                >
                  [ RETURN ]
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center border-t border-white/20 pt-4">
              <p className={`${pressStart2P.className} text-white/60 text-xs`}>
                Claim your rewards at the CCS booth during IT Expo 2026
              </p>
              <p className="text-white/40 text-xs mt-2">
                Rewards are limited and subject to availability
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 transition-all duration-300">
          <div className="backdrop-blur-md bg-black/60 border-2 border-orange-400 rounded-2xl p-8 w-full max-w-2xl shadow-[0_8px_32px_rgba(251,146,60,0.3)] transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <h2 className={`${pressStart2P.className} text-2xl text-orange-400`}>
                FAQ's
              </h2>
            </div>
            
            <div className="space-y-4 text-white/80">
              <div className={`${pressStart2P.className} text-sm space-y-3`}>
                <div className="border-l-4 border-orange-400 pl-4">
                  <p className="text-orange-300 font-bold">Q: How do I start playing?</p>
                  <p className="text-white/70 mt-1">A: Click PLAY on the main menu, enter your name and access code "QUIZ2026".</p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4">
                  <p className="text-orange-300 font-bold">Q: What happens when I reach 1020 points?</p>
                  <p className="text-white/70 mt-1">A: You trigger the Congratulations screen after 34 correct answers and can claim rewards at the CCS booth.</p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4">
                  <p className="text-orange-300 font-bold">Q: Can I play multiple times?</p>
                  <p className="text-white/70 mt-1">A: Yes! You can play as many times as you want. Each game is shuffled randomly.</p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4">
                  <p className="text-orange-300 font-bold">Q: How do power-ups work?</p>
                  <p className="text-white/70 mt-1">A: Build streaks of 5 correct answers to earn power-ups: 50/50, Time Freeze, or Life Line.</p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4">
                  <p className="text-orange-300 font-bold">Q: What are the rewards?</p>
                  <p className="text-white/70 mt-1">A: 450 points = Photo Card, 650 points = 3D Keychain, 1020 points = Gaming Mouse.</p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4">
                  <p className="text-orange-300 font-bold">Q: Where can I claim my rewards?</p>
                  <p className="text-white/70 mt-1">A: Visit the CCS booth during IT Expo 2026 with your score proof.</p>
                </div>
              </div>
            </div>
            
            {/* RETURN Button */}
            <div className="text-center mt-6 pt-4 border-t border-white/20">
              <button 
                onClick={closeModal}
                className={`${pressStart2P.className} border-2 border-orange-400 text-orange-400 p-4 hover:bg-orange-400 hover:text-black transition-colors text-xs bg-black/80 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(251,146,60,0.8)]`}
              >
                [ RETURN ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Socials Modal */}
      {activeModal === 'socials' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 transition-all duration-300">
          <div className="backdrop-blur-md bg-black/60 border-2 border-pink-400 rounded-2xl p-8 w-full max-w-2xl shadow-[0_8px_32px_rgba(236,72,153,0.3)] transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <h2 className={`${pressStart2P.className} text-2xl text-pink-400`}>
                SOCIALS
              </h2>
            </div>
            
            <div className="text-center space-y-6">
              <div className={`${pressStart2P.className} text-white/80 text-sm`}>
                <p className="mb-4">SCAN TO CONNECT WITH QUIZZARD!</p>
              </div>
              
              {/* QR Code Placeholder */}
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-white rounded-lg p-4 shadow-[0_0_30px_rgba(236,72,153,0.5)]">
                  <Image src="/assets/QuzzardbyOdevs_Qr.png" alt="QR Code" width={240} height={240} className="w-full h-full object-contain" />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className={`${pressStart2P.className} text-pink-400 text-sm`}>FOLLOW US FOR:</p>
                <div className="grid grid-cols-2 gap-4 text-white/60 text-xs">
                  <div>Game Updates</div>
                  <div>Leaderboard Highlights</div>
                  <div>Exclusive Rewards</div>
                  <div>Event Announcements</div>
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-4">
                <p className={`${pressStart2P.className} text-white/40 text-xs`}>
                  @quizzard_arcade | #ITExpo2026
                </p>
              </div>
              
              {/* RETURN Button */}
              <div className="text-center mt-6 pt-4 border-t border-white/20">
                <button 
                  onClick={closeModal}
                  className={`${pressStart2P.className} border-2 border-pink-400 text-pink-400 p-4 hover:bg-pink-400 hover:text-black transition-colors text-xs bg-black/80 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.8)]`}
                >
                  [ RETURN ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
