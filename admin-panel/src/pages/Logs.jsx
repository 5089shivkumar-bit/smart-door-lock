import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';

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
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Access Audit</h1>
                    <p className="text-slate-500 font-medium">Real-time log of every attempt and event.</p>
                </div>
                <button className="glass flex items-center gap-3 px-6 py-4 rounded-2xl text-slate-400 font-bold text-sm hover:text-white transition-all active:scale-95">
                    <Filter className="w-4 h-4" /> Filter Logs
                </button>
            </header>

            <div className="glass rounded-[3rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="table-header">
                        <tr>
                            <th className="p-8">User / Device</th>
                            <th className="p-8">Event Type</th>
                            <th className="p-8">Timestamp</th>
                            <th className="p-8">Verification</th>
                            <th className="p-8">Outcome</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse"><td colSpan="5" className="p-10 bg-white/[0.01]"></td></tr>
                            ))
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="5" className="p-16 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">No activity logged yet</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white uppercase text-[10px] tracking-widest mb-0.5">{log.name || 'Unknown Subject'}</div>
                                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Node-Terminal-01</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-[10px] text-slate-400 font-black uppercase tracking-widest border border-white/5">
                                            {log.method || 'System Internal'}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="text-xs font-mono text-slate-400 lowercase italic opacity-80">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${log.verified ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.verified ? 'Matched' : 'Not Validated'}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${log.status === 'success' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                            {log.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                            {log.status || 'Resolved'}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
