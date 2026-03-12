import { useState, useEffect, useRef } from 'react';
import { Camera, Fingerprint, X, CheckCircle2, LogOut, AlertTriangle, Clock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Capacitor imports (assumed available in mobile build environment)
// If running in web browser for testing, these will fail or need mocks
let NativeBiometric, CapCamera, CameraResultType, CameraSource;
try {
    const Biometric = await import('capacitor-native-biometric');
    const Cam = await import('@capacitor/camera');
    NativeBiometric = Biometric.NativeBiometric;
    CapCamera = Cam.Camera;
    CameraResultType = Cam.CameraResultType;
    CameraSource = Cam.CameraSource;
} catch (e) {
    console.warn("Capacitor plugins not available in this environment (Web Fallback)");
}

// LAN IP of the backend server — phone and PC must be on the same WiFi network.
// In the integrated app, we prefer using the same proxy or a shared config.
const API_BASE = window.location.origin === 'http://localhost:5181' ? '' : 'http://192.168.2.165:8000';
const RESET_DELAY = 5; // seconds

// ── Animated countdown ring ───────────────────────────────────────────────────
function CountdownRing({ seconds, total = RESET_DELAY, color = '#10b981' }) {
    const R = 22, C = 2 * Math.PI * R;
    const pct = seconds / total;
    return (
        <svg width={56} height={56} className="rotate-[-90deg]">
            <circle cx={28} cy={28} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
            <circle cx={28} cy={28} r={R} fill="none" stroke={color} strokeWidth={4}
                strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
    );
}

// ── Live clock ────────────────────────────────────────────────────────────────
function LiveClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="text-center">
            <div className="text-7xl font-black tabular-nums tracking-tight text-white/90">
                {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </div>
            <div className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-[0.3em] opacity-80">
                {time.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
        </div>
    );
}

export default function Scanner() {
    const navigate = useNavigate();
    // view: 'home' | 'face' | 'fingerprint' | 'checkin' | 'checkout' | 'error'
    const [view, setView] = useState('home');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState(null);
    const [countdown, setCountdown] = useState(RESET_DELAY);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/users`);
                setEmployees(res.data.filter(u => u.status !== 'Deleted'));
            } catch (err) { console.error('Failed to fetch employees:', err); }
        };
        fetchEmployees();
    }, []);

    // ── Auto-reset countdown ──────────────────────────────────────────────────
    useEffect(() => {
        const resultViews = ['checkin', 'checkout', 'error'];
        if (!resultViews.includes(view)) return;

        setCountdown(RESET_DELAY);
        const tick = setInterval(() => setCountdown(c => c - 1), 1000);
        const done = setTimeout(reset, RESET_DELAY * 1000);
        return () => { clearInterval(tick); clearTimeout(done); };
    }, [view]);

    const reset = () => {
        setView('home');
        setLoading(false);
        setMessage('');
        setResult(null);
        setSearchTerm('');
        setCountdown(RESET_DELAY);
    };

    // ── Face scan ─────────────────────────────────────────────────────────────
    const handleFaceScan = async () => {
        if (isScanning) return;
        setIsScanning(true);

        setView('face');
        setLoading(true);
        setMessage('Initializing biometric camera…');
        try {
            if (!CapCamera) {
                throw new Error("Camera plugin not available on this platform.");
            }
            const image = await CapCamera.getPhoto({
                quality: 50,
                width: 640,
                height: 480,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Camera,
            });
            setMessage('Processing biometric identity…');

            const rawRes = await fetch(`data:image/jpeg;base64,${image.base64String}`);
            const blob = await rawRes.blob();
            const form = new FormData();
            form.append('file', blob, 'face.jpg');

            const res = await axios.post(`${API_BASE}/api/biometrics/face/verify`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                const isCheckout = !!(res.data.check_out || res.data.checkout);
                const now = new Date();
                setResult({
                    name: res.data.user?.name || res.data.name || res.data.employee_name || 'Employee',
                    time: res.data.check_in
                        ? new Date(res.data.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                        : now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                    checkoutTime: res.data.check_out
                        ? new Date(res.data.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                        : now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                    workingHours: res.data.working_hours != null ? formatWorkHours(res.data.working_hours) : null,
                    isCheckout,
                });
                setView(isCheckout ? 'checkout' : 'checkin');
            } else {
                throw new Error(res.data.message || 'Face not recognized');
            }
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || err.message || 'Recognition failed');
            setView('error');
        } finally {
            setLoading(false);
            setTimeout(() => setIsScanning(false), 2000);
        }
    };

    // ── Fingerprint ───────────────────────────────────────────────────────────
    const handleFingerprintScan = async () => {
        try {
            if (!NativeBiometric) throw new Error("Biometric plugin not available");
            const avail = await NativeBiometric.isAvailable();
            if (!avail.isAvailable) throw new Error('Sensor not available');
            await NativeBiometric.verify({
                reason: 'Authenticate for attendance',
                title: 'Terminal Security',
                subtitle: 'Place your finger on the sensor',
                negativeButtonText: 'Cancel',
            });
            setView('fingerprint');
        } catch (err) {
            console.warn('Biometric fallback:', err.message);
            // On web or without sensor, show warning but allow selection for demo
            setView('fingerprint');
        }
    };

    const markManualAttendance = async (employee) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/api/logs/iot`, {
                id: employee.employee_id || employee.id,
                method: 'fingerprint',
                status: 'success',
                message: 'Unlock via Mobile App',
                timestamp: Math.floor(Date.now() / 1000),
                signature: 'internal_request' // Backend may need to skip signature check for app
            });
            const data = res.data || {};
            const isCheckout = !!(data.check_out);
            const now = new Date();
            setResult({
                name: employee.name,
                time: data.check_in
                    ? new Date(data.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                    : now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                checkoutTime: data.check_out
                    ? new Date(data.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                    : now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                workingHours: data.working_hours != null ? formatWorkHours(data.working_hours) : null,
                isCheckout,
            });
            setView(isCheckout ? 'checkout' : 'checkin');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Connection failure');
            setView('error');
        } finally {
            setLoading(false);
        }
    };

    // ── Helper ────────────────────────────────────────────────────────────────
    const formatWorkHours = (wh) => {
        const h = Math.floor(wh);
        const m = Math.round((wh - h) * 60);
        return `${h}h ${String(m).padStart(2, '0')}m`;
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="w-screen h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.1),transparent)]" />
            
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 px-8 py-6 flex items-center justify-between border-b border-white/[0.03] bg-black/20 backdrop-blur-md z-50">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                    <ArrowLeft size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
                </button>
                <div className="flex flex-col items-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">AuraLock Terminal</div>
                    <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Biometric Scanner v4.0</div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                </div>
            </div>

            <AnimatePresence mode="wait">

                {/* ── HOME ── */}
                {view === 'home' && (
                    <motion.div key="home"
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                        className="flex flex-col items-center gap-16 w-full max-w-4xl z-10">

                        <LiveClock />

                        <div className="w-full">
                            <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] mb-10">
                                Scan Identity
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                {/* Face Scan */}
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
                                    onClick={handleFaceScan}
                                    className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all flex flex-col items-center gap-6 group relative overflow-hidden backdrop-blur-sm">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-6 rounded-3xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors border border-blue-500/20 shadow-inner">
                                        <Camera size={64} className="text-blue-400" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-2xl font-black tracking-tight text-white/90">Face Scan</h2>
                                        <p className="text-slate-500 mt-2 text-xs font-semibold uppercase tracking-widest">Visual Recognition</p>
                                    </div>
                                </motion.button>

                                {/* Fingerprint */}
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
                                    onClick={handleFingerprintScan}
                                    className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-all flex flex-col items-center gap-6 group relative overflow-hidden backdrop-blur-sm">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-6 rounded-3xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors border border-emerald-500/20 shadow-inner">
                                        <Fingerprint size={64} className="text-emerald-400" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-2xl font-black tracking-tight text-white/90">Fingerprint</h2>
                                        <p className="text-slate-500 mt-2 text-xs font-semibold uppercase tracking-widest">Touch Sensor</p>
                                    </div>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── FINGERPRINT EMPLOYEE PICKER ── */}
                {view === 'fingerprint' && (
                    <motion.div key="fingerprint"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] w-full max-w-2xl flex flex-col gap-6 shadow-2xl z-10">
                        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                            <div>
                                <h2 className="text-xl font-black">Identify User</h2>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 italic">Search and select record</p>
                            </div>
                            <button onClick={reset} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500"><X size={20} /></button>
                        </div>
                        <input type="text" placeholder="Start typing employee name…"
                            className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 text-base focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-700 transition-colors"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
                        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(emp => (
                                    <button key={emp.id} onClick={() => markManualAttendance(emp)} disabled={loading}
                                        className="flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-[1.5rem] transition-all text-left group">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-white/[0.05] overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                            <img src={emp.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=1e293b&color=94a3b8`}
                                                alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-bold text-sm truncate text-white/90">{emp.name}</div>
                                            <div className="text-slate-600 text-[9px] font-black uppercase tracking-widest truncate">{emp.department || 'General'}</div>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    </motion.div>
                )}

                {/* ── FACE SCANNING ── */}
                {view === 'face' && (
                    <motion.div key="face"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-12 text-center z-10">
                        <div className="relative w-80 h-80">
                            {/* Corner brackets */}
                            {[['top-0 left-0', 'border-t-4 border-l-4'], ['top-0 right-0', 'border-t-4 border-r-4'],
                            ['bottom-0 left-0', 'border-b-4 border-l-4'], ['bottom-0 right-0', 'border-b-4 border-r-4']].map(([pos, br], i) => (
                                <div key={i} className={`absolute w-12 h-12 ${pos} ${br} border-blue-500 rounded-sm`} />
                            ))}
                            <div className="w-full h-full rounded-3xl flex items-center justify-center bg-blue-500/[0.03] border border-blue-500/10 shadow-[inner_0_0_40px_rgba(59,130,246,0.05)]">
                                <Camera size={96} className="text-blue-500/20" />
                            </div>
                            {/* Scanning line */}
                            <motion.div
                                animate={{ y: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent top-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            />
                        </div>
                        <div className="max-w-xs">
                            <p className="text-2xl font-black text-blue-200 tracking-tight">{message}</p>
                            <p className="text-slate-600 text-[10px] mt-3 font-bold uppercase tracking-[0.5em] animate-pulse">Stay Positioned</p>
                        </div>
                    </motion.div>
                )}

                {/* ── CHECK-IN SUCCESS ── */}
                {view === 'checkin' && (
                    <motion.div key="checkin"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-10 text-center z-10">
                        <div className="relative">
                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-[-20px] rounded-full bg-emerald-500/20" />
                            <div className="w-40 h-40 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                                <CheckCircle2 size={84} className="text-emerald-400" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-400">Identity Verified</p>
                            <h2 className="text-6xl font-black text-white tracking-tighter">{result?.name}</h2>
                            <div className="flex flex-col items-center gap-2 pt-2">
                                <p className="text-emerald-500 font-black text-xl uppercase tracking-widest translate-y-1">Check In Success</p>
                                <p className="text-slate-500 text-3xl font-black tabular-nums">{result?.time}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/[0.02] px-6 py-3 rounded-2xl border border-white/5 grayscale">
                            <CountdownRing seconds={countdown} color="#10b981" />
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Auto-reset: {countdown}s</span>
                        </div>
                    </motion.div>
                )}

                {/* ── CHECK-OUT SUCCESS ── */}
                {view === 'checkout' && (
                    <motion.div key="checkout"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-10 text-center z-10">
                        <div className="relative">
                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-[-20px] rounded-full bg-indigo-500/20" />
                            <div className="w-40 h-40 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.1)]">
                                <LogOut size={84} className="text-indigo-400" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-400">Shift Ended</p>
                            <h2 className="text-6xl font-black text-white tracking-tighter">{result?.name}</h2>
                            <div className="flex flex-col items-center gap-2 pt-2">
                                <p className="text-indigo-400 font-black text-xl uppercase tracking-widest">Check Out Success</p>
                                <p className="text-slate-400 text-2xl font-black tabular-nums">{result?.checkoutTime}</p>
                                {result?.workingHours && (
                                    <div className="mt-4 px-8 py-2 rounded-full bg-indigo-500/5 border border-indigo-500/20">
                                        <span className="text-indigo-300 font-black text-sm tracking-[0.2em] uppercase">
                                            {result.workingHours} Total
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/[0.02] px-6 py-3 rounded-2xl border border-white/5 grayscale">
                            <CountdownRing seconds={countdown} color="#6366f1" />
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Auto-reset: {countdown}s</span>
                        </div>
                    </motion.div>
                )}

                {/* ── ERROR ── */}
                {view === 'error' && (
                    <motion.div key="error"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-10 text-center z-10">
                        <div className="relative">
                            <motion.div animate={{ rotate: [-5, 5, -5, 5, 0] }} transition={{ duration: 0.4 }} className="w-40 h-40 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                                <AlertTriangle size={84} className="text-red-400" />
                            </motion.div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-red-500">Security Warning</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter">Identity Mismatch</h2>
                            <p className="text-slate-500 text-sm font-medium italic opacity-70">"{message}"</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={reset}
                            className="px-10 py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all text-red-400">
                            Attempt Retry
                        </motion.button>
                        <div className="flex items-center gap-4 opacity-30">
                            <CountdownRing seconds={countdown} color="#ef4444" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Back: {countdown}s</span>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
