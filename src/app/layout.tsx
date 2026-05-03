import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. IMPORT YOUR NEW COMPONENT HERE
import GlobalBGM from "@/components/GlobalBGM";
import NavigationClient from "@/components/NavigationClient"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quizzard Arcade",
  description: "IT Expo 2026",
  icons: {
    icon: '/assets/android-chrome-512x512.png',
    shortcut: '/assets/android-chrome-512x512.png',
    apple: '/assets/android-chrome-512x512.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/favicon.ico" />
      </head>
      <body className={inter.className}>
        {/* 2. INJECT IT HERE, RIGHT ABOVE {children} */}
        <GlobalBGM /> 
        <NavigationClientWrapper />
        
        {children}
      </body>
    </html>
  );
}

// Client wrapper for navigation with state
function NavigationClientWrapper() {
  return <NavigationClient />;
}