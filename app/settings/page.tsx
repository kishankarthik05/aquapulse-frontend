"use client";
import React from 'react';
import { User, Bell, Save, Camera } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-10 py-10">
      <div className="flex flex-col md:flex-row gap-10">
        {/* SIDEBAR - PROFILE ONLY */}
        <aside className="w-full md:w-64 space-y-2">
          <h2 className="text-2xl font-bold mb-6 text-white text-left">Settings</h2>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl font-bold text-sm">
            <User size={18} /> Profile
          </button>
        </aside>

        <div className="flex-1 space-y-12">
          {/* PROFILE SECTION */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2 text-left">Profile Details</h3>
            <p className="text-slate-500 text-sm mb-8 text-left">Update your personal information and account security settings.</p>
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden flex items-center justify-center text-slate-600 relative">
                  <User size={64} /><button className="absolute bottom-0 right-0 bg-cyan-500 p-2 rounded-full text-black shadow-lg"><Camera size={16} /></button>
                </div>
                <button className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Change Photo</button>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Full Name" placeholder="Rajkumar" />
                <InputGroup label="Email" placeholder="rajkumar@aquapulse.io" />
                <InputGroup label="New Password" placeholder="••••••••" type="password" />
                <InputGroup label="Confirm Password" placeholder="••••••••" type="password" />
                <div className="md:col-span-2 flex justify-end"><button className="bg-cyan-500 text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2"><Save size={18} /> Save Profile</button></div>
              </div>
            </div>
          </section>

          {/* ALERT NOTIFICATIONS */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-8 text-left">Alert Notifications</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800"><th className="pb-6">Sensor</th><th className="text-center">Push</th><th className="text-center">Email</th><th className="text-center">SMS</th></tr></thead>
                <tbody className="divide-y divide-slate-800/50">
                  <NotificationRow name="Ammonia (NH3)" color="text-cyan-400" />
                  <NotificationRow name="Temperature" color="text-amber-500" />
                  <NotificationRow name="pH Level" color="text-cyan-400" />
                  <NotificationRow name="Oxygen (O2)" color="text-emerald-500" />
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Helpers
function InputGroup({ label, placeholder, type = "text" }: any) {
  return <div className="space-y-2 text-left"><label className="text-xs font-bold text-slate-400 uppercase ml-1">{label}</label><input type={type} placeholder={placeholder} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-cyan-500/50 outline-none" /></div>;
}

function NotificationRow({ name, color }: any) {
  return <tr className="hover:bg-slate-800/10"><td className="py-6 flex items-center gap-4 text-left"><div className={`p-2 rounded-lg bg-slate-800 ${color}`}><Bell size={16} /></div><span className="font-medium text-white">{name}</span></td><td className="text-center"><Checkbox checked /></td><td className="text-center"><Checkbox checked /></td><td className="text-center"><Checkbox /></td></tr>;
}

function Checkbox({ checked = false }: any) {
  return <input type="checkbox" defaultChecked={checked} className="w-5 h-5 rounded border-slate-800 bg-slate-950/50 text-cyan-500 cursor-pointer" />;
}