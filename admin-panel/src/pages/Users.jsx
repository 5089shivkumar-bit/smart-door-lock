import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Search, Trash2, Edit2, UserPlus, Filter, MoreVertical } from 'lucide-react';

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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Personnel Management</h1>
                    <p className="text-slate-400 text-sm">Manage authorized subjects and monitor their access credentials.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary flex items-center gap-2 text-xs">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <Link to="/register" className="btn-primary flex items-center gap-2 text-xs">
                        <UserPlus className="w-4 h-4" /> Register New
                    </Link>
                </div>
            </div>

            {/* Table Card */}
            <div className="card !p-0 overflow-hidden relative">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Find by name or identification..."
                            className="input-field pl-11 !py-2 text-sm"
                        />
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {users.length} Active Profiles
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/40 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                                <th className="px-8 py-4">Identity Profile</th>
                                <th className="px-8 py-4">Internal ID</th>
                                <th className="px-8 py-4">Classification</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6">
                                            <div className="h-10 bg-white/5 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center text-slate-500 font-medium">
                                        No authorized subjects detected in primary cluster.
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-xs text-blue-500 group-hover:scale-110 transition-transform">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{user.name}</div>
                                                <div className="text-[11px] text-slate-500 font-medium capitalize">{user.role || 'Personnel'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <code className="text-[11px] text-slate-400 font-mono bg-[#111827] px-2 py-1 rounded-md border border-white/5">
                                            {user.employee_id || user.id.slice(0, 8)}
                                        </code>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/10 uppercase tracking-widest leading-none">
                                            {user.access_level || 'Tier 1'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                            <span className="text-[11px] font-bold text-slate-400 capitalize">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all">
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
