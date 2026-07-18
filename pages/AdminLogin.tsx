import React, { useState, useEffect } from 'react';
import type { Language } from '../App';
import { useAuth } from '../contexts/AuthContext';
import type { Tenant } from '../utils/mockDatabase';

interface AdminLoginProps {
    lang: Language;
    setLang: React.Dispatch<React.SetStateAction<Language>>;
    onLoginSuccess: () => void;
    onBack: () => void;
    tenant: Tenant | null;
}

const content = {
    en: {
        title: 'VMS Admin Portal',
        deptLabel: 'Department',
        email: 'User Email',
        password: 'Password',
        login: 'Login',
        error: 'Invalid credentials or wrong department.',
    },
    hi: {
        title: 'VMS व्यवस्थापक पोर्टल',
        deptLabel: 'विभाग',
        email: 'उपयोगकर्ता ईमेल',
        password: 'पासवर्ड',
        login: 'लॉगिन',
        error: 'अमान्य विवरण या गलत विभाग।',
    },
    mr: {
        title: 'VMS व्यवस्थापक पोर्टल',
        deptLabel: 'विभाग',
        email: 'वापरकर्ता ईमेल',
        password: 'पासवर्ड',
        login: 'लॉगिन',
        error: 'अवैध तपशील किंवा चुकीचा विभाग.',
    }
};

const AdminLogin: React.FC<AdminLoginProps> = ({ lang, setLang, onLoginSuccess, onBack, tenant }) => {
    const { login } = useAuth();
    
    // Auto-fill email based on tenant for easier testing
    const defaultEmail = tenant === 'agriculture' ? 'admin@agri.nic.in' : 'admin@nic.in';
    
    const [email, setEmail] = useState(defaultEmail);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const t = content[lang];

    // Update email if tenant changes
    useEffect(() => {
        setEmail(tenant === 'agriculture' ? 'admin@agri.nic.in' : 'admin@nic.in');
    }, [tenant]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => { 
            // Pass tenant to login function for security check
            if (tenant && login(email, password, tenant)) {
                onLoginSuccess();
            } else {
                setError(t.error);
            }
            setIsLoading(false);
        }, 800);
    };

    // Helper text logic
    const getCredentialsHint = () => {
        if (tenant === 'agriculture') {
            return (
                <div className="text-xs text-left space-y-1 bg-amber-50 p-3 rounded border border-amber-200 text-amber-800">
                    <p className="font-bold">Agri Dept defaults:</p>
                    <div className="grid grid-cols-[60px_1fr] gap-x-2">
                        <span>Admin:</span> <span className="font-mono">admin@agri.nic.in / admin</span>
                        <span>HOD:</span>   <span className="font-mono">hod@agri.nic.in / hod</span>
                        <span>Clerk:</span> <span className="font-mono">clerk@agri.nic.in / clerk</span>
                    </div>
                </div>
            );
        }
        return (
            <div className="text-xs text-left space-y-1 bg-cyan-50 p-3 rounded border border-cyan-200 text-cyan-800">
                <p className="font-bold">Irrigation Dept defaults:</p>
                <div className="grid grid-cols-[60px_1fr] gap-x-2">
                    <span>Admin:</span> <span className="font-mono">admin@nic.in / admin</span>
                    <span>HOD:</span>   <span className="font-mono">hod@nic.in / hod</span>
                    <span>Clerk:</span> <span className="font-mono">clerk@nic.in / clerk</span>
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 relative">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl animate-fadeIn bg-white/40 border border-white/50 shadow-2xl relative">
                
                {/* Back Button */}
                <button 
                    onClick={onBack}
                    className="absolute top-4 left-4 p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors duration-200"
                    title="Back"
                    type="button"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>

                {/* Language Dropdown */}
                <div className="absolute top-4 right-4">
                     <div className="relative group">
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value as Language)}
                            className="appearance-none bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold py-1 pl-3 pr-7 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="mr">मराठी</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-600">
                            <span className="material-symbols-outlined text-base">expand_more</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-6 pt-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-600 mb-4 shadow-inner">
                         <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-slate-800">
                        {t.title}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Locked Department Dropdown */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">{t.deptLabel}</label>
                        <div className="relative">
                            <select 
                                disabled
                                value={tenant || ''}
                                className="w-full px-4 py-2 rounded-lg bg-slate-100 border border-slate-300 text-slate-500 font-semibold appearance-none cursor-not-allowed opacity-80"
                            >
                                <option value="irrigation">Irrigation Department (Jalsampada)</option>
                                <option value="agriculture">Agriculture Department (Krishi)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                <span className="material-symbols-outlined text-sm">lock</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.email}</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 rounded-lg bg-white/70 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.password}</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 rounded-lg bg-white/70 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                        ) : t.login}
                    </button>
                    
                    {/* Dynamic Credentials Hint */}
                    <div className="pt-2 opacity-90 hover:opacity-100 transition-opacity">
                        {getCredentialsHint()}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;