import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Search, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await apiService.getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-3 leading-none bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                        Identity Registry
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                        Total Subjects: <span className="text-blue-500">{users.length} Database entries</span>
                    </p>
                </div>

                <div className="relative group/search">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/search:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        className="bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-6 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all w-72 font-bold placeholder:text-slate-800"
                    />
                </div>
            </header>

            <div className="card-premium !p-0 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Subject Profile</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Identification</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Access tier</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Lifecycle</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-8">
                                            <div className="h-10 bg-white/5 rounded-2xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Users className="w-16 h-16" />
                                            <p className="font-black uppercase tracking-widest text-xs">No identities found in cluster</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-black text-xs text-blue-500 group-hover:scale-110 transition-transform">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-white">{user.name}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role || 'Personnel'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-mono text-[11px] text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 inline-block">
                                            ID_{user.employee_id || user.id.slice(0, 8)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                            {user.access_level || 'Level 1'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
