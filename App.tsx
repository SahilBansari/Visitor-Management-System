import React, { useState } from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import type { Tenant } from './utils/mockDatabase';

// --- 1. IMPORT YOUR COMMON LANDING PAGE ---
import DepartmentSelection from './components/DepartmentSelection';

// --- 2. IMPORT THE INDEPENDENT PORTALS ---
// Make sure these paths match where you created the files
import IrrigationPortal from './pages/irrigation/IrrigationPortal';
import AgriculturePortal from './pages/agriculture/AgriculturePortal';

export type Language = 'en' | 'hi' | 'mr';

function AppContent() {
    // Shared State for the Department Selection Screen
    const [lang, setLang] = useState<Language>('en');
    
    // Initialize Tenant from LocalStorage (remembers choice on refresh)
    const [tenant, setTenant] = useState<Tenant | null>(() => {
        return (localStorage.getItem('vms_tenant') as Tenant) || null;
    });
    
    const { logout } = useAuth();

    // ACTION: User clicks a card on the Landing Page
    const handleDepartmentSelect = (selectedTenant: Tenant) => {
        localStorage.setItem('vms_tenant', selectedTenant);
        setTenant(selectedTenant);
    };

    // ACTION: User clicks "Back" or "Logout" from a Portal
    const handleSwitchDepartment = () => {
        logout(); // Logout current user to prevent cross-tenant access
        localStorage.removeItem('vms_tenant');
        setTenant(null);
    };

    // --- RENDER LOGIC (THE "LINKING" PART) ---

    // SCENARIO 1: No Department Selected -> Show Common Landing Page
    if (!tenant) {
        return (
            <DepartmentSelection 
                onSelect={handleDepartmentSelect} 
                lang={lang}          
                setLang={setLang}    
            />
        );
    }

    // SCENARIO 2: Agriculture Selected -> Show Agriculture Portal
    if (tenant === 'agriculture') {
        return <AgriculturePortal onSwitchDepartment={handleSwitchDepartment} />;
    }

    // SCENARIO 3: Irrigation (or default) Selected -> Show Irrigation Portal
    return <IrrigationPortal onSwitchDepartment={handleSwitchDepartment} />;
}

// Wrapper with Providers
export default function App() {
    return (
        <FluentProvider theme={webLightTheme}>
            <AuthProvider>
                <NotificationProvider>
                    <AppContent />
                </NotificationProvider>
            </AuthProvider>
        </FluentProvider>
    );
}