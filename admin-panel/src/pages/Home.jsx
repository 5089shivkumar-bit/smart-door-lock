import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, ShieldEllipsis, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center p-8 bg-[#0f172a] text-white relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />

            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <ShieldCheck size={24} className="text-white" />
                    </div>
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-2">AuraLock <span className="text-blue-500">Secure</span></h1>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Unified Access Control</p>
            </motion.div>

            {/* Main Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
                {/* Start Scanner */}
                <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/scanner')}
                    className="group p-8 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-blue-500/30 transition-all flex flex-col items-center gap-6 text-center"
                >
                    <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <ScanFace size={40} className="text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">Start Scanner</h2>
                        <p className="text-slate-500 text-sm font-medium">Open biometric terminal for face & fingerprint recognition</p>
                    </div>
                    <div className="mt-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400">
                        No Login Required
                    </div>
                </motion.button>

                {/* Admin Panel */}
                <motion.button
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/admin')}
                    className="group p-8 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all flex flex-col items-center gap-6 text-center"
                >
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <ShieldEllipsis size={40} className="text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">Admin Panel</h2>
                        <p className="text-slate-500 text-sm font-medium">Access dashboard, logs, and employee management</p>
                    </div>
                    <div className="mt-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        Admin Login Required
                    </div>
                </motion.button>
            </div>

            {/* System Status Footer */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-10 flex items-center gap-5 text-slate-600"
            >
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Biometric API: Online</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-2">
                    <Activity size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">v2.8 Stable</span>
                </div>
            </motion.div>
        </div>
    );
}
