import React from 'react';
import { ScheduleSlot } from '../../../utils/mockDatabase';
import { Tooltip } from '@fluentui/react-components';
import type { Language } from '../../../App';

interface ScheduleBoardProps {
    slots: ScheduleSlot[];
    loading: boolean;
    onRequest: (slot: ScheduleSlot) => void;
    isViewingSelf: boolean;
    lang?: Language; 
}

const content = {
    en: {
        loading: "Loading availability...",
        empty: "No schedule data available.",
        busyTitle: "Busy / Occupied",
        waitingTitle: "Tentative Request",
        meetingWith: "Meeting with:",
        reqFrom: "Request from:",
        status: { busy: "Busy", wait: "Wait", open: "Open" },
        reqSlot: "Request Slot"
    },
    hi: {
        loading: "उपलब्धता लोड हो रही है...",
        empty: "कोई अनुसूची डेटा उपलब्ध नहीं है।",
        busyTitle: "व्यस्त / अधिकृत",
        waitingTitle: "अनंतिम अनुरोध",
        meetingWith: "के साथ बैठक:",
        reqFrom: "का अनुरोध:",
        status: { busy: "व्यस्त", wait: "प्रतीक्षा", open: "खुलें" },
        reqSlot: "स्लॉट अनुरोध"
    },
    mr: {
        loading: "उपलब्धता लोड होत आहे...",
        empty: "कोणताही वेळापत्रक डेटा उपलब्ध नाही.",
        busyTitle: "व्यस्त / व्यापलेले",
        waitingTitle: "तात्पुरती विनंती",
        meetingWith: "यांच्याशी बैठक:",
        reqFrom: "कडून विनंती:",
        status: { busy: "व्यस्त", wait: "प्रतीक्षा", open: "खुले" },
        reqSlot: "स्लॉट विनंती"
    }
};

const ScheduleBoard: React.FC<ScheduleBoardProps> = ({ slots, loading, onRequest, isViewingSelf, lang = 'en' }) => {
    const t = content[lang];

    if (loading) {
        return <div className="p-8 text-center text-neutral-500 text-xs">{t.loading}</div>;
    }

    if (slots.length === 0) {
        return <div className="p-8 text-center text-neutral-500 text-xs">{t.empty}</div>;
    }

    // Helper to generate hover text
    const getTooltipContent = (slot: ScheduleSlot) => {
        if (slot.status === 'available') return null;

        const person = slot.visitorName || 'Internal Staff';
        const role = slot.visitorRole || 'Unknown Role'; 
        
        if (slot.status === 'busy') {
            return (
                <div className="flex flex-col gap-2 p-2 min-w-[220px]">
                    <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-[11px] tracking-wider border-b border-neutral-700 pb-1">
                        <span className="material-symbols-outlined text-[16px]">do_not_disturb_on</span>
                        {t.busyTitle}
                    </div>
                    <div>
                        <div className="text-white text-sm font-bold leading-tight">{slot.title}</div>
                        <div className="text-neutral-300 text-xs mt-1">
                            {t.meetingWith} <span className="text-white font-semibold">{person}</span>
                        </div>
                        <div className="text-neutral-400 text-[10px] mt-0.5 uppercase tracking-wide font-medium">
                            {role}
                        </div>
                    </div>
                    {slot.description && (
                        <div className="text-neutral-300 text-xs border-t border-neutral-700 pt-1 mt-1">
                            {slot.description}
                        </div>
                    )}
                </div>
            );
        }
        if (slot.status === 'waiting') {
            return (
                <div className="flex flex-col gap-2 p-2 min-w-[220px]">
                    <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase text-[11px] tracking-wider border-b border-neutral-700 pb-1">
                        <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                        {t.waitingTitle}
                    </div>
                    <div>
                        <div className="text-white text-sm font-bold leading-tight">{slot.title}</div>
                        <div className="text-neutral-300 text-xs mt-1">
                            {t.reqFrom} <span className="text-white font-semibold">{person}</span>
                        </div>
                        <div className="text-neutral-400 text-[10px] mt-0.5 uppercase tracking-wide font-medium">
                            {role}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 animate-fadeIn">
            {slots.map((slot, index) => {
                let baseClass = "relative p-2 rounded border transition-all cursor-default flex flex-col items-center justify-center gap-1 text-center min-h-[90px]";
                let colorClass = "";
                let icon = "";
                let statusLabel = "";

                switch (slot.status) {
                    case 'busy':
                        colorClass = "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200";
                        icon = "do_not_disturb_on";
                        statusLabel = t.status.busy;
                        break;
                    case 'waiting':
                        colorClass = "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200";
                        icon = "hourglass_top";
                        statusLabel = t.status.wait;
                        break;
                    case 'available':
                        colorClass = "bg-green-50 border-green-200 text-green-800 hover:bg-green-100 hover:border-green-400 hover:shadow-sm cursor-pointer dark:bg-green-900/20 dark:border-green-800 dark:text-green-200";
                        icon = "check_circle";
                        statusLabel = t.status.open;
                        break;
                }

                const CardContent = (
                    <div 
                        className={`${baseClass} ${colorClass}`}
                        onClick={() => slot.status === 'available' && onRequest(slot)}
                    >
                        <span className="font-mono text-sm font-bold">{slot.time}</span>
                        
                        <div className="flex items-center gap-1 text-[10px] opacity-80 uppercase font-bold tracking-wide">
                            <span className="material-symbols-outlined text-[14px]">{icon}</span>
                            <span>{statusLabel}</span>
                        </div>

                        {!isViewingSelf && slot.status === 'available' && (
                            <button
                                className="mt-2 px-3 py-1 bg-white hover:bg-green-50 text-green-700 border border-green-200 hover:border-green-300 rounded shadow-sm text-[10px] font-bold uppercase tracking-wider transition-all transform hover:scale-105"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRequest(slot);
                                }}
                            >
                                {t.reqSlot}
                            </button>
                        )}
                    </div>
                );

                if (slot.status !== 'available') {
                    return (
                        <Tooltip 
                            key={index} 
                            content={getTooltipContent(slot)} 
                            relationship="description" 
                            withArrow
                            positioning="above"
                        >
                            {CardContent}
                        </Tooltip>
                    );
                }

                return <div key={index}>{CardContent}</div>;
            })}
        </div>
    );
};

export default ScheduleBoard;