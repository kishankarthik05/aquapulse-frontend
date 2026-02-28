"use client";
import React from 'react';
import { Wind, Download } from 'lucide-react';

const OPTIMAL_RANGES = {
  ammonia: { min: 0, max: 20, target: 10, label: "Target < 15%" },
  ph: { min: 60, max: 85, target: 72, label: "Ideal 7.0-8.2" },
  temp: { min: 70, max: 80, target: 78, label: "Ideal 75-78°F" },
  oxygen: { min: 80, max: 100, target: 94, label: "Target > 90%" },
};

export default function HistoryPage() {
  const logs = [
    { time: "Oct 24, 14:30", ammonia: "0.01", ph: "8.2", temp: "78.4", oxygen: "7.2", status: "HEALTHY" },
    { time: "Oct 24, 14:15", ammonia: "0.02", ph: "8.1", temp: "78.5", oxygen: "7.1", status: "HEALTHY" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-white">Sensor History & Analytics</h2>
          <p className="text-slate-400">Deep dive into aquarium health trends.</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-slate-700 text-white transition shadow-md">
          <Download size={14} /> EXPORT CSV
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ChartCard title="Ammonia Levels" color="#22d3ee" range={OPTIMAL_RANGES.ammonia} />
        <ChartCard title="pH Balance" color="#22d3ee" range={OPTIMAL_RANGES.ph} />
        <ChartCard title="Temperature (°F)" color="#f59e0b" range={OPTIMAL_RANGES.temp} />
        <ChartCard title="Dissolved Oxygen" color="#10b981" range={OPTIMAL_RANGES.oxygen} />
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
           <h3 className="font-bold text-white uppercase text-xs tracking-widest">Historical Logs</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-800">
            <tr><th className="p-6">Timestamp</th><th>Ammonia</th><th>PH</th><th>Temp</th><th>Oxygen</th><th className="p-6">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {logs.map((log, i) => (
              <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                <td className="p-6 text-slate-400">{log.time}</td>
                <td className="font-medium text-slate-200">{log.ammonia}</td>
                <td className="font-medium text-slate-200">{log.ph}</td>
                <td className="font-medium text-slate-200">{log.temp}</td>
                <td className="font-medium text-slate-200">{log.oxygen}</td>
                <td className="p-6"><span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-[10px] font-bold ring-1 ring-emerald-500/20">{log.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChartCard({ title, color, range }: { title: string, color: string, range: any }) {
  const getY = (val: number) => 200 - (val * 2);
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl group hover:border-slate-700 transition-all shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div><h3 className="font-bold text-slate-200">{title}</h3><span className="text-[10px] text-emerald-500/80 uppercase tracking-tighter">{range.label}</span></div>
        <Wind size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
      </div>
      <div className="h-48 w-full bg-slate-950/50 rounded-xl border border-slate-800/50 relative p-4 overflow-hidden">
        <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="none">
          <rect x="0" y={getY(range.max)} width="800" height={Math.abs(getY(range.max) - getY(range.min))} fill={color} fillOpacity="0.05" />
          <line x1="0" y1={getY(range.target)} x2="800" y2={getY(range.target)} stroke={color} strokeWidth="1" strokeDasharray="8,8" opacity="0.3" />
          <path d="M0 150 Q 100 50, 200 120 T 400 80 T 600 130 T 800 60" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
        </svg>
      </div>
    </div>
  );
}