import React, { useState, useEffect } from 'react';
import type { Tenant } from '../utils/mockDatabase';
import type { Language } from '../App';

interface DepartmentSelectionProps {
    onSelect: (tenant: Tenant) => void;
    lang: Language;
    setLang: (lang: Language) => void;
}

const content = {
    en: {
        govTitle: "Government of Uttarakhand",
        portalTitle: "Visitor Management System",
        subTitle: "Secretariat Administration",
        loginTitle: "Digital Entry Portal",
        instruction: "Select administrative wing to proceed",
        lblDept: "Department / Wing",
        lblSelect: "Select Department...",
        irrigation: "Irrigation Division (Block A)",
        agriculture: "Agriculture Division (Block B)",
        proceed: "Proceed to Secure Login",
        copyright: "© 2026 Government of Uttarakhand. All rights reserved.",
        privacy: "Privacy Policy",
        terms: "Terms of Service"
    },
    hi: {
        govTitle: "उत्तराखंड सरकार",
        portalTitle: "आगंतुक प्रबंधन प्रणाली",
        subTitle: "सचिवालय प्रशासन",
        loginTitle: "डिजिटल प्रवेश पोर्टल",
        instruction: "आगे बढ़ने के लिए प्रशासनिक स्कंध का चयन करें",
        lblDept: "विभाग / स्कंध",
        lblSelect: "विभाग चुनें...",
        irrigation: "सिंचाई विभाग (खंड अ)",
        agriculture: "कृषि विभाग (खंड ब)",
        proceed: "सुरक्षित लॉगिन पर जाएं",
        copyright: "© 2026 उत्तराखंड सरकार। सर्वाधिकार सुरक्षित।",
        privacy: "गोपनीयता नीति",
        terms: "सेवा की शर्तें"
    },
    mr: {
        govTitle: "उत्तराखंड शासन",
        portalTitle: "अतिथी व्यवस्थापन प्रणाली",
        subTitle: "सचिवालय प्रशासन",
        loginTitle: "डिजिटल प्रवेश पोर्टल",
        instruction: "पुढे जाण्यासाठी प्रशासकीय विभाग निवडा",
        lblDept: "विभाग / शाखा",
        lblSelect: "विभाग निवडा...",
        irrigation: "जलसंपदा विभाग (ब्लॉक A)",
        agriculture: "कृषी विभाग (ब्लॉक B)",
        proceed: "सुरक्षित लॉगिनवर जा",
        copyright: "© 2026 उत्तराखंड शासन. सर्व हक्क राखीव.",
        privacy: "गोपनीयता धोरण",
        terms: "सेवा अटी"
    }
};

const SLIDES = [
    { url: "/assets/slideshow_1.png", alt: "Secretariat View 1" },
    { url: "/assets/slideshow_2.jpg", alt: "Secretariat View 2" },
    { url: "/assets/slideshow_3.jpg", alt: "Secretariat View 3" }
];

