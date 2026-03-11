"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wind, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isFeeding, setIsFeeding] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFeed = async () => {
    try {
      setIsFeeding(true);
      // Sends the trigger to your /api/sensor route
      await fetch('/api/sensor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed: true })
      });

      // Keep the "Feeding..." state active for 3 seconds for visual feedback
      setTimeout(() => setIsFeeding(false), 3000);
    } catch (err) {
      console.error("Feed command failed:", err);
      setIsFeeding(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'History', href: '/history' },
    { name: 'Settings', href: '/settings' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <html lang="en">
      <head>
        <title>AquaPulse | Smart Aquarium Monitor</title>
      </head>
      <body className={`${inter.className} bg-[#050b14] text-slate-100`}>
        <nav className="flex justify-between items-center px-6 md:px-10 py-6 border-b border-slate-800/50 bg-[#050b14]/80 backdrop-blur-md sticky top-0 z-50">
          
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400 group-hover:border-cyan-500/50 transition-all">
              <Wind size={24} /> 
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase group-hover:text-cyan-400 transition-colors">
              AquaPulse
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex gap-10 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-all duration-300 ${
                  pathname === link.href ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-slate-400 hover:text-cyan-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Main Feed Button - Now visible on mobile/desktop via 'flex' instead of 'hidden md:flex' */}
            <button 
              onClick={handleFeed}
              disabled={isFeeding}
              className={`${isFeeding ? 'bg-emerald-500' : 'bg-cyan-500'} flex hover:scale-105 active:scale-95 text-[#050b14] px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]`}
            >
              <Zap size={18} fill="currentColor" className={isFeeding ? "animate-bounce" : ""} />
              <span className="text-sm md:inline">
                {isFeeding ? "Feeding..." : "Feed Fish"}
              </span>
            </button>

            <button className="md:hidden text-slate-400 p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* MOBILE MENU */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-[#050b14] border-b border-slate-800 p-6 flex flex-col gap-6 md:hidden">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`text-lg font-bold ${pathname === link.href ? 'text-cyan-400' : 'text-slate-400'}`}>
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {children}
      </body>
    </html>
  );
}