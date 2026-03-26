"use client";
import React, { useState, useEffect } from 'react';
import { Bell, Info, Wind } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  target: string;
  maxValue: number;
  color?: string;
  isWarning?: boolean;
  isInfo?: boolean;
}

export default function Home() {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    ph: 0,
    tds: 0,
    turbidity: 0
  });

  const [phHistory, setPhHistory] = useState<number[]>([]); // (kept but unused)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sensor');
        const data = await res.json();

        setSensorData({
          temperature: data.temperature || 0,
          ph: data.ph || 0,
          tds: data.tds || 0,
          turbidity: data.turbidity || 0
        });

        // kept but not used anymore
        setPhHistory(prev => {
          const updated = [...prev, data.ph || 0];
          return updated.slice(-40);
        });

      } catch (err) {
        console.error("Error fetching live data:", err);
      }
    };

    const interval = setInterval(fetchData, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">

      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-white">
            Aquarium Status
          </h2>
          <p className="text-slate-400">
            Real-time telemetry for Tank #042 - Smart Monitoring System.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/20 uppercase tracking-widest">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> System Live
        </div>
      </header>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">

        <MetricCard
          title="pH Balance"
          value={sensorData.ph}
          target="Ideal: 7.0 - 8.2"
          maxValue={14}
          isInfo
        />

        <MetricCard
          title="Temperature (°C)"
          value={sensorData.temperature}
          target="Target: 24 - 28°C"
          maxValue={50}
          color="text-amber-500"
        />

        <MetricCard
          title="TDS (ppm)"
          value={sensorData.tds}
          target="Safe: < 500 ppm"
          maxValue={1000}
          color="text-indigo-400"
        />

        <MetricCard
          title="Turbidity"
          value={sensorData.turbidity}
          target="Clear Water Low NTU"
          maxValue={3000}
          color="text-emerald-400"
        />

      </div>

      {/* 🔥 HEALTH STATUS BOX (REPLACED GRAPH) */}
      <div className="mt-12 bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Wind size={20} className="text-cyan-400" /> Fish Health Status
          </h3>
        </div>

        {(() => {
          let issues = 0;
          let problems: string[] = [];

          if (sensorData.ph < 6.5 || sensorData.ph > 8.2) {
            issues++;
            problems.push("pH");
          }

          if (sensorData.temperature < 24 || sensorData.temperature > 28) {
            issues++;
            problems.push("Temperature");
          }

          if (sensorData.tds > 500) {
            issues++;
            problems.push("TDS");
          }

          if (sensorData.turbidity > 1000) {
            issues++;
            problems.push("Turbidity");
          }

          let status = "";
          let color = "";

          if (issues === 0) {
            status = "Healthy Aquarium ✅";
            color = "text-emerald-400";
          } 
          else if (issues === 1) {
            status = `Slightly Unstable ⚠️ (${problems.join(", ")})`;
            color = "text-yellow-400";
          } 
          else {
            status = `Danger Condition ❌ (${problems.join(", ")})`;
            color = "text-red-500";
          }

          return (
            <div className="h-72 flex flex-col justify-center items-center bg-slate-950/50 rounded-2xl border border-slate-800/50">

              <div className={`text-3xl font-bold ${color} animate-pulse`}>
                {status}
              </div>

              <p className="text-slate-400 mt-4 text-center px-6">
                Based on pH, Temperature, TDS and Turbidity levels
              </p>

            </div>
          );
        })()}

      </div>

    </div>
  );
}

// ---------------- CARD COMPONENT ----------------

function MetricCard({
  title,
  value,
  target,
  maxValue,
  color="text-cyan-400",
  isWarning,
  isInfo
}: MetricCardProps) {

  const percentage = (value / maxValue) * 100;
  const circ = 2 * Math.PI * 34;

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col items-center">

      <div className="flex justify-between w-full mb-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <span>{title}</span>
        {isWarning
          ? <Bell size={14} className="text-amber-500 animate-pulse"/>
          : isInfo
          ? <Info size={14} className="text-cyan-400"/>
          : <div className="h-2 w-2 rounded-full bg-emerald-500"/>
        }
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
            strokeDashoffset={circ - (percentage / 100) * circ}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000`}
          />
        </svg>

        <span className="absolute text-xl font-black text-white">
          {value.toFixed(1)}
        </span>
      </div>

      <p className="text-[10px] text-slate-500 italic text-center">{target}</p>
    </div>
  );
}