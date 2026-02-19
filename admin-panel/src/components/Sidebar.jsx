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
        <aside className="w-[240px] h-screen bg-[#111827] flex flex-col fixed left-0 top-0 z-50 border-r border-white/5">
            <div className="p-6 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
                        <Lock className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="font-bold text-white tracking-tight text-lg">
                        Smart Lock
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                            ${isActive
                                ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }
                        `}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
