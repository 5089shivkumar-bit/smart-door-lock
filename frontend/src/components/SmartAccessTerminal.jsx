import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Grid3x3, Lock, Shield, Cpu, RefreshCw } from 'lucide-react';

export default function SmartAccessTerminal() {
    const [time, setTime] = useState(new Date());
    const [status, setStatus] = useState('idle'); // idle, scanning, success, denied
    const [activeMethod, setActiveMethod] = useState(null);

    // Clock Update
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Format Time
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const handleUnlock = () => {
        setStatus('scanning');
        setTimeout(() => {
            // Random success/fail
            const success = Math.random() > 0.1;
            setStatus(success ? 'success' : 'denied');
            setTimeout(() => setStatus('idle'), 3000);
        }, 2000);
    };

    return (
        <div className="h-screen w-screen bg-slate-950 overflow-hidden relative flex items-center justify-center font-sans tracking-wide">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 z-0"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full mix-blend-screen"></div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

            {/* Main Glass Container (Tablet Frame) */}
            <div className="relative z-10 w-full max-w-lg h-[90vh] bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-8 overflow-hidden">

                {/* Glow Line Top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]"></div>

                {/* --- TOP SECTION --- */}
                <header className="flex justify-between items-start mb-8">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-1">
                            <Shield className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            <span className="text-sm font-bold tracking-[0.2em] text-blue-300/80 uppercase">Antigravity</span>
                        </div>
                        <h1 className="text-xl font-medium text-white tracking-widest text-shadow-glow">SMART ACCESS TERMINAL</h1>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-light text-white">{formatTime(time)}</div>
                        <div className="text-xs font-bold text-blue-300/60 tracking-widest uppercase">{formatDate(time)}</div>
                    </div>
                </header>

                {/* --- CENTER SECTION (Camera) --- */}
                <main className="flex-1 flex flex-col items-center justify-center relative mb-8">
                    {/* Camera Container */}
                    <div className="relative w-full aspect-[4/3] bg-black/60 rounded-3xl border border-blue-500/30 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.1)] group">

                        {/* Simulated Camera Feed Image/Video */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 opacity-80 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                            {/* Placeholder for Face or just a silhouette */}
                            <div className="w-40 h-40 bg-slate-700/50 rounded-full blur-xl"></div>
                        </div>

                        {/* Animated Rings */}
                        <div className={`absolute inset-0 flex items-center justify-center ${status === 'scanning' ? 'scale-100' : 'scale-95 opacity-50'} transition-all duration-500`}>
                            {/* Outer Ring */}
                            <div className="w-[80%] h-[80%] border border-blue-500/30 rounded-full absolute animate-scan-spin border-t-blue-400 border-l-transparent border-r-transparent border-b-blue-400/30"></div>
                            {/* Inner Ring */}
                            <div className="w-[60%] h-[60%] border border-cyan-400/20 rounded-full absolute animate-reverse-spin border-dashed"></div>
                            {/* Center Focus */}
                            <div className="w-48 h-48 border-[2px] border-blue-400/30 rounded-2xl absolute flex items-center justify-center">
                                <div className="w-full h-[1px] bg-blue-500/50 absolute top-1/2 shadow-[0_0_10px_blue]"></div>
                                <div className="h-full w-[1px] bg-blue-500/50 absolute left-1/2 shadow-[0_0_10px_blue]"></div>
                            </div>
                        </div>

                        {/* Scan Line Overlay */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-[3px] bg-blue-400/80 shadow-[0_0_20px_rgba(59,130,246,1)] z-20"
                            animate={{ top: ['10%', '90%', '10%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    {/* Status Text under Camera */}
                    <div className="mt-6 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${status === 'scanning' ? 'bg-yellow-400 animate-ping' : status === 'success' ? 'bg-emerald-500' : 'bg-blue-500 box-shadow-glow'}`}></div>
                        <span className="text-blue-200/80 text-sm font-medium tracking-wide uppercase">
                            {status === 'scanning' ? 'Analyzing Biometrics...' : status === 'success' ? 'Identity Verified' : 'Face Recognition Active'}
                        </span>
                    </div>
                </main>

                {/* --- ACTION SECTION --- */}
                <footer className="flex flex-col gap-4">

                    {/* Secondary Buttons Row */}
                    <div className="flex gap-4">
                        <button className="flex-1 h-14 bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 group">
                            <Scan className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                            <span className="text-sm font-semibold text-slate-300 group-hover:text-white">Scan ID</span>
                        </button>
                        <button className="flex-1 h-14 bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 group">
                            <Grid3x3 className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                            <span className="text-sm font-semibold text-slate-300 group-hover:text-white">Passcode</span>
                        </button>
                    </div>

                    {/* Primary Unlock Button */}
                    <button
                        onClick={handleUnlock}
                        className="w-full h-20 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-2xl flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] border border-blue-400/30 transition-all active:scale-95 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <Lock className="w-6 h-6 text-white" />
                        <span className="text-lg font-bold text-white tracking-wider">UNLOCK ENTRANCE</span>
                    </button>

                    {/* Bottom Status Text */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center px-2">
                        <span className="text-xs text-slate-500 uppercase tracking-widest">System Status</span>
                        <span className={`text-xs font-bold tracking-widest uppercase ${status === 'denied' ? 'text-red-400' : status === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>
                            {status === 'idle' ? 'Waiting for scan...' : status === 'scanning' ? 'Processing...' : status === 'success' ? 'Access Granted' : 'Access Denied'}
                        </span>
                    </div>

                </footer>

            </div>
        </div>
    );
}
