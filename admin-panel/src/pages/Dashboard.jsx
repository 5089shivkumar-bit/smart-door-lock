import React from 'react';
import { Shield, Users, Activity, Clock } from 'lucide-react';

export default function Dashboard() {
    const stats = [
        { label: 'Network Points', value: '12', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+2 this week' },
        { label: 'Access Requests', value: '1.2k', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '99% Success Rate' },
        { label: 'System Integrity', value: 'A+', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-400/10', trend: 'No issues found' },
        { label: 'Global Uptime', value: '100%', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10', trend: 'Optimized' },
    ];

    return (
        <div className="space-y-12">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-3 leading-none bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                        Command Center
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                        Operational Status: <span className="text-emerald-500">OPTIMAL</span>
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="px-6 py-2 rounded-full glass border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Feb 19, 2026 // 05:11 PM
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="card-premium group cursor-default relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-[40px] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`}></div>

                        <div className="relative z-10 flex flex-col items-start gap-4">
                            <div className={`w-14 h-14 rounded-[1.25rem] ${stat.bg} flex items-center justify-center transition-transform group-hover:rotate-[15deg] duration-500`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                                <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
                                <div className="text-[10px] font-bold text-slate-600 lowercase italic">{stat.trend}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 card-premium">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white tracking-tight">Recent Pulse</h2>
                        <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors">Export Logs</button>
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center font-black text-blue-500 group-hover:scale-110 transition-transform">
                                        USR
                                    </div>
                                    <div>
                                        <div className="text-md font-black text-white">Access Granted: Subject A-{i}04</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Primary Entry Point // Verified</div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">2m ago</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-premium flex flex-col items-center justify-center text-center group relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/5 rotate-45 translate-y-[50%] skew-x-12 group-hover:bg-blue-600/10 transition-colors"></div>

                    <div className="relative z-10 w-full">
                        <div className="w-32 h-32 rounded-full border-2 border-white/5 flex items-center justify-center mx-auto mb-8 relative">
                            <div className="absolute inset-2 rounded-full border border-blue-500/20 border-dashed animate-spin-slow"></div>
                            <Shield className="w-16 h-16 text-white/20 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-3">Threat Monitor</h2>
                        <p className="text-sm text-slate-500 font-semibold px-4 leading-relaxed">System scan complete. No unauthorized access attempts detected in last 24h.</p>

                        <button className="mt-8 btn-primary !w-full">
                            Full Security Scan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
