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

  const handleFeed = () => {
    setIsFeeding(true);
    setTimeout(() => setIsFeeding(false), 3000);
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
        <meta name="description" content="Real-time telemetry and ecosystem tracking." />
      </head>
      <body className={`${inter.className} bg-[#050b14] text-slate-100`}>
        <nav className="flex justify-between items-center px-6 md:px-10 py-6 border-b border-slate-800/50 bg-[#050b14]/80 backdrop-blur-md sticky top-0 z-50">
          
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)] text-cyan-400 group-hover:border-cyan-500/50 transition-all">
              <Wind size={24} /> 
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase group-hover:text-cyan-400 transition-colors">
              AquaPulse
            </span>
          </Link>

          {/* DESKTOP NAV (Hidden on mobile) */}
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
            <button 
              onClick={handleFeed}
              disabled={isFeeding}
              className={`${isFeeding ? 'bg-emerald-500' : 'bg-cyan-500'} hidden md:flex hover:scale-105 active:scale-95 text-[#050b14] px-5 py-2.5 rounded-xl font-bold items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]`}
            >
              <Zap size={18} fill="currentColor" className={isFeeding ? "animate-bounce" : ""} />
              {isFeeding ? "Feeding..." : "Feed Your Fish"}
            </button>

            {/* MOBILE MENU TOGGLE ICON */}
            <button className="md:hidden text-slate-400 p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* MOBILE MENU DROPDOWN */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-[#050b14] border-b border-slate-800 p-6 flex flex-col gap-6 md:hidden animate-in fade-in slide-in-from-top-4">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`text-lg font-bold ${pathname === link.href ? 'text-cyan-400' : 'text-slate-400'}`}>
                  {link.name}
                </Link>
              ))}
              <button onClick={() => { handleFeed(); setIsMobileMenuOpen(false); }} className="bg-cyan-500 text-black p-4 rounded-xl font-bold flex justify-center gap-2">
                <Zap size={20} fill="currentColor" /> Feed Fish Now
              </button>
            </div>
          )}
        </nav>

        {children}

        <footer className="mt-20 pt-16 border-t border-slate-800/60 max-w-7xl mx-auto px-10 pb-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-6 font-bold text-lg group">
               <div className="bg-cyan-500/10 p-1 rounded text-cyan-400 group-hover:text-cyan-300 transition-all"><Wind size={16} /></div>
               <span className="group-hover:text-cyan-400 transition-colors">AquaPulse</span>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-xs">
              Advanced smart monitoring for aquatic ecosystems.
            </p>
          </div>
          <div className="space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-widest mb-4 text-white">Support</h5>
            <p className="text-slate-400 hover:text-cyan-400 cursor-pointer transition">API Documentation</p>
            <p className="text-slate-400 hover:text-cyan-400 cursor-pointer transition">Safety Protocols</p>
          </div>
          <div className="text-slate-400 space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-widest mb-4 text-white">Contact Us</h5>
            <p className="hover:text-cyan-400 transition cursor-pointer">support@aquapulse.io</p>
            <p>+1 (555) 902-1234</p>
          </div>
        </footer>
      </body>
    </html>
  );
}