"use client";
import React, { useState, useEffect } from 'react'; // Add useState and useEffect here
import { Bell, Info, Wind } from 'lucide-react';

// --- TYPESCRIPT INTERFACES ---
interface MetricCardProps {
  title: string;
  value: number;
  status: string;
  target: string;
  color?: string;
  isWarning?: boolean;
  isInfo?: boolean;
}

// --- OPTIMAL RANGE CONFIGURATION ---
const SENSOR_CONFIG = {
  ammonia: { min: 0, max: 20, target: 10, color: "#22d3ee", label: "Ammonia" },
  ph: { min: 60, max: 85, target: 72, color: "#22d3ee", label: "pH Balance" },
  temp: { min: 70, max: 80, target: 78, color: "#f59e0b", label: "Temperature" },
  oxygen: { min: 80, max: 100, target: 94, color: "#10b981", label: "Oxygen" },
};

export default function Home() {
  const [sensorData, setSensorData] = useState({ 
    temperature: 0, 
    ph: 0, 
    ammonia: 0, 
    oxygen: 0 
  });

  // FETCH LIVE DATA FROM BACKEND
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sensor');
        const data = await res.json();
        // Update state with live values
        setSensorData({
          temperature: data.temperature || 0,
          ph: data.ph || 0,
          ammonia: data.ammonia || 0,
          oxygen: data.oxygen || 0
        });
      } catch (err) {
        console.error("Error fetching live data:", err);
      }
    };

    const interval = setInterval(fetchData, 500); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const getY = (val: number) => 200 - (val * 2);

  return (

    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      {/* HEADER SECTION */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-white">Aquarium Status</h2>
          <p className="text-slate-400">Real-time telemetry for Tank #042 - Reef Environment.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/20 uppercase tracking-widest">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> System Live
        </div>
      </header>

      {/* SENSOR GRID: ALL 4 SENSORS INCLUDED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <MetricCard 
          title="Ammonia Levels" 
          value={sensorData.ammonia} 
          status="Safe" 
          target="Target: < 15%" 
        />
        <MetricCard 
          title="pH Balance" 
          value={sensorData.ph} 
          status="Neutral" 
          target="Ideal: 7.0 - 8.2" 
          isInfo 
        />
        <MetricCard 
          title="Temperature" 
          value={sensorData.temperature} 
          status="Warm" 
          target="Current: 25.5°C" 
          isWarning 
          color="text-amber-500" 
        />
        <MetricCard 
          title="Dissolved Oxygen" 
          value={sensorData.oxygen} 
          status="Optimal" 
          target="Saturation: High" 
        />
      </div>

      {/* DETAILED DIFFERENTIABLE TREND SECTION */}
      <div className="mt-12 bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-3xl group shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <Wind size={20} className="text-cyan-400" /> Sensor History & Data Trends
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Differentiated multi-sensor tracking</p>
          </div>
          <div className="flex bg-slate-800/50 p-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-800/50">
            <button className="px-5 py-2 bg-cyan-500 text-black rounded-md shadow-lg transition-all">24h</button>
            <button className="px-5 py-2 text-slate-400 hover:text-white transition">7d</button>
            <button className="px-5 py-2 text-slate-400 hover:text-white transition">30d</button>
          </div>
        </div>

        <div className="h-80 bg-slate-950/50 rounded-2xl border border-slate-800/50 p-8 relative overflow-hidden group-hover:border-slate-700 transition-all">
          {/* Legend with distinct line indicators */}
          <div className="absolute top-4 right-6 hidden md:flex gap-6">
            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
              <div className="w-4 h-1 bg-cyan-400" /> AMMONIA
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
              <div className="w-4 h-1 border-t-2 border-dashed border-cyan-400/60" /> PH BALANCE
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
              <div className="w-4 h-1 bg-amber-500" /> TEMPERATURE
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
              <div className="w-4 h-1 border-t-2 border-dotted border-emerald-400" /> OXYGEN
            </div>
          </div>

          <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Background Grid Lines and Y-Axis Labels */}
            {[0, 25, 50, 75, 100].map(val => (
              <React.Fragment key={val}>
                <line x1="0" y1={getY(val)} x2="800" y2={getY(val)} stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
                <text x="-35" y={getY(val) + 4} className="fill-slate-600 text-[10px] font-bold">{val}%</text>
              </React.Fragment>
            ))}

            {/* Optimal Range Shading (e.g., pH) */}
            <rect 
              x="0" y={getY(SENSOR_CONFIG.ph.max)} 
              width="800" height={Math.abs(getY(SENSOR_CONFIG.ph.max) - getY(SENSOR_CONFIG.ph.min))} 
              fill="#22d3ee" fillOpacity="0.03" 
            />

            {/* Target Reference Line (e.g., Temp) */}
            <line 
              x1="0" y1={getY(SENSOR_CONFIG.temp.target)} x2="800" y2={getY(SENSOR_CONFIG.temp.target)} 
              stroke="#f59e0b" strokeWidth="1" strokeDasharray="10,10" opacity="0.2" 
            />

            {/* 1. AMMONIA: Solid Cyan Trend */}
            <path 
              d="M0 160 Q 100 140, 200 150 T 400 120 T 600 140 T 800 100" 
              fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            />

            {/* 2. PH BALANCE: Dashed Cyan Trend */}
            <path 
              d="M0 100 Q 150 105, 300 95 T 500 105 T 800 95" 
              fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="8,6" opacity="0.5"
            />

            {/* 3. TEMPERATURE: Solid Amber Trend */}
            <path 
              d="M0 120 Q 200 130, 400 110 T 600 125 T 800 90" 
              fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
            />

            {/* 4. OXYGEN: Dotted Emerald Trend */}
            <path 
              d="M0 80 Q 100 60, 200 70 T 400 40 T 600 55 T 800 30" 
              fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="2,4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// --- UI HELPER COMPONENTS ---
function MetricCard({ title, value, status, target, color = "text-cyan-400", isWarning, isInfo }: MetricCardProps) {
  const circ = 2 * Math.PI * 34;
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col items-center hover:border-slate-700 transition-all group shadow-lg">
      <div className="flex justify-between w-full mb-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-200">
        <span>{title}</span>
        {isWarning ? (
          <Bell size={14} className="text-amber-500 animate-pulse" />
        ) : isInfo ? (
          <Info size={14} className="text-cyan-400" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        )}
      </div>
      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-28 h-28 -rotate-90">
          <circle cx="56" cy="56" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
          <circle 
            cx="56" cy="56" r="34" 
            stroke="currentColor" strokeWidth="6" fill="transparent" 
            strokeDasharray={circ} 
            strokeDashoffset={circ - (value / 100) * circ} 
            strokeLinecap="round" 
            className={`${color} transition-all duration-1000`} 
          />
        </svg>
        <span className="absolute text-xl font-black text-white">{value}%</span>
      </div>
      <p className="text-[10px] text-slate-500 italic group-hover:text-slate-400 transition-colors">{target}</p>
    </div>
  );
}