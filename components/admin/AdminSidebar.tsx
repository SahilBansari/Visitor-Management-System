import React from 'react';
import { Tooltip, Avatar } from '@fluentui/react-components';
import { useAuth } from '../../contexts/AuthContext';
import type { Language } from '../../App';

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    currentPage: string;
    setCurrentPage: (page: string) => void;
    lang: Language;
}

const content = {
    en: { 
        title: "SUDK VMS", 
        dashboard: "Dashboard", 
        schedule: "My Schedule", 
        visitors: "Visitors", 
        officers: "Officers", 
        security: "Security", // Changed from Command Center
        audit: "Audit Log", 
        settings: "Settings" 
    },
    hi: { 
        title: "SUDK वीएमएस", 
        dashboard: "डैशबोर्ड", 
        schedule: "मेरी समय सारिणी", 
        visitors: "आगंतुक", 
        officers: "अधिकारी", 
        security: "सुरक्षा", // Changed to align with Hindi
        audit: "ऑडिट लॉग", 
        settings: "सेटिंग्स" 
    },
    mr: { 
        title: "SUDK वीएमएस", 
        dashboard: "डॅशबोर्ड", 
        schedule: "माझे वेळापत्रक", 
        visitors: "अभ्यागत", 
        officers: "अधिकारी", 
        security: "सुरक्षा", // Changed to align with Marathi
        audit: "ऑडिट लॉग", 
        settings: "सेटिंग्ज" 
    }
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen, currentPage, setCurrentPage, lang }) => {
    const { user } = useAuth();
    const t = content[lang];
    
    const navItems = [
        { id: 'dashboard', label: t.dashboard, icon: 'space_dashboard', roles: ['admin', 'hod', 'clerk'] },
        { id: 'schedule', label: t.schedule, icon: 'calendar_month', roles: ['admin', 'hod', 'clerk'] },
        { id: 'visitors', label: t.visitors, icon: 'badge', roles: ['admin', 'hod', 'clerk'] },
        { id: 'officers', label: t.officers, icon: 'admin_panel_settings', roles: ['admin', 'hod', 'clerk'] },
        { id: 'security', label: t.security, icon: 'security', roles: ['admin'] },
        { id: 'audit', label: t.audit, icon: 'manage_history', roles: ['admin'] },
        { id: 'settings', label: t.settings, icon: 'settings', roles: ['admin'] },
    ];

    return (
        <aside className={`flex-shrink-0 bg-[var(--secondary-brand)] text-white flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-[280px]' : 'w-[80px]'} shadow-2xl z-20 border-r border-white/5 relative`}>
            
            {/* Header / Logo Area */}
            <div className={`h-16 flex items-center border-b border-white/10 transition-all duration-300 ${isOpen ? 'px-6 justify-start' : 'justify-center'}`}>
                 <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-white text-[20px]">verified_user</span>
                    </div>
                    <span className={`font-heading font-bold text-[17px] tracking-wide whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-4 hidden'}`}>
                        {t.title}
                    </span>
                 </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1.5 custom-scrollbar">
                {navItems.map(item => {
                    if (!user?.role || !item.roles.includes(user.role)) return null;

                    const isActive = currentPage === item.id;

                    return (
                        <Tooltip key={item.id} content={item.label} relationship="label" position="after" disabled={isOpen}>
                            <button
                                onClick={() => setCurrentPage(item.id)}
                                className={`w-full flex items-center h-[46px] rounded-xl transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                                    isActive 
                                    ? 'bg-gradient-to-r from-white/15 to-transparent text-white shadow-sm' 
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                } ${isOpen ? 'px-4' : 'justify-center'}`}
                            >
                                {/* Active Indicator Line */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[24px] bg-[var(--primary-400)] rounded-r-full shadow-[0_0_8px_var(--primary-400)]"></div>
                                )}
                                
                                <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${isActive ? 'fill-1 text-white' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                
                                {isOpen && (
                                    <span className={`ml-3.5 whitespace-nowrap tracking-wide text-[14px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        </Tooltip>
                    );
                })}
            </nav>

            {/* Footer / User Profile Area */}
            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
                <div className={`flex ${isOpen ? 'flex-row justify-between items-center' : 'flex-col items-center gap-4'}`}>
                     <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
                          <div className="relative flex-shrink-0">
                             <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                             <Avatar name={user?.name || 'Admin'} color="colorful" size={36} className="relative ring-2 ring-white/10 shadow-md" />
                             <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[var(--secondary-brand)] rounded-full"></div>
                          </div>
                          
                          {isOpen && (
                              <div className="overflow-hidden flex flex-col justify-center">
                                  <p className="text-[13px] font-bold text-white truncate leading-tight drop-shadow-sm">{user?.name || 'System Admin'}</p>
                                  <p className="text-[11px] text-white/60 truncate capitalize font-medium tracking-wide mt-0.5">{user?.role || 'Administrator'}</p>
                              </div>
                          )}
                     </div>

                     <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white/20"
                        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                     >
                         <span className="material-symbols-outlined text-xl transition-transform duration-300">
                            {isOpen ? 'menu_open' : 'menu'}
                         </span>
                     </button>
                </div>
            </div>
            
            {/* Custom scrollbar styles for sidebar */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </aside>
    );
};

export default AdminSidebar;