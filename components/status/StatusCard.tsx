import React, { useState, useEffect } from 'react';
import type { Language } from '../../App';
import { downloadVisitorPass, printVisitorPass } from '../../utils/visitorPassPdf';

export interface AppointmentData {
    passId: string;
    mobile: string;
    status: 'approved' | 'pending' | 'rejected';
    visitorName: string;
    office: string;
    officer: string;
    date: string;
    time: string;
    reason?: string;
}

interface StatusCardProps {
    appointment: AppointmentData;
    lang: Language;
}

const content = {
    en: {
        status: {
            approved: 'Approved',
            pending: 'Pending Approval',
            rejected: 'Rejected',
        },
        visitor: 'Visitor',
        office: 'Office',
        officer: 'Officer',
        dateTime: 'Date & Time',
        rejectionReason: 'Reason for Rejection',
        pendingMsg: "Your appointment request for",
        pendingMsg2: "is currently in the waiting list.",
        pendingSub: "You will receive an SMS and email once the officer approves your request. This page automatically checks for updates every 5 seconds.",
        downloadBtn: "Download Visitor Pass"
    },
    hi: {
        status: {
            approved: 'स्वीकृत',
            pending: 'अनुमोदन लंबित',
            rejected: 'अस्वीकृत',
        },
        visitor: 'आगंतुक',
        office: 'कार्यालय',
        officer: 'अधिकारी',
        dateTime: 'दिनांक और समय',
        rejectionReason: 'अस्वीकृति का कारण',
        pendingMsg: "आपका",
        pendingMsg2: "का अनुरोध अभी प्रतीक्षा सूची में है।",
        pendingSub: "अधिकारी द्वारा अनुरोध स्वीकृत होने पर आपको एसएमएस और ईमेल प्राप्त होगा। यह पृष्ठ हर 5 सेकंड में स्वचालित रूप से अपडेट की जांच करता है।",
        downloadBtn: "विज़िटर पास डाउनलोड करें"
    },
    mr: {
        status: {
            approved: 'मंजूर',
            pending: 'मंजूरी प्रलंबित',
            rejected: 'नाकारले',
        },
        visitor: 'अभ्यागत',
        office: 'कार्यालय',
        officer: 'अधिकारी',
        dateTime: 'तारीख आणि वेळ',
        rejectionReason: 'नाकारण्याचे कारण',
        pendingMsg: "तुमची",
        pendingMsg2: "ची विनंती सध्या प्रतीक्षा यादीत आहे.",
        pendingSub: "अधिकाऱ्याने विनंती मंजूर केल्यावर तुम्हाला एसएमएस आणि ईमेल प्राप्त होईल. हे पृष्ठ प्रत्येक 5 सेकंदात स्वयंचलितपणे अपडेट्सची तपासणी करते.",
        downloadBtn: "व्हिजिटर पास डाउनलोड करा"
    }
}

const QrCodeSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full opacity-90">
        {/* Changed fill to currentColor so it inherits text-primary-900 */}
        <path fill="currentColor" d="M10 10h20v20H10z m10 5v10h-5v-5h-5v-5h10z m-5 25h10v10H15z M70 10h20v20H70z m5 5h10v10H75z M40 10h10v10H40z M55 10h5v10h-5z M40 25h5v5h-5z m15 0h5v5h-5z M10 40h10v10H10z m20 0h5v5h-5z M10 55h5v5h-5z m5 5h5v5h-5z m10 0h5v5h-5z M10 70h20v20H10z m5 5v10h10v-5h-5v-5h-5z M40 40h10v5H40z m15 0h5v5h-5z m10 0h5v5h-5z m10 0h15v5h-15z M40 50h5v10h-5z m25 0h5v5h-5z m10 0h5v5h-5z M70 40h5v15h-5z M40 65h10v5H40z m15 0h5v5h-5z M70 65h5v5h-5z M40 70h5v10h-5z m15 5h5v5h-5z m10 0h5v5h-5z M70 70h20v20H70z m5 5h10v10h-5v-5h-5v-5z"/>
    </svg>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
        {/* Replaced text-[#059669] with text-primary-600 */}
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-1">{label}</p>
        {/* Replaced text-[#064E3B] with text-primary-900 */}
        <p className="font-bold text-primary-900 text-lg">{value}</p>
    </div>
);

