import React from 'react';
import type { Language } from '../App';
import type { Tenant } from '../utils/mockDatabase';

interface HeroProps {
    lang: Language;
    onBookAppointment: () => void;
    onTrackStatus: () => void;
    tenant: Tenant;
}

const content = {
    en: {
        tagline1: 'Secure Visitor Management System',
        tagline2_irrigation: 'Irrigation Department',
        tagline2_agriculture: 'Agriculture Department',
        bookAppointment: 'Book Appointment',
        trackStatus: 'Track Status',
        govName: 'Government of Uttarakhand',
    },
    hi: {
        tagline1: 'सुरक्षित आगंतुक प्रबंधन प्रणाली',
        tagline2_irrigation: 'सिंचाई विभाग',
        tagline2_agriculture: 'कृषि विभाग',
        bookAppointment: 'अपॉइंटमेंट बुक करें',
        trackStatus: 'स्थिति ट्रैक करें',
        govName: 'उत्तराखंड सरकार',
    },
    mr: {
        tagline1: 'सुरक्षित अतिथी व्यवस्थापन प्रणाली',
        tagline2_irrigation: 'जलसंपदा विभाग',
        tagline2_agriculture: 'कृषी विभाग',
        bookAppointment: 'अपॉइंटमेंट बुक करा',
        trackStatus: 'स्थिती ट्रॅक करा',
        govName: 'उत्तराखंड शासन', // Marathi text retained as requested
    },
};

const Hero: React.FC<HeroProps> = ({ lang, onBookAppointment, onTrackStatus, tenant }) => {
    const isAgri = tenant === 'agriculture';

    // Theming is now handled by CSS variables, but we keep structure classes
    // Note: We use standard Tailwind classes that map to the variables defined in index.css
    
    return (
        <section className="relative py-20 md:py-32 overflow-hidden">
            {/* Background Decor - Uses Dynamic Primary Colors */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-[-1] opacity-40 pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-10 right-10 w-72 h-72 bg-[var(--secondary-brand)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <div className="container mx-auto px-6 md:px-8 text-center relative z-10">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-[var(--primary-200)] bg-[var(--primary-50)] text-[var(--primary-700)] text-sm font-semibold tracking-wide uppercase shadow-sm">
                    {content[lang].govName}
                </div>
                
                <p className="font-body text-xl md:text-2xl text-[var(--primary-800)] max-w-2xl mx-auto mb-6 opacity-90">
                    {isAgri ? content[lang].tagline2_agriculture : content[lang].tagline2_irrigation}
                </p>
                
                <h1 className="font-heading text-5xl md:text-7xl font-bold text-[var(--primary-900)] leading-tight tracking-tight mb-10">
                    {content[lang].tagline1}
                </h1>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
                    <button 
                        onClick={onBookAppointment}
                        className="w-full sm:w-auto bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] hover:from-[var(--primary-700)] hover:to-[var(--primary-800)] text-white font-bold text-lg py-4 px-10 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 focus:ring-4 focus:ring-[var(--primary-200)] flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">calendar_add_on</span>
                        {content[lang].bookAppointment}
                    </button>
                    
                    <button 
                        onClick={onTrackStatus}
                        className="w-full sm:w-auto bg-white text-[var(--primary-700)] border-2 border-[var(--primary-100)] hover:border-[var(--primary-300)] font-bold text-lg py-4 px-10 rounded-xl shadow-md transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">search</span>
                        {content[lang].trackStatus}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;