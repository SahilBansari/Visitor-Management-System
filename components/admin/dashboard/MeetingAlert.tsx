import React, { useState, useEffect } from 'react';
import { getNextStaffMeeting, MeetingAlertData } from '../../../utils/mockDatabase';
import type { Language } from '../../../App';

// Added optional lang prop to prevent breaking calls from Header/Dashboard if they aren't updated yet
interface MeetingAlertProps {
    lang?: Language;
}

const content = {
    en: {
        alertTitle: "Meeting Alert",
        startIn: "Starting in",
        upcoming: "Upcoming:",
        min: "m",
        subject: "Subject",
        type: "Type",
        time: "Time",
        sender: "Sender",
        close: "Close"
    },
    hi: {
        alertTitle: "बैठक चेतावनी",
        startIn: "शुरू होगा",
        upcoming: "आगामी:",
        min: "मिनट",
        subject: "विषय",
        type: "प्रकार",
        time: "समय",
        sender: "प्रेषक",
        close: "बंद करें"
    },
    mr: {
        alertTitle: "मीटिंग सूचना",
        startIn: "सुरू होईल",
        upcoming: "आगामी:",
        min: "मिनिटात",
        subject: "विषय",
        type: "प्रकार",
        time: "वेळ",
        sender: "प्रेषक",
        close: "बंद करा"
    }
};

const MeetingAlert: React.FC<MeetingAlertProps> = ({ lang = 'en' }) => {
    const [alert, setAlert] = useState<MeetingAlertData | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const t = content[lang];

    useEffect(() => {
        const fetchAlert = async () => {
            const data = await getNextStaffMeeting();
            setAlert(data);
        };
        fetchAlert();
        
        const interval = setInterval(fetchAlert, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!alert || alert.minutes > 30) return null;

    const isUrgent = alert.minutes <= 15;
    const baseClasses = "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border";
    const colorClasses = isUrgent
        ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
        : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";

    const timeLabel = isUrgent 
        ? `${t.startIn} ${alert.minutes}${t.min}` 
        : `${t.upcoming} ${alert.minutes}${t.min}`;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={baseClasses + ` ${isOpen ? 'ring-2 ring-offset-1 ring-blue-500' : ''} ${colorClasses}`}
            >
                <span className="material-symbols-outlined text-[16px] filled">
                    {isUrgent ? 'warning' : 'campaign'}
                </span>
                <span>{timeLabel}</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 z-50 animate-slideDown overflow-hidden">
                        <div className={`px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center ${isUrgent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                            <span className={`text-xs font-bold uppercase tracking-wider ${isUrgent ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                                {t.alertTitle}
                            </span>
                            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>
                        
                        <div className="p-4 space-y-3">
                            <div>
                                <p className="text-[10px] text-neutral-400 uppercase font-bold">{t.subject}</p>
                                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                    {alert.subject}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[10px] text-neutral-400 uppercase font-bold">{t.type}</p>
                                    <p className="text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">
                                            {alert.type === 'All Staff' ? 'groups' : 'person'}
                                        </span>
                                        {alert.type}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-neutral-400 uppercase font-bold">{t.time}</p>
                                    <p className="text-xs text-neutral-700 dark:text-neutral-300 font-mono">
                                        {alert.time}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                <p className="text-[10px] text-neutral-400 uppercase font-bold">{t.sender}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                        {alert.sender.charAt(0)}
                                    </div>
                                    <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                                        {alert.sender}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MeetingAlert;