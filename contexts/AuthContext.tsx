import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Tenant } from '../utils/mockDatabase';

// --- Types ---
export type UserRole = 'admin' | 'hod' | 'clerk';

export interface User {
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    tenant: Tenant;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string, tenant: Tenant) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Mock Users ---
const MOCK_USERS: Record<string, User & { password: string }> = {
    // --- Irrigation Users ---
    'admin@nic.in': { 
        name: 'System Admin (Irrigation)', 
        email: 'admin@nic.in', 
        role: 'admin', 
        password: 'admin',
        tenant: 'irrigation'
    },
    'hod@nic.in': { 
        name: 'Chief Engineer', 
        email: 'hod@nic.in', 
        role: 'hod', 
        department: 'Irrigation HQ',
        password: 'hod',
        tenant: 'irrigation'
    },
    'clerk@nic.in': { 
        name: 'Front Desk Reception', 
        email: 'clerk@nic.in', 
        role: 'clerk', 
        department: 'Reception',
        password: 'clerk',
        tenant: 'irrigation'
    },
    
    // --- Agriculture Users ---
    'admin@agri.nic.in': {
        name: 'System Admin (Agri)',
        email: 'admin@agri.nic.in',
        role: 'admin',
        password: 'admin',
        tenant: 'agriculture'
    },
    'hod@agri.nic.in': {
        name: 'Director (Crops)',
        email: 'hod@agri.nic.in',
        role: 'hod',
        department: 'Agriculture HQ',
        password: 'hod',
        tenant: 'agriculture'
    },
    'clerk@agri.nic.in': {
        name: 'Agri Reception Desk',
        email: 'clerk@agri.nic.in',
        role: 'clerk',
        department: 'Reception',
        password: 'clerk',
        tenant: 'agriculture'
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const login = (email: string, password: string, currentTenant: Tenant): boolean => {
        const foundUser = MOCK_USERS[email];
        
        // 1. Check if user exists and password matches
        if (foundUser && foundUser.password === password) {
            
            // 2. STRICT CHECK: Ensure user belongs to the current portal tenant
            if (foundUser.tenant !== currentTenant) {
                console.error(`Security Alert: User ${email} (Tenant: ${foundUser.tenant}) attempted to access ${currentTenant} portal.`);
                return false;
            }

            setIsAuthenticated(true);
            setUser({
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role,
                department: foundUser.department,
                tenant: foundUser.tenant
            });
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};