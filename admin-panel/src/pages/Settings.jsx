import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, Database, Globe } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-12 max-w-4xl">
            <header>
                <h1 className="text-5xl font-black text-white tracking-tighter mb-3 leading-none bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                    System Core
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                    Configuration Node: <span className="text-blue-500">Global Settings // v1.0.4</span>
                </p>
            </header>

            <div className="grid gap-6">
                {[
                    { label: 'Security Protocols', desc: 'Manage AES-256 encryption and neural thresholds.', icon: Lock },
                    { label: 'Aesthetic Interface', desc: 'Configure glassmorphism and motion dynamics.', icon: Globe },
                    { label: 'Database Cluster', desc: 'Manage Supabase nodes and persistent storage.', icon: Database },
                    { label: 'Alert Center', desc: 'Configure secure identity notifications.', icon: Bell },
                ].map((item, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] shadow-lg p-8 hover:border-white/40 transition-all duration-500 flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 group-hover:scale-110 transition-all duration-500">
                                <item.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white mb-1 tracking-tight">{item.label}</h3>
                                <p className="text-sm text-slate-500 font-bold opacity-60 italic lowercase">{item.desc}</p>
                            </div>
                        </div>
                        <div className="px-6 py-2 rounded-full border border-white/5 text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:border-blue-500/50 group-hover:text-blue-500 transition-all">
                            Modify Node
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
