import React from 'react';
import { Shield, Users, Activity, Clock } from 'lucide-react';

export default function Dashboard() {
    const stats = [
        { label: 'Total Users', value: '12', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Access Events', value: '1,248', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Security Status', value: 'Strong', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Up-time', value: '99.9%', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">System Overview</h1>
                <p className="text-slate-500 font-medium">Welcome back, Super Admin. Everything is running smoothly.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-[2.5rem] flex items-center gap-5 hover:border-white/10 transition-all cursor-default group">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">{stat.label}</div>
                            <div className="text-2xl font-black text-white">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass p-8 rounded-[3rem]">
                    <h2 className="text-xl font-black text-white mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10"></div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Access Granted: User {i}</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Front Door Entry</div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">2 MIN AGO</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass p-8 rounded-[3rem] relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-white mb-2">Gate Pulse</h2>
                        <p className="text-sm text-slate-500 font-medium mb-6">Live security monitor</p>
                        <div className="aspect-square rounded-[2rem] bg-slate-950 border border-white/5 flex items-center justify-center">
                            <Shield className="w-20 h-20 text-slate-800 animate-pulse" />
                        </div>
                    </div>
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
