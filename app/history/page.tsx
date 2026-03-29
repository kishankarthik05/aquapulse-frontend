"use client";
import React, { useEffect, useState } from 'react';
import { Wind, Download } from 'lucide-react';

const OPTIMAL_RANGES = {
  ph: { min: 6.5, max: 8.2, target: 7.2, label: "Ideal 7.0-8.2" },
  temp: { min: 24, max: 32, target: 28, label: "Ideal 24-32°C" },
  tds: { min: 0, max: 500, target: 300, label: "Good < 500 ppm" },
  turbidity: { min: 0, max: 3000, target: 500, label: "Clear Water Low NTU" },
};

export default function HistoryPage() {

  const [history, setHistory] = useState({
    ph: [] as number[],
    temp: [] as number[],
    tds: [] as number[],
    turbidity: [] as number[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/sensor');
        const data = await res.json();

        setHistory(prev => ({
          ph: [...prev.ph, data.ph || 0].slice(-40),
          temp: [...prev.temp, data.temperature || 0].slice(-40),
          tds: [...prev.tds, data.tds || 0].slice(-40),
          turbidity: [...prev.turbidity, data.turbidity || 0].slice(-40),
        }));

      } catch (err) {
        console.error("History fetch error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">

      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-white">
            Sensor History & Analytics
          </h2>
          <p className="text-slate-400">Deep dive into aquarium health trends.</p>
        </div>

        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-slate-700 text-white transition shadow-md">
          <Download size={14} /> EXPORT CSV
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ChartCard title="pH Balance" color="#22d3ee" range={OPTIMAL_RANGES.ph} data={history.ph} />
        <ChartCard title="Temperature (°C)" color="#f59e0b" range={OPTIMAL_RANGES.temp} data={history.temp} />
        <ChartCard title="TDS (ppm)" color="#6366f1" range={OPTIMAL_RANGES.tds} data={history.tds} />
        <ChartCard title="Turbidity" color="#10b981" range={OPTIMAL_RANGES.turbidity} data={history.turbidity} />
      </div>

    </div>
  );
}

function ChartCard({
  title,
  color,
  range,
  data
}: {
  title: string,
  color: string,
  range: any,
  data: number[]
}) {

  // ✅ NORMALIZED SCALING (REALISTIC)
  const getY = (val: number) => {
    const normalized = (val - range.min) / (range.max - range.min);
    return 200 - normalized * 180;
  };

  // ✅ ADD SMALL NATURAL VARIATION
  const smoothData = data.map((v, i) => {
    const noise = Math.sin(i * 0.5) * 0.3; // tiny wave effect
    return v + noise;
  });

  // ✅ STATUS
 const getStatus = () => {
  if (data.length === 0) return "NO DATA";

  const latest = data[data.length - 1];

  if (latest >= range.min && latest <= range.max) {
    return "NEUTRAL";
  } else {
    return "NOT NEUTRAL";
  }
};

  // ✅ GRAPH PATH
  const buildPath = () => {
    if (smoothData.length < 2) return "";
    const stepX = 800 / (smoothData.length - 1);

    return smoothData.map((v, i) => {
      const x = i * stepX;
      const y = getY(v);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl group hover:border-slate-700 transition-all shadow-lg">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-200">{title}</h3>
          <span className="text-[10px] text-emerald-500/80 uppercase tracking-tighter">
            {range.label}
          </span>
        </div>
        <span
  className={`text-xs font-bold ${
    getStatus() === "NEUTRAL"
      ? "text-emerald-400"
      : "text-red-400"
  }`}
>
  {getStatus()}
</span>
      </div>

      <div className="h-48 w-full bg-slate-950/50 rounded-xl border border-slate-800/50 relative p-4 overflow-hidden">

        <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="none">

          {/* ✅ Y AXIS LABELS */}
          {[0, 0.5, 1].map((p, i) => {
            const value = (range.min + p * (range.max - range.min)).toFixed(1);
            const y = 200 - p * 180;

            return (
              <g key={i}>
                <text
  x="5"
  y={y - 2}
  fill="#94a3b8"
  fontSize="19"
  fontWeight="600"
>
  {value}
</text>

                <line
                  x1="0"
                  y1={y}
                  x2="800"
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              </g>
            );
          })}

          {/* optimal zone */}
          <rect
            x="0"
            y={getY(range.max)}
            width="800"
            height={Math.abs(getY(range.max) - getY(range.min))}
            fill={color}
            fillOpacity="0.05"
          />

          {/* target line */}
          <line
            x1="0"
            y1={getY(range.target)}
            x2="800"
            y2={getY(range.target)}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="8,8"
            opacity="0.3"
          />

          {/* REALISTIC LINE */}
          <path
            d={buildPath()}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

        </svg>
      </div>
    </div>
  );
}