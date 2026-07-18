import React, { useState } from 'react';
import type { Language } from '../../App';
import { useAuth } from '../../contexts/AuthContext';

// Components
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';

// Content Pages
import DashboardContent from './content/DashboardContent';         
import HodDashboardContent from './content/HodDashboardContent';   
import ClerkDashboardContent from './content/ClerkDashboardContent'; 
import ScheduleContent from './content/ScheduleContent';           
import OfficersContent from './content/OfficersContent';
import VisitorsContent from './content/VisitorsContent';
import SecurityContent from './content/SecurityContent'; // Added Security Content
import AuditContent from './content/AuditContent';
import SettingsContent from './content/SettingsContent';

interface AdminLayoutProps {
    lang: Language;
    setLang: React.Dispatch<React.SetStateAction<Language>>;
    onLogout: () => void;
}

const breadcrumbContent = {
    en: {
        dashboard: 'Dashboard',
        management: 'Management',
        schedule: 'Schedule & Availability',
        directory: 'Directory',
        officers: 'Officers',
        visitors: 'Visitors',
        security: 'Security',
        system: 'System',
        audit: 'Audit Logs',
        settings: 'Settings'
    },
    hi: {
        dashboard: 'डैशबोर्ड',
        management: 'प्रबंधन',
        schedule: 'अनुसूची और उपलब्धता',
        directory: 'निर्देशिका',
        officers: 'अधिकारी',
        visitors: 'आगंतुक',
        security: 'सुरक्षा',
        system: 'सिस्टम',
        audit: 'ऑडिट लॉग',
        settings: 'सेटिंग्स'
    },
    mr: {
        dashboard: 'डॅशबोर्ड',
        management: 'व्यवस्थापन',
        schedule: 'वेळापत्रक आणि उपलब्धता',
        directory: 'निर्देशिका',
        officers: 'अधिकारी',
        visitors: 'अभ्यागत',
        security: 'सुरक्षा',
        system: 'सिस्टम',
        audit: 'ऑडिट लॉग',
        settings: 'सेटिंग्ज'
    }
};

const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const t = breadcrumbContent[props.lang];

    const breadcrumbMap: { [key: string]: string[] } = {
        dashboard: [user?.role?.toUpperCase() || 'Admin', t.dashboard],
        schedule: [t.management, t.schedule],
        officers: [t.directory, t.officers],
        visitors: [t.management, t.visitors],
        security: [t.system, t.security], // Added breadcrumb mapping
        audit: [t.system, t.audit],
        settings: [t.system, t.settings],
    };

    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard': 
                // Passed onNavigate to both HOD and Admin Dashboard for "View Calendar" functionality
                if (user?.role === 'hod') return <HodDashboardContent lang={props.lang} onNavigate={setCurrentPage} />;
                if (user?.role === 'clerk') return <ClerkDashboardContent lang={props.lang} />;
                return <DashboardContent lang={props.lang} onNavigate={setCurrentPage} />; 
            
            case 'schedule': return <ScheduleContent lang={props.lang} />;
            case 'officers': return <OfficersContent lang={props.lang} />;
            case 'visitors': return <VisitorsContent lang={props.lang} />;
            case 'security': return <SecurityContent lang={props.lang} />; // Added routing case
            case 'audit': return <AuditContent lang={props.lang} />;
            case 'settings': return <SettingsContent lang={props.lang} />;
            default:
                return <div className="p-8 text-center text-gray-500">Page component not found.</div>;
        }
    };

    return (
        <div className="flex h-screen bg-[#F3F4F6] overflow-hidden">
            <AdminSidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen} 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                lang={props.lang} 
            />
            
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader 
                    {...props} 
                    breadcrumb={breadcrumbMap[currentPage]} 
                    setCurrentPage={setCurrentPage}
                />
                
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-fadeIn">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;