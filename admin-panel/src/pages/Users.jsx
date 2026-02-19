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
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Registered Users</h1>
                    <p className="text-slate-500 font-medium">Manage all authorized personnel and access levels.</p>
                </div>
                <div className="relative group overflow-hidden">
                    <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search operators..."
                        className="bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm w-full md:w-80"
                    />
                </div>
            </header>

            <div className="glass rounded-[3rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="table-header">
                        <tr>
                            <th className="p-8">Subject</th>
                            <th className="p-8">ID / Metadata</th>
                            <th className="p-8">Access Level</th>
                            <th className="p-8">Status</th>
                            <th className="p-8 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="5" className="p-8 bg-white/[0.02]"></td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-16 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <ShieldAlert className="w-12 h-12 text-slate-800" />
                                        <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No users found on database</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center font-black text-white text-lg overflow-hidden group-hover:border-blue-500/30 transition-all shadow-lg">
                                                {user.image_url ? (
                                                    <img src={user.image_url} alt={user.name} className="w-full h-full object-cover" />
                                                ) : user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-white text-lg">{user.name}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user.role || 'Personnel'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="text-xs font-mono text-slate-400 mb-1">#{user.employeeId || user._id.slice(-8)}</div>
                                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">Registered: Feb 19, 2026</div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-1.5">
                                            {Array(5).fill(0).map((_, i) => (
                                                <div key={i} className={`w-3 h-1.5 rounded-full ${i < (user.accessLevel || 3) ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all"><Edit2 className="w-4 h-4" /></button>
                                            <button className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
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
