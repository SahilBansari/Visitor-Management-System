import React, { useState, useRef, useCallback } from 'react';
import type { Language } from '../App';
import type { FormData } from './wizard/RegistrationWizard';
import { Button, Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogBody, DialogActions, DialogContent, Spinner } from '@fluentui/react-components';
import { MicRegular, CheckmarkCircle24Filled, DismissCircle24Filled } from '@fluentui/react-icons';


interface AIAssistBookingProps {
    lang: Language;
    onParsed: (data: Partial<FormData>) => void;
}

const content = {
    en: {
        tooltip: 'Use AI Assistant',
        listening: 'Listening... Speak in Hindi or English',
        suggestion: "Try saying: 'My name is Rohan Kumar and I want to meet the Finance Minister.'",
        processing: 'AI is processing your request...',
        confirmTitle: "AI Suggestion",
        confirmBody: "We think you said you want to book a visit with the following details. Please confirm if this looks correct.",
        looksGood: "Looks Good",
        letMeType: "No, let me type",
        error: "Couldn't quite catch that. Please try again or book your appointment manually.",
    },
    hi: {
        tooltip: 'एआई सहायक का प्रयोग करें',
        listening: 'सुन रहा है... हिंदी या अंग्रेजी में बोलें',
        suggestion: "कहकर देखें: 'मेरा नाम रोहन कुमार है और मैं वित्त मंत्री से मिलना चाहता हूं।'",
        processing: 'एआई आपके अनुरोध पर कार्रवाई कर रहा है...',
        confirmTitle: "एआई सुझाव",
        confirmBody: "हमें लगता है कि आप निम्नलिखित विवरणों के साथ एक यात्रा बुक करना चाहते हैं। कृपया पुष्टि करें कि क्या यह सही है।",
        looksGood: "ठीक लग रहा है",
        letMeType: "नहीं, मुझे टाइप करने दें",
        error: "ठीक से समझ नहीं आया। कृपया पुनः प्रयास करें या अपना अपॉइंटमेंट मैन्युअल रूप से बुक करें।",
    },
    mr: {
        tooltip: 'एआय असिस्टंट वापरा',
        listening: 'ऐकत आहे... मराठी, हिंदी किंवा इंग्रजीमध्ये बोला',
        suggestion: "हे म्हणून पहा: 'माझे नाव रोहन कुमार आहे आणि मला अर्थमंत्र्यांशी भेटायचे आहे.'",
        processing: 'एआय तुमच्या विनंतीवर प्रक्रिया करत आहे...',
        confirmTitle: "एआय सूचना",
        confirmBody: "आम्हाला वाटते की तुम्ही खालील तपशीलांसह भेट बुक करू इच्छिता. कृपया हे बरोबर असल्याची खात्री करा.",
        looksGood: "योग्य वाटत आहे",
        letMeType: "नाही, मला टाईप करू द्या",
        error: "नीट समजले नाही. कृपया पुन्हा प्रयत्न करा किंवा आपली अपॉइंटमेंट मॅन्युअली बुक करा.",
    }
}

const AIAssistBooking: React.FC<AIAssistBookingProps> = ({ lang, onParsed }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<Partial<FormData> | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const t = content[lang];

    const handleMicClick = async () => {
        if (isListening) {
            mediaRecorderRef.current?.stop();
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.start();
                setIsListening(true);
                setError(null);

                mediaRecorderRef.current.ondataavailable = (event) => {
                    // In a real app, you'd send this audio data to a speech-to-text API
                };

                mediaRecorderRef.current.onstop = () => {
                    setIsListening(false);
                    setIsProcessing(true);
                    stream.getTracks().forEach(track => track.stop());
                    
                    // --- MOCK AI RESPONSE ---
                    setTimeout(() => {
                        const mockConfidence = Math.random();
                        if (mockConfidence >= 0.85) { // High confidence
                            onParsed({ fullName: 'Rakesh Sharma', officer: 'Shri Amit Shah' });
                        } else if (mockConfidence >= 0.6) { // Medium confidence
                            setParsedData({ fullName: 'Rakesh Sharma', officer: 'Shri Amit Shah' });
                        } else { // Low confidence
                            setError(t.error);
                        }
                        setIsProcessing(false);
                    }, 2000);
                };

                setTimeout(() => {
                    if (mediaRecorderRef.current?.state === 'recording') {
                        mediaRecorderRef.current.stop();
                    }
                }, 10000); // Max 10s recording

            } catch (err) {
                console.error("Mic error:", err);
                setError("Microphone access was denied. Please enable it in your browser settings.");
            }
        }
    };
    
    const handleConfirm = () => {
        if (parsedData) {
            onParsed(parsedData);
        }
        setParsedData(null);
    }

    return (
        <div className="relative flex flex-col items-center">
            <Dialog open={!!parsedData} onOpenChange={() => setParsedData(null)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{t.confirmTitle}</DialogTitle>
                        <DialogContent>
                            <p>{t.confirmBody}</p>
                            <div className="mt-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-md space-y-2">
                                <p><strong className="font-semibold">Name:</strong> Rakesh Sharma</p>
                                <p><strong className="font-semibold">Officer:</strong> Shri Amit Shah</p>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setParsedData(null)}>{t.letMeType}</Button>
                            <Button appearance="primary" onClick={handleConfirm}>{t.looksGood}</Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <Button 
                icon={<MicRegular />} 
                shape="circular" 
                size="medium"
                aria-label={t.tooltip}
                onClick={handleMicClick}
                className={isListening ? 'animate-pulse' : ''}
                appearance={isListening ? 'primary' : 'outline'}
            />
            
            {(isListening || isProcessing || error) && (
                <div className="absolute top-full mt-2 w-max max-w-xs p-3 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl text-sm z-[100]">
                    {isListening && (
                        <div className="text-center">
                            <p className="text-primary dark:text-white font-semibold">{t.listening}</p>
                            <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1">{t.suggestion}</p>
                        </div>
                    )}
                    {isProcessing && (
                        <div className="flex items-center gap-2">
                            <Spinner size="tiny" />
                            <p>{t.processing}</p>
                        </div>
                    )}
                    {error && <p className="text-error">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default AIAssistBooking;