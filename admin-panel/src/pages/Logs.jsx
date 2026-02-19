import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { CheckCircle2, XCircle, Clock, Filter, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await apiService.getLogs();
            setLogs(data);
        } catch (err) {
            console.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-3 leading-none bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                        Security Audit
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                        Access Pipeline: <span className="text-emerald-500">Monitoring Cluster // Live</span>
                    </p>
                </div>

                <button className="px-6 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 font-bold text-xs uppercase tracking-widest">
                    <Filter className="w-4 h-4" /> Filter Stream
                </button>
            </header>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] shadow-lg p-0 hover:border-white/40 transition-all duration-500 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Deployment / Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Event Vector</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Temporal Stamp</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verification Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Audit Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-8">
                                            <div className="h-10 bg-white/5 rounded-2xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Activity className="w-16 h-16" />
                                            <p className="font-black uppercase tracking-widest text-xs">No activity pulses detected</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-black text-[10px] text-slate-500 group-hover:text-blue-500 transition-colors">
                                                LOG
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-white">{log.employees?.name || 'Authorized Subject'}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{log.device_id || 'Primary Node'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                                            {log.event_type || 'Entry Event'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-[11px] font-mono text-slate-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${log.verified ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}></div>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                {log.verified ? 'Matched' : 'Bypassed'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${log.status === 'success'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                            }`}>
                                            {log.status === 'success' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                                            {log.status === 'success' ? 'Granted' : 'Denied'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
