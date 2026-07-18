import React, { useState, useEffect } from 'react';
import { Avatar, Button, Card, Badge } from '@fluentui/react-components';
import { getIncomingRequests, updateRequestStatus, MeetingRequest } from '../../../utils/mockDatabase';
import type { Language } from '../../../App';

interface IncomingRequestsProps {
    userId: string;
    lang?: Language;
}

const content = {
    en: {
        title: "Staff Meeting Requests",
        empty: "No pending staff requests.",
        accept: "Accept",
        decline: "Decline",
        time: "Time:",
        subject: "Subject:",
        priority: "Priority",
        internal: "Internal Staff"
    },
    hi: {
        title: "कर्मचारी बैठक अनुरोध",
        empty: "कोई लंबित कर्मचारी अनुरोध नहीं।",
        accept: "स्वीकार",
        decline: "अस्वीकार",
        time: "समय:",
        subject: "विषय:",
        priority: "प्राथमिकता",
        internal: "आंतरिक कर्मचारी"
    },
    mr: {
        title: "कर्मचारी मीटिंग विनंत्या",
        empty: "कोणत्याही प्रलंबित कर्मचारी विनंत्या नाहीत.",
        accept: "स्वीकारा",
        decline: "नाकारा",
        time: "वेळ:",
        subject: "विषय:",
        priority: "प्राधान्य",
        internal: "अंतर्गत कर्मचारी"
    }
};

const IncomingRequests: React.FC<IncomingRequestsProps> = ({ userId, lang = 'en' }) => {
    const [requests, setRequests] = useState<MeetingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const t = content[lang];

    useEffect(() => {
        const fetchReqs = async () => {
            const data = await getIncomingRequests(userId);
            // FILTER: Keep only non-visitor (Office Staff) requests
            const staffOnly = data.filter(req => req.requesterRole !== 'Vendor' && req.requesterRole !== 'Visitor');
            setRequests(staffOnly);
            setLoading(false);
        };
        fetchReqs();
    }, [userId]);

    const handleAction = async (reqId: string, status: 'approved' | 'rejected') => {
        await updateRequestStatus(reqId, status);
        setRequests(prev => prev.filter(r => r.id !== reqId));
    };

    if (loading) return <div className="animate-pulse h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg"></div>;

    if (requests.length === 0) {
        return (
            <div className="p-6 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-400">
                <span className="material-symbols-outlined text-3xl mb-2">inbox</span>
                <p>{t.empty}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                {t.title}
                <Badge appearance="filled" color="danger" shape="circular">{requests.length}</Badge>
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
                {requests.map(req => (
                    <Card key={req.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="flex flex-col sm:flex-row gap-4 p-2">
                            <div className="flex items-start gap-3">
                                <Avatar name={req.requesterName} size={40} color="colorful" />
                                <div>
                                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{req.requesterName}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge appearance="tint" color="informative" size="extra-small">{t.internal}</Badge>
                                        <p className="text-xs text-neutral-500">{t.time} <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 rounded">{req.time}</span></p>
                                    </div>
                                    <p className="text-sm mt-1 font-medium text-neutral-700 dark:text-neutral-300">{t.subject} {req.subject}</p>
                                </div>
                            </div>
                            
                            <div className="flex-grow flex flex-col sm:items-end justify-between gap-2">
                                {req.priority === 'urgent' && (
                                    <Badge appearance="tint" color="danger" icon={<span className="material-symbols-outlined text-[14px]">priority_high</span>}>
                                        {t.priority}: Urgent
                                    </Badge>
                                )}
                                
                                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                    <Button 
                                        appearance="primary" 
                                        size="small" 
                                        className="flex-1 sm:flex-none"
                                        onClick={() => handleAction(req.id, 'approved')}
                                        icon={<span className="material-symbols-outlined">check</span>}
                                    >
                                        {t.accept}
                                    </Button>
                                    <Button 
                                        appearance="outline" 
                                        size="small" 
                                        className="flex-1 sm:flex-none"
                                        onClick={() => handleAction(req.id, 'rejected')}
                                        icon={<span className="material-symbols-outlined">close</span>}
                                    >
                                        {t.decline}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default IncomingRequests;