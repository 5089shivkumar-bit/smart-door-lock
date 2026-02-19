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
        <div className="space-y-8 max-w-4xl mx-auto">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">Biometric Enrollment</h1>
                <p className="text-slate-500 font-medium">Capture a scan to register a new authorized user.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="glass p-8 rounded-[3rem] space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter employee name"
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 font-bold"
                            />
                        </div>

                        {status.message && (
                            <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {status.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                {status.message}
                            </div>
                        )}

                        <button
                            onClick={handleRegister}
                            disabled={loading || !capturedImage || !name}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            Process Registration
                        </button>
                    </div>

                    <div className="glass p-6 rounded-[2rem] border-dashed border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Ensure the subject is well-lit and facing forward for optimal recognition accuracy.</p>
                    </div>
                </div>

                <div className="relative group">
                    <div className="aspect-[4/3] glass rounded-[3rem] overflow-hidden border border-white/10 relative">
                        {capturedImage ? (
                            <img src={capturedImage} className="w-full h-full object-cover animate-in zoom-in duration-300" />
                        ) : (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        )}

                        {/* Scan Line Overlay */}
                        <div className="absolute inset-0 pointer-events-none border-[30px] border-slate-950/20"></div>
                        {!capturedImage && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-blue-500/30 rounded-3xl">
                                <div className="w-full h-1 bg-blue-500/50 absolute top-0 animate-bounce duration-[2000ms]"></div>
                            </div>
                        )}
                    </div>

                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                        {!capturedImage ? (
                            <button
                                onClick={capturePhoto}
                                className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl transition-transform active:scale-90 flex items-center gap-3"
                            >
                                <Camera className="w-4 h-4" /> Capture Frame
                            </button>
                        ) : (
                            <button
                                onClick={retake}
                                className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl transition-transform active:scale-90 flex items-center gap-3 border border-white/10"
                            >
                                <RefreshCw className="w-4 h-4" /> Retake
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