const DepartmentSelection: React.FC<DepartmentSelectionProps> = ({ onSelect, lang, setLang }) => {
    const t = content[lang];
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedDept, setSelectedDept] = useState<Tenant | "">("");
    const [isAnimating, setIsAnimating] = useState(false);

    // Auto-advance slideshow
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const handleProceed = () => {
        if (selectedDept) {
            setIsAnimating(true);
            // Small delay for button animation before switching
            setTimeout(() => onSelect(selectedDept as Tenant), 400);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-900 overflow-hidden relative">
            
            {/* --- IMMERSIVE BACKGROUND SLIDESHOW --- */}
            <div className="fixed inset-0 z-0 bg-slate-900">
                {SLIDES.map((slide, index) => (
                    <div 
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentSlide ? 'opacity-60' : 'opacity-0'}`}
                    >
                        {slide.url ? (
                            <img 
                                src={slide.url} 
                                alt={slide.alt} 
                                className="w-full h-full object-cover scale-105 animate-[kenburns_20s_infinite]"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-800" />
                        )}
                        {/* Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10"></div>
                    </div>
                ))}
            </div>

            {/* --- HEADER (Glassmorphism) --- */}
            <header className="z-30 w-full p-4 md:p-6">
                <nav className="container mx-auto flex justify-between items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <img 
                            src="/assets/uttarakand_emblem.png" 
                            alt="Emblem" 
                            className="h-12 md:h-14 w-auto drop-shadow-md invert brightness-0 md:invert-0 md:brightness-100" 
                        />
                        <div className="hidden md:flex flex-col text-white">
                            <h2 className="text-lg font-bold uppercase tracking-wider leading-none">{t.govTitle}</h2>
                            <p className="text-xs opacity-80 font-medium tracking-widest mt-1">{t.subTitle}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <img 
                            src="/assets/Azadi_ka_Amrit_Mahotsav_Logo_PNG_High_Quality_image_download-PNGLove.com.png" 
                            alt="75 Years" 
                            className="h-12 w-auto object-contain hidden sm:block brightness-0 invert opacity-90"
                        />
                         <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value as Language)}
                            className="bg-black/20 text-white border border-white/20 text-xs font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer backdrop-blur-sm hover:bg-black/30 transition-colors"
                        >
                            <option value="en" className="text-slate-900">English</option>
                            <option value="hi" className="text-slate-900">हिंदी</option>
                            <option value="mr" className="text-slate-900">मराठी</option>
                        </select>
                    </div>
                </nav>
            </header>

            {/* --- MAIN LOGIN CARD SECTION --- */}
            <main className="flex-grow flex flex-col items-center justify-center p-4 z-20 relative">
                
                <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/40 overflow-hidden transform transition-all duration-500 hover:shadow-[0_25px_70px_-12px_rgba(0,0,0,0.6)]">
                    
                    {/* Orange Top Bar */}
                    <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <span className="material-symbols-outlined text-5xl text-slate-700 mb-4 bg-slate-100 p-4 rounded-full shadow-inner">
                                admin_panel_settings
                            </span>
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">{t.portalTitle}</h1>
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{t.loginTitle}</p>
                        </div>

                        <div className="space-y-5">
                            {/* The Discreet Selector */}
                            <div className="relative group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                                    {t.lblDept}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400">domain</span>
                                    </div>
                                    <select
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value as Tenant)}
                                        className="block w-full pl-10 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none cursor-pointer font-medium shadow-sm hover:bg-white"
                                    >
                                        <option value="" disabled>{t.lblSelect}</option>
                                        <option value="irrigation">{t.irrigation}</option>
                                        <option value="agriculture">{t.agriculture}</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Informational Note (Makes it look like a system check) */}
                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">info</span>
                                <p className="text-[11px] text-blue-700 leading-tight pt-0.5">
                                    {t.instruction}. Secure session will be established based on your selection.
                                </p>
                            </div>

                            <button
                                onClick={handleProceed}
                                disabled={!selectedDept || isAnimating}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all duration-300 transform
                                    ${!selectedDept 
                                        ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                                        : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:scale-[1.02] active:scale-[0.98]'
                                    }
                                `}
                            >
                                {isAnimating ? (
                                    <span className="material-symbols-outlined animate-spin">refresh</span>
                                ) : (
                                    <>
                                        <span>{t.proceed}</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* Decorative Bottom */}
                    <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-center gap-4">
                         <img src="/assets/uttarakand_emblem.png" className="h-6 grayscale opacity-30" alt="seal" />
                         <span className="text-[10px] text-slate-400 font-mono tracking-widest self-center">OFFICIAL GOVT PORTAL</span>
                    </div>
                </div>

            </main>

            {/* --- MINIMAL FOOTER --- */}
            <footer className="z-30 w-full py-6 text-center text-white/40 text-xs">
                <p>{t.copyright}</p>
                <div className="flex justify-center gap-4 mt-2">
                    <button className="hover:text-white transition-colors">{t.privacy}</button>
                    <span>•</span>
                    <button className="hover:text-white transition-colors">{t.terms}</button>
                </div>
            </footer>
        </div>
    );
};

export default DepartmentSelection;