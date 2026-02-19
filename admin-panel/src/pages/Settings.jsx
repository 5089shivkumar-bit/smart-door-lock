import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, Database, Globe } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-8 max-w-4xl">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">System Settings</h1>
                <p className="text-slate-500 font-medium">Configure hardware thresholds and connectivity.</p>
            </header>

            <div className="grid gap-6">
                {[
                    { label: 'Security Protocols', desc: 'Manage encryption and token expiry.', icon: Lock },
                    { label: 'Notifications', desc: 'Configure email and mobile alerts.', icon: Bell },
                    { label: 'Database Sync', desc: 'Primary persistence and backup nodes.', icon: Database },
                    { label: 'Network Info', desc: 'Remote access and API endpoints.', icon: Globe },
                ].map((item, i) => (
                    <div key={i} className="glass p-8 rounded-[2.5rem] flex items-center justify-between hover:border-white/10 transition-all cursor-pointer group">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-400/10 transition-all">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white mb-0.5">{item.label}</h3>
                                <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Configure</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
