import React, { useRef, useState, useEffect } from 'react';
import { Camera, ShieldCheck, AlertCircle, RefreshCw, Upload, Loader2, Lock, Shield, Activity } from 'lucide-react';
import { apiService } from '../services/api';

export default function FaceRegister() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [name, setName] = useState('');
    const [capturedImage, setCapturedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) {
            setStatus({ type: 'error', message: 'Camera access denied or not found.' });
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);

            const imageData = canvasRef.current.toDataURL('image/jpeg');
            setCapturedImage(imageData);
            stopCamera();
        }
    };

    const handleRegister = async () => {
        if (!name || !capturedImage) {
            setStatus({ type: 'error', message: 'Please provide both name and photo.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Convert Base64 to Blob
            const response = await fetch(capturedImage);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('image', blob, 'face.jpg');
            formData.append('name', name);

            await apiService.registerFace(formData);

            setStatus({ type: 'success', message: 'User registered successfully!' });
            setName('');
            setCapturedImage(null);
            startCamera();
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Registration failed. Check backend connection.' });
        } finally {
            setLoading(false);
        }
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    return (
        <div className="flex items-start justify-center py-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] shadow-lg p-0 w-full max-w-[1100px] overflow-hidden relative group">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-indigo-600 opacity-50"></div>

                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* LEFT SIDE: SCANNER */}
                    <div className="p-12 border-r border-white/5 bg-white/[0.01]">
                        <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-950 border border-white/10 shadow-2xl group/camera">
                            {capturedImage ? (
                                <img src={capturedImage} className="w-full h-full object-cover animate-in fade-in zoom-in duration-700" alt="Captured" />
                            ) : (
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" style={{ transform: 'scaleX(-1)' }} />
                            )}

                            {/* Scanning Reticle */}
                            {!capturedImage && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="w-48 h-64 border-2 border-blue-500/20 rounded-3xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Processing Identity</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-10">
                            {!capturedImage ? (
                                <button
                                    onClick={capturePhoto}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95 !w-full flex items-center justify-center gap-4 py-5"
                                >
                                    <Camera className="w-5 h-5" />
                                    <span>Capture Digital Frame</span>
                                </button>
                            ) : (
                                <button
                                    onClick={retake}
                                    className="w-full py-5 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-[2rem] font-bold uppercase tracking-widest text-xs transition-all border border-white/10 flex items-center justify-center gap-4 active:scale-95"
                                >
                                    <RefreshCw className="w-4 h-4" /> Retake Frame
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE: IDENTITY DATA */}
                    <div className="p-12 flex flex-col justify-center">
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">Biometric v4.0</span>
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tighter mb-3">Register Identity</h2>
                            <p className="text-slate-400 text-sm font-semibold opacity-70">Create a secure holographic profile for building access.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Identification Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter subject name..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all duration-300 font-bold placeholder:text-slate-800"
                                />
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={loading || !capturedImage || !name}
                                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-4 active:scale-[0.98]"
                            >
                                {loading ? "Syncing Identity..." : "Authorize Access"}
                                <ShieldCheck className="w-5 h-5" />
                            </button>

                            {status.message && (
                                <div className={`p-5 rounded-3xl text-xs font-black uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-bottom duration-500 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                    <span>{status.message}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all">
                            <Lock className="w-5 h-5 text-slate-500" />
                            <Shield className="w-5 h-5 text-slate-500" />
                            <Activity className="w-5 h-5 text-slate-500" />
                        </div>
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

const CheckCircle2 = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
);
