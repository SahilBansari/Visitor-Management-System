import React, { useState, useMemo, useEffect } from 'react';
import type { Language } from '../App';
import { Tooltip, Spinner } from '@fluentui/react-components';

interface SlotCalendarProps {
    lang: Language;
    officeId: string;
    selectedDate: Date | null;
    selectedTimeSlot: string;
    onDateChange: (date: Date) => void;
    onTimeSlotChange: (time: string) => void;
}

const content = {
    en: {
        selectDate: "Select a Date",
        selectTime: "Select an Available Time Slot",
        wait: "Expected wait",
        min: "min",
    },
    hi: {
        selectDate: "एक तारीख चुनें",
        selectTime: "एक उपलब्ध टाइम स्लॉट चुनें",
        wait: "अपेक्षित प्रतीक्षा",
        min: "मिनट",
    },
    mr: {
        selectDate: "तारीख निवडा",
        selectTime: "उपलब्ध वेळ स्लॉट निवडा",
        wait: "अपेक्षित प्रतीक्षा",
        min: "मिनिटे",
    }
};

interface ForecastSlot {
    time: string;
    queueLength: number;
    color: 'green' | 'amber' | 'red';
}

const fetchForecast = async (officeId: string, date: Date): Promise<ForecastSlot[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const slots = Array.from({ length: 16 }, (_, i) => {
                const hour = 9 + Math.floor(i / 2);
                const minute = (i % 2) * 30;
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const queueLength = Math.floor(Math.random() * 20);
                let color: 'green' | 'amber' | 'red' = 'green';
                if (queueLength > 15) color = 'red';
                else if (queueLength > 5) color = 'amber';
                return { time, queueLength, color };
            });
            resolve(slots);
        }, 500);
    });
};

const SlotCalendar: React.FC<SlotCalendarProps> = ({ lang, officeId, selectedDate, selectedTimeSlot, onDateChange, onTimeSlotChange }) => {
    const t = content[lang];
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
    const [forecast, setForecast] = useState<ForecastSlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (selectedDate) {
            setLoading(true);
            fetchForecast(officeId, selectedDate).then(data => {
                setForecast(data);
                setLoading(false);
            });
        }
    }, [selectedDate, officeId]);

    const daysInMonth = useMemo(() => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const days = [];
        while (date.getMonth() === currentMonth.getMonth()) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentMonth]);

    const firstDayOfMonth = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(), [currentMonth]);
    const today = new Date();
    today.setHours(0,0,0,0);

    const dateLocale = lang === 'mr' ? 'mr-IN' : (lang === 'hi' ? 'hi-IN' : 'en-US');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Calendar Date Picker */}
            <div>
                <h3 className="text-lg font-bold mb-4 text-center text-[#085268]">{t.selectDate}</h3>
                {/* UPDATED: Container style (Solid White + Border) */}
                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-neutral-100 text-[#085268] transition-colors">&lt;</button>
                        <div className="font-bold text-lg text-[#085268]">{currentMonth.toLocaleString(dateLocale, { month: 'long', year: 'numeric' })}</div>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-neutral-100 text-[#085268] transition-colors">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-bold text-gray-500 uppercase tracking-wide">{day}</div>)}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {daysInMonth.map(day => {
                            const isSelected = selectedDate?.toDateString() === day.toDateString();
                            const isPast = day < today;
                            return (
                                <button 
                                    key={day.toString()} 
                                    onClick={() => !isPast && onDateChange(day)} 
                                    disabled={isPast} 
                                    className={`
                                        h-9 w-9 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200
                                        ${isSelected 
                                            ? 'bg-[#1B7E6C] text-white shadow-md transform scale-105' 
                                            : isPast 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-gray-700 hover:bg-[#1B7E6C]/10 hover:text-[#1B7E6C]'
                                        }
                                    `}
                                >
                                    {day.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Column: Time Slots */}
            <div>
                <h3 className="text-lg font-bold mb-4 text-center text-[#085268]">{t.selectTime}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {loading ? (
                         // Loading Skeletons
                         Array.from({length: 12}).map((_, i) => <div key={i} className="h-10 bg-neutral-100 rounded-lg animate-pulse border border-neutral-200"></div>)
                    ) : (
                        forecast.map(({ time, color, queueLength }) => {
                            const isSelected = selectedTimeSlot === time;
                            const isFull = color === 'red';
                            
                            // UPDATED: Color Logic for Professional Theme
                            let statusClasses = '';
                            if (isFull) {
                                statusClasses = 'bg-red-50 text-red-400 border border-red-100 cursor-not-allowed';
                            } else if (color === 'amber') {
                                statusClasses = 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100';
                            } else {
                                // Green / Available
                                statusClasses = 'bg-[#1B7E6C]/5 text-[#1B7E6C] border border-[#1B7E6C]/20 hover:bg-[#1B7E6C]/10';
                            }

                            if (isSelected) {
                                statusClasses = 'bg-[#1B7E6C] text-white border border-[#1B7E6C] shadow-md ring-2 ring-[#1B7E6C]/20';
                            }
                            
                            return (
                                 <Tooltip content={`${t.wait} ~${Math.round(queueLength * 0.8)} ${t.min}`} relationship="label" key={time}>
                                    <button 
                                        onClick={() => !isFull && onTimeSlotChange(time)} 
                                        disabled={isFull} 
                                        className={`p-2 rounded-lg text-sm font-mono transition-all duration-200 ${statusClasses}`}
                                    >
                                        {time}
                                    </button>
                                </Tooltip>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default SlotCalendar;