const StatusCard: React.FC<StatusCardProps> = ({ appointment, lang }) => {
    const t = content[lang];
    const [showApprovalAnimation, setShowApprovalAnimation] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Trigger animation when status changes to approved
    useEffect(() => {
        if (appointment.status === 'approved') {
            setShowApprovalAnimation(true);
            const timer = setTimeout(() => {
                setShowApprovalAnimation(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [appointment.status]);

    // Handle download visitor pass
    const handleDownloadPass = async () => {
        try {
            setIsDownloading(true);
            await downloadVisitorPass({
                passId: appointment.passId,
                visitorName: appointment.visitorName,
                office: appointment.office,
                officer: appointment.officer,
                date: appointment.date,
                time: appointment.time,
            });
        } catch (error) {
            console.error('Failed to download pass:', error);
            alert('Failed to download visitor pass. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Handle print visitor pass
    const handlePrintPass = async () => {
        try {
            printVisitorPass({
                passId: appointment.passId,
                visitorName: appointment.visitorName,
                office: appointment.office,
                officer: appointment.officer,
                date: appointment.date,
                time: appointment.time,
            });
        } catch (error) {
            console.error('Failed to print pass:', error);
            alert('Failed to print visitor pass. Please try again.');
        }
    };

    // Note: Approved/Pending/Rejected colors (Green/Amber/Red) are semantic state colors.
    // We usually KEEP these consistent regardless of theme for clarity.
    // However, the "Approved" card details will now match the Department Brand.
    
    const statusConfig = {
        approved: {
            icon: 'check_circle',
            textColor: 'text-primary-600',       // Dynamic Brand Color
            borderColor: 'border-primary-600',   // Dynamic Brand Color
            headerBg: 'bg-primary-50',           // Dynamic Brand Color
            cardBorder: 'border-primary-200'     // Dynamic Brand Color
        },
        pending: {
            icon: 'hourglass_top',
            textColor: 'text-amber-600',
            borderColor: 'border-amber-600',
            headerBg: 'bg-amber-50',
            cardBorder: 'border-amber-200'
        },
        rejected: {
            icon: 'cancel',
            textColor: 'text-red-600',
            borderColor: 'border-red-600',
            headerBg: 'bg-red-50',
            cardBorder: 'border-red-200'
        }
    };
    
    const config = statusConfig[appointment.status];

    return (
        <>
            {/* Approval Animation Notification */}
            {showApprovalAnimation && (
                <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
                    <div className="relative">
                        {/* Expanding rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-primary-600 animate-ping"></div>
                        <div className="absolute inset-0 rounded-full border border-primary-600 opacity-30 animate-pulse"></div>
                        
                        {/* Central circle with checkmark */}
                        <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center shadow-2xl shadow-primary-600/50 animate-bounce">
                            <span className="material-symbols-outlined text-5xl text-white">check</span>
                        </div>
                        
                        {/* Success message */}
                        <div className="text-center mt-8">
                            <h3 className="text-2xl font-bold text-primary-600">Request Approved!</h3>
                            <p className="text-gray-600 mt-2">Your QR code is ready</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={`rounded-2xl shadow-xl border ${config.cardBorder} overflow-hidden bg-white transition-all duration-500 animate-fadeIn`}>
                {/* Header */}
                <div className={`p-5 ${config.headerBg} flex items-center gap-4 border-b ${config.cardBorder}`}>
                    <span className={`material-symbols-outlined text-4xl ${config.textColor}`}>{config.icon}</span>
                    <div>
                        <h2 className={`text-xl font-bold font-heading ${config.textColor}`}>
                            {t.status[appointment.status]}
                        </h2>
                        <p className="text-sm text-gray-600">ID: <span className="font-mono font-bold">{appointment.passId}</span></p>
                    </div>
                </div>

            <div className="p-6 md:p-8">
                {/* APPROVED STATE: Details + Download Button */}
                {appointment.status === 'approved' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Replaced fixed green bg with primary-50 and border-primary-200 */}
                            <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-primary-50 rounded-xl border border-primary-200 text-primary-900">
                                <div className="w-32 h-32">
                                    <QrCodeSvg />
                                </div>
                                <span className="text-xs text-primary-800 font-mono mt-2 tracking-widest">SCAN ME</span>
                            </div>
                            <div className="md:col-span-2 flex flex-col justify-center space-y-4">
                                <DetailRow label={t.visitor} value={appointment.visitorName} />
                                <DetailRow label={t.office} value={appointment.office} />
                                <DetailRow label={t.officer} value={appointment.officer} />
                                <DetailRow label={t.dateTime} value={`${appointment.date} @ ${appointment.time}`} />
                            </div>
                        </div>
                        
                        {/* THE DOWNLOAD BUTTON - DYNAMIC THEME COLOR */}
                        <div className="pt-4 border-t border-gray-100 flex gap-3">
                            {/* Download Button */}
                            <button 
                                onClick={handleDownloadPass}
                                disabled={isDownloading}
                                className="flex-1 bg-primary-800 hover:bg-primary-900 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                            >
                                <span className="material-symbols-outlined">download</span>
                                {isDownloading ? 'Downloading...' : t.downloadBtn}
                            </button>
                            
                            {/* Print Button */}
                            <button 
                                onClick={handlePrintPass}
                                disabled={isDownloading}
                                className="bg-primary-100 hover:bg-primary-200 text-primary-800 font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary-900/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60"
                                title="Print Visitor Pass"
                            >
                                <span className="material-symbols-outlined">print</span>
                            </button>
                        </div>
                    </div>
                )}

                 {/* PENDING STATE */}
                 {appointment.status === 'pending' && (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <span className="material-symbols-outlined text-3xl">pending_actions</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Request Under Review</h3>
                        <p className="text-gray-600 mb-4 px-4 leading-relaxed">
                            {t.pendingMsg} <strong>{appointment.date}</strong> {t.pendingMsg2}
                        </p>
                        <div className="inline-block bg-amber-50 text-amber-800 text-sm px-4 py-2 rounded-lg font-medium border border-amber-100">
                            {t.pendingSub}
                        </div>
                    </div>
                 )}

                 {/* REJECTED STATE */}
                 {appointment.status === 'rejected' && (
                    <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailRow label={t.visitor} value={appointment.visitorName} />
                            <DetailRow label={t.office} value={appointment.office} />
                         </div>
                         <div className={`p-4 rounded-xl bg-red-50 border border-red-100`}>
                            <p className="text-xs font-bold text-red-800 uppercase mb-1">{t.rejectionReason}</p>
                            <p className="text-red-700 font-medium text-lg">{appointment.reason || "Administrative reasons."}</p>
                         </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default StatusCard;