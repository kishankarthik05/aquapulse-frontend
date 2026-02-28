"use client";
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Wind } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation Logic
    if (!formData.email.includes('@')) return alert("Please enter a valid email address.");
    if (formData.message.length < 5) return alert("Message is too short.");
    
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <header className="mb-12 text-left">
        <div className="flex items-center gap-3 mb-4"><div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400"><Wind size={24} /></div><span className="font-bold text-white uppercase">AquaPulse</span></div>
        <h1 className="text-5xl font-extrabold text-white mb-4">Contact Us</h1>
        <p className="text-slate-400 text-lg max-w-2xl">Reach out with any questions about your tank monitoring system.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input name="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Your Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-cyan-500" />
              <input name="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-cyan-500" />
            </div>
            <textarea name="message" required rows={6} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="How can we help?" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-cyan-500 resize-none" />
            <button type="submit" disabled={status !== 'idle'} className={`w-full md:w-auto px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${status === 'sent' ? 'bg-emerald-500 text-white' : 'bg-cyan-500 text-black active:scale-95 transition-all'}`}>
              {status === 'idle' ? <><Send size={18} /> Send Message</> : status === 'sending' ? "Sending..." : "Sent!"}
            </button>
          </form>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl h-fit space-y-8 text-left">
          <h3 className="text-xl font-bold text-white mb-4">Quick Connect</h3>
          <ContactItem icon={<Mail size={20} />} label="Email" value="support@aquapulse.io" />
          <ContactItem icon={<Phone size={20} />} label="Call" value="+1 (555) 123-4567" />
          <ContactItem icon={<MapPin size={20} />} label="Office" value="San Francisco, CA" />
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value }: any) {
  return <div className="flex gap-4 items-start"><div className="bg-slate-800 p-3 rounded-xl text-cyan-400 border border-slate-700">{icon}</div><div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p><p className="text-slate-200">{value}</p></div></div>;
}