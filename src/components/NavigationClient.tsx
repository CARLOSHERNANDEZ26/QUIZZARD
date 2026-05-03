"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function NavigationClient() {
  const [isBackgroundOn, setIsBackgroundOn] = useState(true);
  const pathname = usePathname();

  const toggleBackground = () => {
    setIsBackgroundOn(!isBackgroundOn);
  };

  useEffect(() => {
    // Apply background state to body
    if (isBackgroundOn) {
      document.body.style.backgroundImage = 'url(/quizzard_bg.jpg)';
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.filter = 'none'; // Remove blur from body
    } else {
      document.body.style.backgroundImage = 'none';
      document.body.style.filter = 'none';
    }
  }, [isBackgroundOn]);

  // Hide navigation on category, play, and leaderboard pages (playing state)
  const shouldHideNavigation = pathname === '/category' || pathname === '/play' || pathname === '/leaderboard';

  if (shouldHideNavigation) {
    return null;
  }

  return (
    <Navigation 
      onBackgroundToggle={toggleBackground} 
      isBackgroundOn={isBackgroundOn} 
    />
  );
}
