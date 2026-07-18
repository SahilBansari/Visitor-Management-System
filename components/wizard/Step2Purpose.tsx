import React, { useState, useEffect } from 'react';
import type { Language } from '../../App';
import type { FormData } from './RegistrationWizard';
import { getOfficeTree, getOfficers, type OfficeNode, type Officer, type Tenant } from '../../utils/mockDatabase';
import { API_ENDPOINTS } from '../../services/api';

interface Purpose {
    id: number;
    name: string;
}

interface Office {
    id: number;
    name: string;
    address?: string;
}

interface DataFetchState {
    loading: boolean;
    error: string | null;
    purposes: Purpose[];
    officers: Officer[];
    offices: Office[];
}

interface Step2PurposeProps {
    lang: Language;
    formData: FormData;
    updateFormData: (field: keyof FormData, value: any) => void;
    tenant: Tenant; // Added tenant prop
}

const content = {
    // ... (content object remains unchanged)
    en: {
        title: 'Purpose of Visit',
        officeLabel: 'Select Office / Ministry',
        officerLabel: 'Select Officer (Optional)',
        purposeLabel: 'Purpose Category',
        detailsLabel: 'Specific Details',
        visitorCountLabel: 'Number of Visitors',
        selectOffice: 'Select an Office...',
        selectOfficer: 'Select an Officer...',
        selectPurpose: 'Select a Purpose...',
        loading: 'Loading directory...'
    },
    hi: {
        title: 'यात्रा का उद्देश्य',
        officeLabel: 'कार्यालय / मंत्रालय चुनें',
        officerLabel: 'अधिकारी चुनें (वैकल्पिक)',
        purposeLabel: 'उद्देश्य श्रेणी',
        detailsLabel: 'विशिष्ट विवरण',
        visitorCountLabel: 'आगंतुकों की संख्या',
        selectOffice: 'एक कार्यालय चुनें...',
        selectOfficer: 'एक अधिकारी चुनें...',
        selectPurpose: 'एक उद्देश्य चुनें...',
        loading: 'निर्देशिका लोड हो रही है...'
    },
    mr: {
        title: 'भेटीचे कारण',
        officeLabel: 'कार्यालय / मंत्रालय निवडा',
        officerLabel: 'अधिकारी निवडा (पर्यायी)',
        purposeLabel: 'उद्देश्य श्रेणी',
        detailsLabel: 'विशिष्ट तपशील',
        visitorCountLabel: 'अभ्यागतांची संख्या',
        selectOffice: 'कार्यालय निवडा...',
        selectOfficer: 'अधिकारी निवडा...',
        selectPurpose: 'एक उद्देश्य निवडा...',
        loading: 'निर्देशिका लोड होत आहे...'
    }
};

