import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import type { Tenant } from '../../utils/mockDatabase';

// Import Components
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import RegistrationWizard from '../../components/wizard/RegistrationWizard';
import TrackStatus from '../../components/TrackStatus';
import Footer from '../../components/Footer';
import AdminLogin from '../../pages/AdminLogin';
import AdminLayout from '../../pages/admin/AdminLayout';

export type Language = 'en' | 'hi' | 'mr';
export type Theme = 'light' | 'dark';
export type View = 'landing' | 'wizard' | 'status' | 'adminLogin' | 'adminDashboard';

interface PortalProps {
    onSwitchDepartment: () => void;
}

const AgriculturePortal: React.FC<PortalProps> = ({ onSwitchDepartment }) => {
    const [lang, setLang] = useState<Language>('en');
    const [theme, setTheme] = useState<Theme>('light');
    const [view, setView] = useState<View>('landing');
    const [wizardData, setWizardData] = useState<any>(null);
    
    const { logout } = useAuth();
    
    // HARDCODED TENANT
    const tenant: Tenant = 'agriculture'; 

    const handleAIAssist = (data: any) => {
        setWizardData(data);
        setView('wizard');
    };

    return (
        <ThemeProvider tenant={tenant}>
            {/* STYLE CHANGE: Using 'bg-stone-50' for an earthy look specifically for Agriculture */}
            <div className="min-h-screen bg-stone-50 transition-colors duration-500">
                 {view === 'adminDashboard' ? (
                    <AdminLayout 
                        lang={lang} 
                        setLang={setLang} 
                        onLogout={() => setView('landing')} 
                    />
                 ) : view === 'adminLogin' ? (
                    <div className="flex flex-col min-h-screen">
                         <Header 
                            lang={lang} setLang={setLang} 
                            theme={theme} setTheme={setTheme}
                            onAIAssist={handleAIAssist}
                            isAiEnabled={false} 
                            onNavigate={(v) => setView(v as View)}
                            onLogout={logout}
                            tenant={tenant}
                            onChangeDepartment={onSwitchDepartment}
                        />
                        <AdminLogin 
                            lang={lang}
                            setLang={setLang} 
                            onLoginSuccess={() => setView('adminDashboard')}
                            onBack={() => setView('landing')}
                            tenant={tenant}
                        />
                    </div>
                 ) : (
                    <div className="flex flex-col min-h-screen font-sans text-stone-900">
                        <Header 
                            lang={lang} setLang={setLang} 
                            theme={theme} setTheme={setTheme}
                            onAIAssist={handleAIAssist}
                            isAiEnabled={view === 'landing'} 
                            onNavigate={(v) => setView(v as View)}
                            onLogout={logout}
                            tenant={tenant}
                            onChangeDepartment={onSwitchDepartment}
                        />

                        <main className="flex-grow relative">
                            <div key={view} className="animate-fadeIn w-full">
                                {view === 'landing' && (
                                    <Hero 
                                        lang={lang} 
                                        onBookAppointment={() => setView('wizard')}
                                        onTrackStatus={() => setView('status')}
                                        tenant={tenant}
                                    />
                                )}

                                {view === 'wizard' && (
                                    <RegistrationWizard 
                                        lang={lang} 
                                        onBackToHome={() => setView('landing')} 
                                        initialData={wizardData}
                                        tenant={tenant}
                                    />
                                )}

                                {view === 'status' && (
                                    <div className="py-20">
                                        <TrackStatus lang={lang} onBack={() => setView('landing')} />
                                    </div>
                                )}
                            </div>
                        </main>
                        <Footer lang={lang} />
                    </div>
                 )}
            </div>
        </ThemeProvider>
    );
};

export default AgriculturePortal;