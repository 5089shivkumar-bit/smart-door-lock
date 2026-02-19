import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await apiService.login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-[480px] relative z-10">
                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/20 mx-auto mb-6 group hover:rotate-12 transition-transform duration-500">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2">AURA</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] opacity-60">Security Cluster Login</p>
                </div>

                <div className="card-premium animate-in zoom-in-95 duration-700 delay-200">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Admin Identity</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@aura.security"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all duration-300 font-bold placeholder:text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Access Credential</label>
                            <div className="relative group/input">
                                <Shield className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all duration-300 font-bold placeholder:text-slate-800"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary !py-6 flex items-center justify-center gap-4 text-sm tracking-[0.2em] uppercase font-black"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Establish Connection</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center animate-in fade-in duration-1000 delay-500">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] opacity-40">
                        Authorized Personnel Only // Node ID: 0x88F2
                    </p>
                </div>
            </div>
        </div>
    );
}
