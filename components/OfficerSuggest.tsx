import React, { useState, useEffect, useMemo } from 'react';
import { Combobox, Option, Label, Spinner } from '@fluentui/react-components';
import type { Language } from '../App';

interface OfficerSuggestProps {
    label: string;
    purpose: string;
    value: string;
    onSelect: (officer: string) => void;
    lang?: Language; 
}

const content = {
    en: {
        placeholder: "Select or type officer's name",
        loading: "Loading suggestions...",
        noMatch: "No close match found."
    },
    hi: {
        placeholder: "अधिकारी का नाम चुनें या टाइप करें",
        loading: "सुझाव लोड हो रहे हैं...",
        noMatch: "कोई करीबी मिलान नहीं मिला।"
    },
    mr: {
        placeholder: "अधिकार्याचे नाव निवडा किंवा टाईप करा",
        loading: "सुचवणी लोड होत आहेत...",
        noMatch: "कोणताही जवळचा सामना आढळला नाही."
    }
}

// Restored officer list
const allOfficers = ["Shri Narendra Modi", "Shri Amit Shah", "Smt. Nirmala Sitharaman", "Shri Rajnath Singh", "Dr. S. Jaishankar"];

const fetchOfficerSuggestions = async (purpose: string): Promise<{officer: string, confidence: number}[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (!purpose) {
                resolve([]);
                return;
            }
            const suggestions = allOfficers
                .map(officer => ({ officer, confidence: Math.random() }))
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 3);
            resolve(suggestions);
        }, 800);
    });
};

const OfficerSuggest: React.FC<OfficerSuggestProps> = ({ label, purpose, value, onSelect, lang = 'en' }) => {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<{officer: string, confidence: number}[]>([]);
    const t = content[lang];
    
    const debouncedFetch = useMemo(() => {
        let timer: ReturnType<typeof setTimeout>;
        return (p: string) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                setLoading(true);
                fetchOfficerSuggestions(p).then(results => {
                    setSuggestions(results);
                    setLoading(false);
                });
            }, 400);
        };
    }, []);
    
    useEffect(() => {
        if (purpose) {
            debouncedFetch(purpose);
        }
    }, [purpose, debouncedFetch]);

    return (
        <div className="flex flex-col w-full group">
            {/* UPDATED: Label styling to match TextInput */}
            <Label size="small" className="text-gray-700 mb-1.5 font-semibold tracking-wide">{label}</Label>
            
            {/* UPDATED: Combobox styling to match TextInput (Solid White, Bordered) */}
            <Combobox
                value={value}
                onOptionSelect={(_, data) => onSelect(data.optionText || '')}
                placeholder={t.placeholder}
                appearance="outline"
                className="[&>.fui-Combobox-input]:!bg-white [&>.fui-Combobox-input]:!h-11 [&>.fui-Combobox-button]:!bg-white [&>.fui-Combobox-button]:!h-11 w-full !border-neutral-300 shadow-sm rounded-md focus-within:!border-[#1B7E6C] focus-within:!ring-2 focus-within:!ring-[#1B7E6C]/20"
            >
                {loading && <Option key="loading" disabled><Spinner size="tiny" /> {t.loading}</Option>}

                {!loading && suggestions.length > 0 && suggestions.map(s => (
                     <Option key={s.officer} text={s.officer}>
                        <div className="flex justify-between items-center">
                            <span>{s.officer}</span>
                            {/* Optional: Show confidence score or role if needed */}
                        </div>
                    </Option>
                ))}

                {!loading && suggestions.length === 0 && purpose && (
                    <Option key="no-match" disabled text={t.noMatch}>{t.noMatch}</Option>
                )}
                
                {/* Show all officers if no specific suggestions or just as fallback list */}
                {!loading && allOfficers.map(o => <Option key={o}>{o}</Option>)}
            </Combobox>
        </div>
    );
};

export default OfficerSuggest;