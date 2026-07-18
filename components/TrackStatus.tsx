import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../App';
import StatusCard, { AppointmentData } from './status/StatusCard';
import { visitorService } from '../services/api';

interface TrackStatusProps {
    lang: Language;
    onBackToHome: () => void;
}

const content = {
    en: {
        backToHome: 'Back to Home',
        title: 'Track Appointment Status',
        passId: 'Pass ID',
        passIdHint: 'Enter the Pass ID received via SMS/Email',
        mobile: 'Mobile Number',
        track: 'Track Status',
        errorMessage: 'No appointment found with the provided details.',
        downloadPass: 'Download Visitor Pass',
        demoLabel: 'Test Credentials (Developer Mode)',
        demoCopy: 'Click to Copy'
    },
    hi: {
        backToHome: 'होम पर वापस जाएं',
        title: 'नियुक्ति की स्थिति ट्रैक करें',
        passId: 'पास आईडी',
        passIdHint: 'एसएमएस/ईमेल द्वारा प्राप्त पास आईडी दर्ज करें',
        mobile: 'मोबाइल नंबर',
        track: 'स्थिति देखें',
        errorMessage: 'दिए गए विवरण के साथ कोई अपॉइंटमेंट नहीं मिला।',
        downloadPass: 'विज़िटर पास डाउनलोड करें',
        demoLabel: 'टेस्ट क्रेडेंशियल्स',
        demoCopy: 'कॉपी करने के लिए क्लिक करें'
    },
    mr: {
        backToHome: 'मुख्य पृष्ठावर परत जा',
        title: 'अपॉइंटमेंट स्थिती तपासा',
        passId: 'पास आयडी',
        passIdHint: 'एसएमएस/ईमेलद्वारे प्राप्त पास आयडी प्रविष्ट करा',
        mobile: 'मोबाईल नंबर',
        track: 'स्थिती पहा',
        errorMessage: 'दिलेल्या तपशीलांसह कोणतीही अपॉइंटमेंट आढळली नाही.',
        downloadPass: 'व्हिजिटर पास डाउनलोड करा',
        demoLabel: 'चाचणी क्रेडेंशियल्स',
        demoCopy: 'कॉपी करण्यासाठी क्लिक करा'
    }
};

