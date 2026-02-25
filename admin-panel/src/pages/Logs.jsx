import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { ShieldCheck, ShieldAlert, Filter, Download, Activity, Calendar } from 'lucide-react';

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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Security Audit</h1>
                    <p className="text-slate-400 text-sm">Real-time biometric access stream and threat analysis logs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary flex items-center gap-2 text-xs">
                        <Calendar className="w-4 h-4" /> Last 24h
                    </button>
                    <button className="btn-secondary flex items-center gap-2 text-xs">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="card !p-0 overflow-hidden relative">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widestleading-none">Monitoring Cluster Alpha</span>
                    </div>
                    <button className="flex items-center gap-2 text-[11px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                        <Filter className="w-3.5 h-3.5" /> Configure Stream
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/40 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                                <th className="px-8 py-4">Subject Identification</th>
                                <th className="px-8 py-4">Access Vector</th>
                                <th className="px-8 py-4">Temporal Stamp</th>
                                <th className="px-8 py-4">Validation</th>
                                <th className="px-8 py-4 text-right">Audit Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6">
                                            <div className="h-10 bg-white/5 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
                                            <p className="font-bold uppercase tracking-widest text-xs">No activity pulses detected in last cycle</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-lg bg-[#111827] border border-white/5 flex items-center justify-center font-black text-[10px] text-slate-600 group-hover:text-blue-500 transition-colors">
                                                ID
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white leading-tight">{log.employees?.name || 'Subject Unknown'}</div>
                                                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">{log.device_id || 'Entrance Node'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-bold px-2 py-1 bg-white/5 text-slate-400 rounded-md border border-white/5 uppercase tracking-widest">
                                            {log.event_type || 'Biometric Access'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1 h-1 rounded-full ${log.verified ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                                            <span className="text-[11px] font-bold text-slate-500">
                                                {log.verified ? 'Verified Match' : 'Manual Bypass'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${log.status === 'success'
                                                ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
                                                : 'bg-red-500/5 text-red-500 border-red-500/10'
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