const Step2Purpose: React.FC<Step2PurposeProps> = ({ lang, formData, updateFormData, tenant }) => {
    const t = content[lang];
    const [dataFetchState, setDataFetchState] = useState<DataFetchState>({
        loading: true,
        error: null,
        purposes: [],
        officers: [],
        offices: []
    });

    // Fallback data in case API fails
    const FALLBACK_PURPOSES: Purpose[] = [
        { id: 1, name: 'Official Work' },
        { id: 2, name: 'Meeting' },
        { id: 3, name: 'Inquiry' },
        { id: 4, name: 'Vendor/Contractor' },
        { id: 5, name: 'Personal' },
        { id: 6, name: 'Other' },
    ];

    const fetchData = async () => {
        setDataFetchState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            console.log('📡 Fetching data from:', {
                offices: API_ENDPOINTS.GET_OFFICES,
                purposes: API_ENDPOINTS.GET_PURPOSES,
                officers: API_ENDPOINTS.GET_OFFICERS
            });

            // Fetch Offices from API
            let offices: Office[] = [];
            try {
                const officesResponse = await fetch(API_ENDPOINTS.GET_OFFICES, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!officesResponse.ok) {
                    throw new Error(`Offices API returned ${officesResponse.status}`);
                }

                offices = await officesResponse.json();
                console.log(`✅ Fetched ${offices.length} offices`);
            } catch (officesError) {
                console.warn('⚠️ Failed to fetch offices:', officesError);
                // Use local mock offices as fallback
                const officeData = await getOfficeTree(tenant);
                offices = officeData.map(office => ({
                    id: office.name,
                    name: office.name,
                    address: ''
                }));
                console.log(`📦 Using ${offices.length} fallback offices`);
            }

            // Fetch Officers from API
            let officers: Officer[] = [];
            try {
                const officersResponse = await fetch(API_ENDPOINTS.GET_OFFICERS, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!officersResponse.ok) {
                    throw new Error(`Officers API returned ${officersResponse.status}`);
                }

                officers = await officersResponse.json();
                console.log(`✅ Fetched ${officers.length} officers`);
            } catch (officersError) {
                console.warn('⚠️ Failed to fetch officers:', officersError);
                // Use local mock officers as fallback
                officers = await getOfficers(tenant);
                console.log(`📦 Using ${officers.length} fallback officers`);
            }

            // Fetch Purposes from API
            let purposes: Purpose[] = [...FALLBACK_PURPOSES];
            try {
                const purposesResponse = await fetch(API_ENDPOINTS.GET_PURPOSES, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!purposesResponse.ok) {
                    throw new Error(`Purposes API returned ${purposesResponse.status}`);
                }

                const purposesData = await purposesResponse.json();
                if (Array.isArray(purposesData) && purposesData.length > 0) {
                    purposes = purposesData;
                    console.log(`✅ Fetched ${purposes.length} purposes from API`);
                } else {
                    console.warn('⚠️ API returned empty purposes, using fallback');
                }
            } catch (purposesError) {
                console.warn('⚠️ Failed to fetch purposes:', purposesError);
                console.log('📦 Using fallback purposes:', FALLBACK_PURPOSES.length);
            }

            setDataFetchState({
                loading: false,
                error: null,
                purposes,
                officers,
                offices
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('❌ Error fetching data:', errorMessage);

            // Use all fallback data
            const officersData = await getOfficers(tenant);
            const officeData = await getOfficeTree(tenant);
            setDataFetchState({
                loading: false,
                error: `Failed to load some data. Using cached data. (${errorMessage})`,
                purposes: FALLBACK_PURPOSES,
                officers: officersData,
                offices: officeData.map(office => ({
                    id: office.name,
                    name: office.name,
                    address: ''
                }))
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [tenant]);

    return (
        <div className="animate-fadeIn space-y-6">
            <h2 className="text-2xl font-heading font-bold text-[#064E3B] mb-6">{t.title}</h2>

            {/* Error Alert */}
            {dataFetchState.error && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-800">Note</p>
                            <p className="text-sm text-yellow-700 mt-1">{dataFetchState.error}</p>
                            <button
                                onClick={fetchData}
                                className="mt-2 text-sm font-semibold text-yellow-800 hover:text-yellow-900 underline"
                            >
                                🔄 Try again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Indicator */}
            {dataFetchState.loading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        <span className="inline-block animate-spin">⏳</span>
                        <p className="text-sm text-blue-800">{t.loading}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Office Selection */}
                <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.officeLabel}</label>
                    <select
                        value={formData.office}
                        onChange={(e) => updateFormData('office', e.target.value)}
                        disabled={dataFetchState.loading}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <option value="">{t.selectOffice}</option>
                        {dataFetchState.offices.length === 0 ? (
                            <option disabled>No offices available</option>
                        ) : (
                            dataFetchState.offices.map(office => (
                                <option key={office.id} value={office.name}>{office.name}</option>
                            ))
                        )}
                    </select>
                </div>

                {/* Officer Selection */}
                <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.officerLabel}</label>
                    <select
                        value={formData.officer}
                        onChange={(e) => updateFormData('officer', e.target.value)}
                        disabled={dataFetchState.loading}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <option value="">{t.selectOfficer}</option>
                        {dataFetchState.officers.length === 0 ? (
                            <option disabled>No officers available</option>
                        ) : (
                            dataFetchState.officers.map(opt => (
                                <option key={opt.id} value={opt.name}>{opt.name} ({opt.rank})</option>
                            ))
                        )}
                    </select>
                </div>

                {/* Purpose Category */}
                <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.purposeLabel}</label>
                    <select
                        value={formData.purpose}
                        onChange={(e) => updateFormData('purpose', e.target.value)}
                        disabled={dataFetchState.loading}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <option value="">Select a Purpose...</option>
                        {dataFetchState.purposes.length === 0 ? (
                            <option disabled>No purposes available</option>
                        ) : (
                            dataFetchState.purposes.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))
                        )}
                    </select>
                </div>

                {/* Visitor Count */}
                <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.visitorCountLabel}</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.visitorCount}
                        onChange={(e) => updateFormData('visitorCount', e.target.value)}
                        disabled={dataFetchState.loading}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Specific Details */}
            <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.detailsLabel}</label>
                <textarea
                    value={formData.purposeDetails}
                    onChange={(e) => updateFormData('purposeDetails', e.target.value)}
                    disabled={dataFetchState.loading}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder={lang === 'hi' ? "उदाहरण: 'फाइल संख्या 123 जमा करने के लिए...'" : "e.g. 'To submit file number 123...'"}
                />
            </div>

            {/* Data Source Indicator */}
            <div className="text-xs text-gray-500 flex items-center gap-2">
                {dataFetchState.offices.length > 0 && !dataFetchState.error ? (
                    <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>✓ Using live database</span>
                    </>
                ) : (
                    <>
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span>Using cached data</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default Step2Purpose;