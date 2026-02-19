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
        <div className="flex items-start justify-center">
            <div className="w-full max-w-[1100px] bg-[#1f2937] rounded-[16px] shadow-2xl p-8 border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* LEFT SIDE: WEBCAM */}
                    <div className="space-y-4">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/10 shadow-inner">
                            {capturedImage ? (
                                <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                            ) : (
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" style={{ transform: 'scaleX(-1)' }} />
                            )}

                            {!capturedImage && (
                                <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/20 rounded-xl">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/30 animate-scan"></div>
                                </div>
                            )}

                            {loading && (
                                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                </div>
                            )}
                        </div>

                        {!capturedImage ? (
                            <button
                                onClick={capturePhoto}
                                className="w-full py-4 bg-[#2563eb] hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-200 active:scale-[0.98]"
                            >
                                Capture Photo
                            </button>
                        ) : (
                            <button
                                onClick={retake}
                                className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-200 active:scale-[0.98]"
                            >
                                Retake Photo
                            </button>
                        )}
                    </div>

                    {/* RIGHT SIDE: FORM */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Register Identity</h2>
                            <p className="text-slate-400 text-sm">Enroll a new person into the biometric database.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter full name"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#2563eb] transition-all duration-200 placeholder:text-slate-700"
                                />
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={loading || !capturedImage || !name}
                                className="w-full py-4 bg-[#2563eb] hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-200 active:scale-[0.98] mt-2"
                            >
                                {loading ? "Processing..." : "Complete Registration"}
                            </button>

                            {status.message && (
                                <div className={`mt-4 text-sm font-bold flex items-center gap-2 ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                    {status.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                                    {status.message}
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-8 border-t border-white/5">
                            <ul className="text-[11px] text-slate-500 space-y-2 uppercase font-black tracking-widest opacity-40">
                                <li>• ENCRYPTED TRANSMISSION</li>
                                <li>• GDPR COMPLIANT STORAGE</li>
                            </ul>
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
