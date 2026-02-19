import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    UserPlus,
    Users,
    ClipboardList,
    Settings,
    Lock
} from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Face Register', icon: UserPlus, path: '/register' },
    { name: 'Registered Users', icon: Users, path: '/users' },
    { name: 'Access Logs', icon: ClipboardList, path: '/logs' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
    return (
        <aside className="w-64 h-screen glass border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
            <div className="p-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Lock className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-black text-white tracking-tight text-xl leading-tight">
                    SMART<br /><span className="text-blue-500 font-bold text-sm">LOCK ADMIN</span>
                </h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                            ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }
                        `}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-bold text-sm tracking-wide">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-6">
                <div className="p-4 rounded-3xl bg-slate-950/50 border border-white/5">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Status</div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-emerald-500/80 tracking-wide">Secure & Online</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
