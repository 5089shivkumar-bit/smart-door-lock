import React from 'react';
import { Shield, Activity, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
    const stats = [
        { label: 'Active Nodes', value: '12', icon: Shield, trend: '+2' },
        { label: 'Total Access', value: '1,280', icon: Activity, trend: '+14%' },
        { label: 'Security Score', value: '98%', icon: ShieldCheck, trend: 'Optimal' },
        { label: 'Avg Pulse', value: '45ms', icon: Clock, trend: '-2ms' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
                <p className="text-slate-400 text-sm">Monitor system health and biometric access activity in real-time.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card hover:border-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-blue-500 border border-white/5">
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${stat.trend.includes('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-400/10'
                                }`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Security Logs</h2>
                        <button className="text-blue-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1">
                            Full Audit <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { user: 'Subject A-104', location: 'Primary Entry', time: '2m ago', level: 'Verified' },
                            { user: 'Subject B-202', location: 'Server Node 4', time: '15m ago', level: 'Verified' },
                            { user: 'Subject C-088', location: 'Service Area', time: '1h ago', level: 'Verified' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#111827] border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-slate-400 text-xs">
                                        ID
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{log.user}</div>
                                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{log.location} // {log.level}</div>
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-slate-600">{log.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Threat Monitor / System Status */}
                <div className="card space-y-6">
                    <h2 className="text-lg font-bold text-white">System Integrity</h2>
                    <div className="p-6 rounded-2xl bg-[#111827] border border-white/5 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full border border-emerald-500/20 flex items-center justify-center mb-4 relative">
                            <div className="absolute inset-0 rounded-full border-t border-emerald-500 animate-spin"></div>
                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="text-xl font-bold text-white mb-2">Secure</div>
                        <p className="text-xs text-slate-500 font-medium px-2 leading-relaxed">
                            Internal firewall active and neural identity thresholds maintained.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                            <span>Uptime</span>
                            <span className="text-white">99.98%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[99%] text-right"></div>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/10 active:scale-[0.98]">
                        Run Security Diagnostic
                    </button>
                </div>
            </div>
        </div>
    );
}
