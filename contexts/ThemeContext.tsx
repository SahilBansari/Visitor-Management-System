import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { Tenant } from '../utils/mockDatabase';

// Define the shape of our color theme
interface ThemeColors {
  primary: string;      // Main brand color (buttons, headers)
  secondary: string;    // Accent color (icons, highlights)
  background: string;   // Subtle background (cards, sections)
  text: string;         // Headings text
  border: string;       // Borders
  light: string;        // Very light shade for backgrounds
  hover: string;        // Hover states
  chartMain: string;    // Hex code for charts
}

interface ThemeContextType {
  tenant: Tenant | null;
  themeColors: ThemeColors;
}

// Default/Fallback theme
const defaultColors: ThemeColors = {
  primary: 'bg-slate-800',
  secondary: 'text-slate-600',
  background: 'bg-slate-50',
  text: 'text-slate-800',
  border: 'border-slate-200',
  light: 'bg-slate-50',
  hover: 'hover:bg-slate-700',
  chartMain: '#1e293b'
};

const ThemeContext = createContext<ThemeContextType>({ tenant: null, themeColors: defaultColors });

interface ThemeProviderProps {
  children: React.ReactNode;
  tenant: Tenant | null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, tenant }) => {
  
  // Effect: Apply the theme to the root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (tenant) {
      root.setAttribute('data-theme', tenant);
    } else {
      root.removeAttribute('data-theme');
    }
  }, [tenant]);

  // Define the themes
  const themeColors = useMemo((): ThemeColors => {
    if (tenant === 'agriculture') {
      return {
        primary: 'bg-green-700',
        secondary: 'text-amber-600',
        background: 'bg-stone-50', // Earthy tone
        text: 'text-green-900',
        border: 'border-green-200',
        light: 'bg-green-50',
        hover: 'hover:bg-green-800',
        chartMain: '#15803d' // green-700 hex
      };
    } else {
      // Default to Irrigation (Blue/Cyan)
      return {
        primary: 'bg-cyan-700',
        secondary: 'text-blue-600',
        background: 'bg-slate-50', // Water/Cool tone
        text: 'text-cyan-900',
        border: 'border-cyan-200',
        light: 'bg-cyan-50',
        hover: 'hover:bg-cyan-800',
        chartMain: '#0e7490' // cyan-700 hex
      };
    }
  }, [tenant]);

  return (
    <ThemeContext.Provider value={{ tenant, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);