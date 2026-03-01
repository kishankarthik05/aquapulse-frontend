"use client";
import React, { useState, useEffect } from 'react';
import { Bell, Info, Wind } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  status: string;
  target: string;
  color?: string;
  isWarning?: boolean;
  isInfo?: boolean;
}

export default function Home() {

  const [sensorData, setSensorData] = useState({
    temperature: 0,
    ph: 0,
    ammonia: 0,
    oxygen: 0
  });

  const [phHistory, setPhHistory] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sensor');
        const data = await res.json();

        setSensorData({
          temperature: data.temperature || 0,
          ph: data.ph || 0,
          ammonia: data.ammonia || 0,
          oxygen: data.oxygen || 0
        });

        setPhHistory(prev => {
          const updated = [...prev, data.ph || 0];
          return updated.slice(-40);
        });

      } catch (err) {
        console.error("Error fetching live data:", err);
      }
    };

    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const getY = (val: number) => 200 - (val * 20); // better scale for pH range 0–10

  const buildPath = () => {
    if (phHistory.length < 2) return "";
    const stepX = 800 / (phHistory.length - 1);
    return phHistory.map((v, i) => {
      const x = i * stepX;
      const y = getY(v);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">

      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-white">Aquarium Status</h2>
          <p className="text-slate-400">Real-time telemetry for Tank #042 - Reef Environment.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/20 uppercase tracking-widest">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> System Live
        </div>
      </header>

      {/* SENSOR GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <MetricCard title="Ammonia Levels" value={sensorData.ammonia} status="Safe" target="Target: < 15%" />
        <MetricCard title="pH Balance" value={sensorData.ph} status="Neutral" target="Ideal: 7.0 - 8.2" isInfo />
        <MetricCard title="Temperature" value={sensorData.temperature} status="Warm" target="Current: 25.5°C" isWarning color="text-amber-500" />
        <MetricCard title="Dissolved Oxygen" value={sensorData.oxygen} status="Optimal" target="Saturation: High" />
      </div>

      {/* SIMPLER GRAPH */}
      <div className="mt-12 bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl">

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Wind size={20} className="text-cyan-400" /> Live pH Trend
          </h3>
          <span className="text-sm text-cyan-400 font-semibold">
            Current pH: {sensorData.ph.toFixed(2)}
          </span>
        </div>

        <div className="h-72 bg-slate-950/50 rounded-2xl border border-slate-800/50 p-6">

          <svg viewBox="0 0 800 200" className="w-full h-full">

            {/* grid lines */}
            {[2,4,6,8].map(val => (
              <line key={val}
                x1="0" y1={getY(val)} x2="800" y2={getY(val)}
                stroke="#1e293b"
                strokeDasharray="4,4"
              />
            ))}

            {/* safe zone */}
            <rect
              x="0"
              y={getY(8.2)}
              width="800"
              height={Math.abs(getY(8.2)-getY(7))}
              fill="#22d3ee"
              fillOpacity="0.08"
            />

            {/* live line */}
            <path
              d={buildPath()}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="3"
            />

          </svg>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, target, color="text-cyan-400", isWarning, isInfo }: MetricCardProps) {
  const circ = 2 * Math.PI * 34;
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col items-center">
      <div className="flex justify-between w-full mb-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <span>{title}</span>
        {isWarning ? <Bell size={14} className="text-amber-500 animate-pulse"/>
        : isInfo ? <Info size={14} className="text-cyan-400"/>
        : <div className="h-2 w-2 rounded-full bg-emerald-500"/>}
      </div>

      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-28 h-28 -rotate-90">
          <circle cx="56" cy="56" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800"/>
          <circle
            cx="56"
            cy="56"
            r="34"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circ}
            strokeDashoffset={circ - (value/100)*circ}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000`}
          />
        </svg>
        <span className="absolute text-xl font-black text-white">{value}%</span>
      </div>

      <p className="text-[10px] text-slate-500 italic">{target}</p>
    </div>
  );
}