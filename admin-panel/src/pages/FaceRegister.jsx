import React, { useRef, useState, useEffect } from 'react';
import { Camera, ShieldCheck, AlertCircle, RefreshCw, Upload, Loader2 } from 'lucide-react';
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
        <div className="flex items-center justify-center py-10 min-h-[calc(100vh-160px)]">
            <div className="w-full max-w-[1000px] glass rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#1e293b] border border-white/5 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left Side: Webcam Section */}
                    <div className="p-8 md:p-12 flex flex-col items-center justify-center bg-slate-900/50 border-r border-white/5">
                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-slate-950">
                            {capturedImage ? (
                                <img src={capturedImage} className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" alt="Captured Subject" />
                            ) : (
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" style={{ transform: 'scaleX(-1)' }} />
                            )}

                            {/* Visual Scanning Effect */}
                            {!capturedImage && !status.message && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="w-48 h-64 border-2 border-blue-500/20 rounded-3xl relative">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/40 animate-scan"></div>
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            {!capturedImage ? (
                                <button
                                    onClick={capturePhoto}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center gap-3 active:scale-95"
                                >
                                    <Camera className="w-5 h-5" /> Capture Photo
                                </button>
                            ) : (
                                <button
                                    onClick={retake}
                                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 border border-white/10"
                                >
                                    <RefreshCw className="w-5 h-5" /> Retake Photo
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Form Section */}
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-[#1e293b]">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Register Subject</h2>
                            <p className="text-slate-400 font-medium">Capture a scan for system access.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Johnathan Doe"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-800 font-bold"
                                />
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={loading || !capturedImage || !name}
                                className="w-full py-5 bg-[#2563eb] hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95 mt-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                Register Identity
                            </button>

                            {status.message && (
                                <div className={`mt-6 p-5 rounded-3xl flex items-center gap-3 text-sm font-bold animate-in slide-in-from-bottom duration-300 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                    <span>{status.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

const CheckCircle2 = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
);
