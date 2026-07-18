import React from 'react';
import type { Language, Theme, View } from '../App';
import AIAssistBooking from './AIAssistBooking';
import type { FormData } from './wizard/RegistrationWizard';
import { useAuth } from '../contexts/AuthContext';
import type { Tenant } from '../utils/mockDatabase';

interface HeaderProps {
    lang: Language;
    setLang: React.Dispatch<React.SetStateAction<Language>>;
    theme: Theme;
    setTheme: React.Dispatch<React.SetStateAction<Theme>>;
    onAIAssist: (data: Partial<FormData>) => void;
    isAiEnabled: boolean;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    tenant: Tenant; // Added Tenant Prop
    onChangeDepartment: () => void; // Ability to switch dept
}

const content = {
    en: {
        adminLogin: 'Admin Login',
        adminDashboard: 'Dashboard',
        logout: 'Logout',
        switch: 'Switch Dept',
    },
    hi: {
        adminLogin: 'एडमिन लॉगिन',
        adminDashboard: 'डैशबोर्ड',
        logout: 'लॉग आउट',
        switch: 'विभाग बदलें',
    },
    mr: {
        adminLogin: 'अडमिन लॉगिन',
        adminDashboard: 'डॅशबोर्ड',
        logout: 'लॉग आउट',
        switch: 'विभाग बदला',
    },
};

const Header: React.FC<HeaderProps> = ({ lang, setLang, onAIAssist, isAiEnabled, onNavigate, onLogout, tenant, onChangeDepartment }) => {
    const { isAuthenticated } = useAuth();
    const t = content[lang];

    // Dynamic Branding based on Tenant
    const branding = tenant === 'agriculture' ? {
        title: { en: 'Agriculture Dept. VMS', hi: 'कृषि विभाग वीएमएस', mr: 'कृषी विभाग वीएमएस' },
        icon: 'agriculture'
    } : {
        title: { en: 'Irrigation Dept. VMS', hi: 'सिंचाई विभाग वीएमएस', mr: 'जलसंपदा विभाग वीएमएस' },
        icon: 'water_drop'
    };

    return (
        <header className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/80 border-b border-[var(--primary-100)] shadow-sm">
            <nav className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
                
                {/* Logo Area */}
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('landing')} className="flex items-center gap-3 group">
                         <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-brand)] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                            <span className="material-symbols-outlined">{branding.icon}</span>
                         </div>
                        <span className={`font-heading text-xl md:text-2xl font-bold text-[var(--primary-900)] tracking-tight`}>
                            {branding.title[lang]}
                        </span>
                    </button>
                    {isAiEnabled && (
                        <div className="ml-4">
                             <AIAssistBooking lang={lang} onParsed={onAIAssist} />
                        </div>
                    )}
                </div>

                {/* Actions Area */}
                <div className="flex items-center gap-4 md:gap-6">
                    
                    {/* Dept Switcher */}
                    <button 
                        onClick={onChangeDepartment}
                        className="hidden md:flex items-center text-xs font-bold text-gray-400 hover:text-[var(--primary-600)] transition-colors uppercase tracking-wider"
                    >
                        <span className="material-symbols-outlined text-sm mr-1">swap_horiz</span>
                        {t.switch}
                    </button>

                    {/* Language Selector */}
                    <div className="relative">
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value as Language)}
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold py-2 pl-4 pr-10 rounded-full focus:ring-2 focus:ring-[var(--primary-200)] hover:bg-gray-100 cursor-pointer transition-colors shadow-sm"
                            style={{width: 'auto'}}
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="mr">मराठी</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </div>
                    </div>
                    
                    <div className="h-6 w-px bg-gray-200" aria-hidden="true"></div>

                    {isAuthenticated ? (
                        <>
                            <button
                                onClick={() => onNavigate('adminDashboard')}
                                className="flex items-center text-sm font-bold text-[var(--primary-600)] hover:text-[var(--primary-800)] transition-colors gap-2"
                            >
                                <span className="material-symbols-outlined">dashboard</span>
                                <span className="hidden md:inline">{t.adminDashboard}</span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex items-center text-sm font-bold text-red-500 hover:text-red-700 transition-colors gap-2"
                            >
                                <span className="material-symbols-outlined">logout</span>
                                <span className="hidden md:inline">{t.logout}</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onNavigate('adminLogin')}
                            className={`flex items-center text-sm font-bold hover:opacity-80 transition-colors gap-2 text-[var(--primary-700)]`}
                        >
                            <span className="material-symbols-outlined">admin_panel_settings</span>
                            <span className="hidden md:inline">{t.adminLogin}</span>
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;