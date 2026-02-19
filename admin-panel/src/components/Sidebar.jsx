import { NavLink } from 'react-router-dom';
import { apiService } from '../services/api';
import {
    LayoutDashboard,
    UserPlus,
    Users,
    ClipboardList,
    Settings,
    Lock,
    LogOut
} from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Face Register', icon: UserPlus, path: '/register' },
    { name: 'Registered Users', icon: Users, path: '/users' },
    { name: 'Access Logs', icon: ClipboardList, path: '/logs' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');

    return (
        <aside className="fixed left-6 top-6 bottom-6 w-[260px] bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] flex flex-col z-50 overflow-hidden group">
            <div className="p-8 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-white tracking-tighter text-xl">
                            AURA
                        </h1>
                        <p className="text-[10px] font-bold text-blue-500 tracking-[0.3em] uppercase opacity-80">Security</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group/item
                            ${isActive
                                ? 'bg-white/10 text-white shadow-xl border border-white/10'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }
                        `}
                    >
                        <item.icon className="w-5 h-5 group-hover/item:scale-110 transition-transform" />
                        <span className="font-bold text-sm tracking-wide">{item.name}</span>
                        {item.name === 'Face Register' && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 px-4 py-2">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center font-black text-blue-500 text-xs shrink-0">
                        {user.name?.charAt(0) || 'A'}
                    </div>
                    <div className="min-w-0">
                        <div className="text-[11px] font-black text-white truncate">{user.name || 'Admin'}</div>
                        <button
                            onClick={() => apiService.logout()}
                            className="text-[9px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1.5"
                        >
                            <LogOut className="w-3 h-3" /> Terminate
                        </button>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] shadow-lg p-5 hover:border-white/40 transition-all duration-500 !bg-blue-600/10 border-blue-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none pt-0.5">Live Sync active</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
