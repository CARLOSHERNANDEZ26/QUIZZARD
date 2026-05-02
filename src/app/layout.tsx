import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. IMPORT YOUR NEW COMPONENT HERE
import GlobalBGM from "@/components/GlobalBGM"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quizzard Arcade",
  description: "IT Expo 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. INJECT IT HERE, RIGHT ABOVE {children} */}
        <GlobalBGM /> 
        
        {children}
      </body>
    </html>
  );
}