const TrackStatus: React.FC<TrackStatusProps> = ({ lang, onBackToHome }) => {
    const [passId, setPassId] = useState('');
    const [mobile, setMobile] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AppointmentData | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const t = content[lang];

    // Cleanup polling when component unmounts
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    // Polling effect: Auto-refresh status when showing pending appointment
    useEffect(() => {
        if (result && result.status === 'pending' && passId && mobile) {
            // Start polling every 5 seconds when status is pending
            pollingIntervalRef.current = setInterval(() => {
                refreshStatus();
            }, 5000);
        } else {
            // Clear polling if not in pending state
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        }
        
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [result, passId, mobile]);

    const refreshStatus = async () => {
        try {
            // Query the backend for the latest status
            const response = await visitorService.getRequestByPassId(passId);
            
            // Handle both wrapped and unwrapped responses
            const requestData = response?.data || response;
            
            if (requestData && requestData.status) {
                const latestStatus = requestData.status.toUpperCase();
                
                // Map backend status to frontend status
                let mappedStatus: 'approved' | 'pending' | 'rejected' = 'pending';
                if (latestStatus === 'APPROVED') mappedStatus = 'approved';
                else if (latestStatus === 'REJECTED') mappedStatus = 'rejected';
                else if (latestStatus === 'WAITING' || latestStatus === 'PENDING') mappedStatus = 'pending';
                
                // Update the result with new status
                setResult(prev => {
                    if (prev && prev.status !== mappedStatus) {
                        console.log(`✅ Status updated: ${prev.status} → ${mappedStatus}`);
                        return {
                            ...prev,
                            status: mappedStatus,
                            // Update other fields from response if available
                            visitorName: requestData.visitor_name || prev.visitorName,
                            office: requestData.department || prev.office,
                            officer: requestData.host_name || prev.officer,
                            date: requestData.visit_date || prev.date,
                            time: requestData.visit_start_time || prev.time,
                        };
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.log('Polling check - status not yet available');
            // Silently continue polling if not found yet
        }
    };

    const handleTrackStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Call API to get the appointment status
            const response = await visitorService.getRequestByPassId(passId);
            
            // Handle both wrapped and unwrapped responses
            const requestData = response?.data || response;
            
            if (requestData && requestData.status) {
                const status = requestData.status.toUpperCase();
                
                // Map backend status to frontend status
                let mappedStatus: 'approved' | 'pending' | 'rejected' = 'pending';
                if (status === 'APPROVED') mappedStatus = 'approved';
                else if (status === 'REJECTED') mappedStatus = 'rejected';
                else if (status === 'WAITING' || status === 'PENDING') mappedStatus = 'pending';
                
                console.log('✅ Request found:', { requestData, mappedStatus });
                
                setResult({
                    passId: requestData.pass_id || passId,
                    mobile: mobile,
                    status: mappedStatus,
                    visitorName: requestData.visitor_name || 'Guest',
                    office: requestData.department || 'Not specified',
                    officer: requestData.host_name || 'Not assigned',
                    date: requestData.visit_date || '2026-02-15',
                    time: requestData.visit_start_time || '10:00',
                    reason: requestData.rejection_reason || undefined,
                });
            } else {
                console.error('Invalid response structure:', response);
                setError(t.errorMessage);
            }
        } catch (err) {
            console.error('Error tracking status:', err);
            
            // Fallback to demo data for testing
            if (passId === 'DEMO-PASS' && mobile === '9876543210') {
                setResult({
                    passId: 'DEMO-PASS',
                    mobile: '9876543210',
                    status: 'approved',
                    visitorName: 'Ravi Kumar',
                    office: 'Irrigation Dept HQ',
                    officer: 'Chief Engineer',
                    date: '2026-02-15',
                    time: '11:30'
                });
            } else if (passId === 'DEMO-WAIT' && mobile === '9876543210') {
                setResult({
                    passId: 'DEMO-WAIT',
                    mobile: '9876543210',
                    status: 'pending',
                    visitorName: 'Sunita Sharma',
                    office: 'Water Resources',
                    officer: 'Director',
                    date: '2026-02-16',
                    time: '14:00'
                });
            } else {
                setError(t.errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl">
            <button onClick={onBackToHome} className="group flex items-center text-[#065F46] hover:text-[#059669] mb-8 font-semibold transition-colors">
                <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                {t.backToHome}
            </button>

            {/* Main Glass Panel */}
            <div className="glass-panel p-8 rounded-2xl shadow-2xl shadow-emerald-900/5 border border-white/60">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ECFDF5] text-[#059669] mb-4 shadow-inner">
                        <span className="material-symbols-outlined text-3xl">search</span>
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-[#064E3B]">{t.title}</h1>
                </div>

                <form onSubmit={handleTrackStatus} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-[#064E3B] mb-2">{t.passId}</label>
                        <input 
                            type="text"
                            value={passId}
                            onChange={e => setPassId(e.target.value)}
                            placeholder="e.g. AVMS-2024-X89"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition-all outline-none"
                            required
                        />
                        <p className="text-xs text-[#065F46]/60 mt-1 ml-1">{t.passIdHint}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#064E3B] mb-2">{t.mobile}</label>
                        <input 
                            type="tel"
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition-all outline-none"
                            required
                        />
                    </div>

                    {/* Button Match: Exact Gradient from Home Page */}
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#064E3B] text-white font-bold text-lg py-3.5 px-8 rounded-xl shadow-lg shadow-[#059669]/20 transform transition hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">radar</span>
                                {t.track}
                            </>
                        )}
                    </button>
                </form>
            </div>
            
            {/* Results Section */}
            <div className="mt-8 flex flex-col gap-4 animate-fadeIn">
                {error && (
                    <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}
                
                {result && (
                    <div className="space-y-6">
                        <StatusCard appointment={result} lang={lang} />
                        
                        {/* Manual Refresh Button for Pending Status */}
                        {result.status === 'pending' && (
                            <button
                                onClick={() => refreshStatus()}
                                disabled={isLoading}
                                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                <span className="material-symbols-outlined text-lg">refresh</span>
                                Check for Updates
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Developer Mode / Demo Credentials */}
            <div className="mt-12 border-t border-dashed border-[#059669]/30 pt-6">
                <div className="bg-[#ECFDF5]/50 rounded-xl p-4 border border-[#A7F3D0]">
                    <h3 className="text-xs font-bold text-[#065F46] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">terminal</span>
                        {t.demoLabel}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div 
                            onClick={() => { setPassId('DEMO-PASS'); setMobile('9876543210'); }}
                            className="cursor-pointer bg-white p-3 rounded-lg border border-[#D1FAE5] hover:border-[#059669] hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-[#059669]">Scenario: Approved</span>
                                <span className="text-[10px] text-gray-400 group-hover:text-[#059669]">Auto-fill</span>
                            </div>
                            <div className="font-mono text-sm text-[#064E3B]">ID: DEMO-PASS</div>
                            <div className="font-mono text-xs text-gray-500">Mob: 9876543210</div>
                        </div>

                        <div 
                            onClick={() => { setPassId('DEMO-WAIT'); setMobile('9876543210'); }}
                            className="cursor-pointer bg-white p-3 rounded-lg border border-[#D1FAE5] hover:border-[#059669] hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-orange-600">Scenario: Pending</span>
                                <span className="text-[10px] text-gray-400 group-hover:text-[#059669]">Auto-fill</span>
                            </div>
                            <div className="font-mono text-sm text-[#064E3B]">ID: DEMO-WAIT</div>
                            <div className="font-mono text-xs text-gray-500">Mob: 9876543210</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackStatus;