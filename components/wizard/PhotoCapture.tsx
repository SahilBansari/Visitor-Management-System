import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@fluentui/react-components';
import type { Language } from '../../App'; // Import Language type

interface PhotoCaptureProps {
    onCapture: (file: File) => void;
    onCancel: () => void;
    lang?: Language; // Add lang prop
}

const content = {
    en: {
        title: "Take Photo",
        cancel: "Cancel",
        capture: "Capture",
        error: "Unable to access camera. Please allow camera permissions."
    },
    hi: {
        title: "फोटो लें",
        cancel: "रद्द करें",
        capture: "कैप्चर करें",
        error: "कैमरे का उपयोग करने में असमर्थ। कृपया कैमरा अनुमतियों की अनुमति दें।"
    },
    mr: {
        title: "फोटो काढा",
        cancel: "रद्द करा",
        capture: "कॅप्चर करा",
        error: "कॅमेरा वापरण्यास असमर्थ. कृपया कॅमेरा परवानगी द्या."
    }
};

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onCapture, onCancel, lang = 'en' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string>('');
    const t = content[lang];

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError(t.error);
            console.error("Camera Error:", err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw video frame to canvas
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert to File object
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                        onCapture(file);
                        stopCamera();
                    }
                }, 'image/jpeg');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 w-full max-w-md flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4 dark:text-white">{t.title}</h3>
                
                {error ? (
                    <div className="text-red-500 mb-4 text-center">{error}</div>
                ) : (
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
                        />
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex gap-4 w-full justify-center">
                    <Button onClick={() => { stopCamera(); onCancel(); }}>
                        {t.cancel}
                    </Button>
                    {!error && (
                        <Button appearance="primary" onClick={takePhoto}>
                            {t.capture}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoCapture;