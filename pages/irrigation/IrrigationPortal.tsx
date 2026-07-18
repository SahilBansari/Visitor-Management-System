import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import type { Tenant } from '../../utils/mockDatabase';

// Adjust imports to point to your existing components
// Note the '../../' because this file is inside pages/irrigation/
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import RegistrationWizard from '../../components/wizard/RegistrationWizard';
import TrackStatus from '../../components/TrackStatus';
import Footer from '../../components/Footer';
import AdminLogin from '../../pages/AdminLogin';
import AdminLayout from '../../pages/admin/AdminLayout';

// Define types locally so this file is independent
export type Language = 'en' | 'hi' | 'mr';
export type Theme = 'light' | 'dark';
export type View = 'landing' | 'wizard' | 'status' | 'adminLogin' | 'adminDashboard';

interface PortalProps {
    onSwitchDepartment: () => void;
}

const IrrigationPortal: React.FC<PortalProps> = ({ onSwitchDepartment }) => {
    // 1. STATE: Independent state for this portal
    const [lang, setLang] = useState<Language>('en');
    const [theme, setTheme] = useState<Theme>('light');
    const [view, setView] = useState<View>('landing');
    const [wizardData, setWizardData] = useState<any>(null);
    
    const { logout } = useAuth();
    
    // 2. HARDCODED TENANT: This file is ONLY for Irrigation
    const tenant: Tenant = 'irrigation'; 

    const handleAIAssist = (data: any) => {
        setWizardData(data);
        setView('wizard');
    };

    // 3. RENDER: The exact logic from your old App.tsx
    return (
        <ThemeProvider tenant={tenant}>
            {/* You can customize this wrapper specifically for Irrigation */}
            <div className="min-h-screen bg-slate-50 transition-colors duration-500">
                 {/* Admin Dashboard */}
                 {view === 'adminDashboard' ? (
                    <AdminLayout 
                        lang={lang} 
                        setLang={setLang} 
                        onLogout={() => setView('landing')} 
                    />
                 ) : view === 'adminLogin' ? (
                     // Admin Login
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
                    // Visitor Flow
                    <div className="flex flex-col min-h-screen font-sans text-slate-900">
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

export default IrrigationPortal;