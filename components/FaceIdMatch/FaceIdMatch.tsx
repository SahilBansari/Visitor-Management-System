import React, { useState, useRef, useEffect } from 'react';
import { Button, Spinner } from '@fluentui/react-components';
import type { Language } from '../../App'; // Import Language

interface FaceIdMatchProps {
    onMatch: (score: number) => void;
    onFail: () => void;
    onPhotoCapture?: (photoDataUrl: string) => void; // Add callback for photo
    lang?: Language; // Add lang prop
}

const content = {
    en: {
        title: "Live Face Capture",
        start: "Start Camera",
        capture: "Capture",
        retake: "Retake Photo",
        match: "Match Score:",
        error: "Unable to access camera.",
        scanning: "Scanning Face...",
        crossReferencing: "Cross-referencing State Database...",
        blacklisted: "SECURITY ALERT: Person identified on No-Entry Blacklist!"
    },
    hi: {
        title: "लाइव फेस कैप्चर",
        start: "कैमरा शुरू करें",
        capture: "कैप्चर करें",
        retake: "फिर से फोटो लें",
        match: "मिलान स्कोर:",
        error: "कैमरे का उपयोग करने में असमर्थ।",
        scanning: "चेहरा स्कैन किया जा रहा है...",
        crossReferencing: "राज्य डेटाबेस से मिलान किया जा रहा है...",
        blacklisted: "सुरक्षा चेतावनी: व्यक्ति नो-एंट्री ब्लैकलिस्ट में पहचाना गया!"
    },
    mr: {
        title: "थेट चेहरा कॅप्चर",
        start: "कॅमेरा सुरू करा",
        capture: "कॅप्चर करा",
        retake: "पुन्हा फोटो घ्या",
        match: "जुळणारा स्कोअर:",
        error: "कॅमेरा वापरण्यास असमर्थ.",
        scanning: "चेहरा स्कॅन करत आहे...",
        crossReferencing: "राज्य डेटाबेसशी पडताळणी करत आहे...",
        blacklisted: "सुरक्षा इशारा: व्यक्ती नो-एंट्री ब्लॅकलिस्टमध्ये आढळली!"
    }
};

const FaceIdMatch: React.FC<FaceIdMatchProps> = ({ onMatch, onFail, onPhotoCapture, lang = 'en' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStatus, setProcessStatus] = useState<string>('');
    const [matchScore, setMatchScore] = useState<number | null>(null);
    const [isBlacklisted, setIsBlacklisted] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const t = content[lang];

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            setError('');
            setIsBlacklisted(false);
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: 400, height: 400 } 
            });
            setStream(mediaStream);
            setIsCameraActive(true);
            setCapturedImage(null);
            setMatchScore(null);
            
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);

        } catch (err) {
            console.error("Camera Error:", err);
            setError(t.error);
            onFail();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraActive(false);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const imageUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(imageUrl);
                
                // Pass photo to parent component
                if (onPhotoCapture) {
                    onPhotoCapture(imageUrl);
                }
                
                stopCamera();
                processFaceMatch();
            }
        }
    };

    const processFaceMatch = () => {
        setIsProcessing(true);
        setProcessStatus(t.scanning);
        
        // Simulate checking state database
        setTimeout(() => {
            setProcessStatus(t.crossReferencing);
            
            setTimeout(() => {
                setIsProcessing(false);
                // MOCK: 15% chance of being blacklisted for demonstration purposes
                // TODO: Integrate Backend API for real-time Face Recognition & Blacklist check
                const isThreat = Math.random() < 0.15; 
                
                if (isThreat) {
                    setIsBlacklisted(true);
                    onFail();
                } else {
                    const score = Math.floor(Math.random() * (99 - 85 + 1)) + 85; // Random score 85-99
                    setMatchScore(score);
                    onMatch(score);
                }
            }, 2000);
        }, 1500);
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setMatchScore(null);
        setIsBlacklisted(false);
        startCamera();
    };

    return (
        <div className="flex flex-col items-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 w-full">
            <h3 className="text-sm font-semibold mb-3 dark:text-neutral-300">{t.title}</h3>
            
            <div className={`relative w-48 h-48 bg-neutral-200 dark:bg-neutral-900 rounded-full overflow-hidden mb-4 border-4 shadow-lg flex items-center justify-center ${isBlacklisted ? 'border-red-600 animate-pulse' : 'border-white dark:border-neutral-600'}`}>
                
                {!isCameraActive && !capturedImage && (
                    <span className="material-symbols-outlined text-6xl text-neutral-400">person</span>
                )}

                {isCameraActive && (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
                    />
                )}

                {capturedImage && (
                    <img 
                        src={capturedImage} 
                        alt="Captured Face" 
                        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
                    />
                )}

                {isProcessing && (
                    <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm p-2 text-center">
                        <Spinner size="medium" />
                        <span className="text-xs font-semibold mt-2">{processStatus}</span>
                    </div>
                )}
                
                {matchScore !== null && !isProcessing && !isBlacklisted && (
                    <div className="absolute inset-0 z-20 bg-green-500/20 flex items-center justify-center animate-fadeIn">
                        <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
                             <span className="material-symbols-outlined text-3xl">check</span>
                        </div>
                    </div>
                )}

                {isBlacklisted && !isProcessing && (
                    <div className="absolute inset-0 z-20 bg-red-600/80 flex flex-col items-center justify-center animate-fadeIn p-2 text-center text-white backdrop-blur-sm">
                        <span className="material-symbols-outlined text-4xl mb-1">gpp_bad</span>
                        <span className="text-[10px] font-bold uppercase leading-tight">{t.blacklisted}</span>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-col gap-2 w-full max-w-[200px]">
                {error && <p className="text-xs text-red-500 text-center mb-2">{error}</p>}
                
                {isBlacklisted && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs text-center font-semibold mb-2">
                        {t.blacklisted}
                    </div>
                )}

                {!isCameraActive && !capturedImage && (
                    <Button appearance="primary" onClick={startCamera}>
                        {t.start}
                    </Button>
                )}

                {isCameraActive && (
                    <Button appearance="primary" onClick={capturePhoto}>
                        <span className="material-symbols-outlined mr-2 text-lg">camera</span>
                        {t.capture}
                    </Button>
                )}

                {capturedImage && !isProcessing && (
                    <div className="text-center space-y-2">
                        {matchScore !== null && !isBlacklisted && (
                             <p className="text-green-600 font-bold text-sm">{t.match} {matchScore}%</p>
                        )}
                        <Button appearance="outline" onClick={handleRetake} size="small">
                            {t.retake}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceIdMatch;