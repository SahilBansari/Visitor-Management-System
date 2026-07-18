import React from 'react';
import type { Language } from '../../App';
import type { FormData } from './RegistrationWizard';
import SlotCalendar from '../SlotCalendar';

interface Step3DateTimeProps {
    lang: Language;
    formData: FormData;
    updateFormData: (field: keyof FormData, value: any) => void;
}

const content = {
    en: {
        title: "Select Date & Time",
        subtitle: "Choose a convenient slot for your visit",
        date: "Date",
        time: "Time Slot",
    },
    hi: {
        title: "दिनांक और समय चुनें",
        subtitle: "अपनी यात्रा के लिए एक सुविधाजनक समय चुनें",
        date: "दिनांक",
        time: "समय",
    },
    mr: {
        title: "तारीख आणि वेळ निवडा",
        subtitle: "तुमच्या भेटीसाठी सोयीस्कर वेळ निवडा",
        date: "तारीख",
        time: "वेळ",
    }
};

const Step3DateTime: React.FC<Step3DateTimeProps> = ({ lang, formData, updateFormData }) => {
    const t = content[lang];

    const handleDateChange = (date: Date) => {
        updateFormData('date', date);
        updateFormData('timeSlot', '');
    };

    const handleSlotChange = (time: string) => {
        updateFormData('timeSlot', time);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* UPDATED: Heading Color Deep Blue (#085268) */}
            <h2 className="text-2xl font-heading font-bold text-[#085268] mb-2">{t.title}</h2>
            <p className="text-gray-500 mb-8">{t.subtitle}</p>
            
            {/* UPDATED: Container Solid White with Border (No Dark Mode) */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden p-6 md:p-8">
                <SlotCalendar 
                    lang={lang} // Added lang prop
                    officeId={formData.office}
                    selectedDate={formData.date}
                    selectedTimeSlot={formData.timeSlot}
                    onDateChange={handleDateChange}
                    onTimeSlotChange={handleSlotChange}
                />
            </div>
            
            {/* Summary Chips */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 text-sm text-gray-700">
                {formData.date && (
                    <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-lg text-[#085268]">
                        <span className="material-symbols-outlined text-[#1B7E6C]">calendar_month</span>
                        <span>{t.date}: <strong>{formData.date.toLocaleDateString((lang === 'hi' || lang === 'mr') ? 'hi-IN' : 'en-IN', { dateStyle: 'long' })}</strong></span>
                    </div>
                )}
                {formData.timeSlot && (
                    <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-lg text-[#085268]">
                        <span className="material-symbols-outlined text-[#1B7E6C]">schedule</span>
                        <span>{t.time}: <strong>{formData.timeSlot}</strong></span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Step3DateTime;