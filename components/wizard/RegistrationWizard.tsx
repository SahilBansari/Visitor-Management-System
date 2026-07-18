import React, { useState, useEffect } from 'react';
import type { Language } from '../../App';
import Stepper from './Stepper';
import Step1Identity from './Step1Identity';
import Step2Purpose from './Step2Purpose';
import Step3DateTime from './Step3DateTime';
import Step4Summary from './Step4Summary';
import Step5Payment from './Step5Payment';
import type { Tenant } from '../../utils/mockDatabase'; // Import Tenant

interface RegistrationWizardProps {
    lang: Language;
    onBackToHome: () => void;
    initialData?: Partial<FormData> | null;
    tenant: Tenant; // Added tenant prop
}

// ... (Content object remains unchanged) ...
const content = {
    en: {
        backToHome: 'Cancel & Return Home',
        back: 'Back',
        next: 'Continue',
        submit: 'Confirm Booking',
        validationError: 'Please complete all required fields.',
        steps: [
            { id: 1, name: 'Identity' },
            { id: 2, name: 'Purpose' },
            { id: 3, name: 'Date/Time' },
            { id: 4, name: 'Summary' },
            { id: 5, name: 'Done' }
        ]
    },
    hi: {
        backToHome: 'रद्द करें और घर लौटें',
        back: 'पीछे',
        next: 'जारी रखें',
        submit: 'बुकिंग की पुष्टि करें',
        validationError: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
        steps: [
            { id: 1, name: 'पहचान' },
            { id: 2, name: 'उद्देश्य' },
            { id: 3, name: 'दिनांक' },
            { id: 4, name: 'सारांश' },
            { id: 5, name: 'पूर्ण' }
        ]
    },
    mr: {
        backToHome: 'रद्द करा आणि परत जा',
        back: 'मागे',
        next: 'पुढे',
        submit: 'बुकिंगची पुष्टी करा',
        validationError: 'कृपया सर्व आवश्यक रकाने भरा.',
        steps: [
            { id: 1, name: 'ओळख' },
            { id: 2, name: 'उद्देश' },
            { id: 3, name: 'दिनांक' },
            { id: 4, name: 'सारांश' },
            { id: 5, name: 'पूर्ण' }
        ]
    }
};


export type UserType = 'visitor' | 'vendor' | 'officer';

export interface FormData {
    userType: UserType;
    fullName: string;
    mobile: string;
    email: string;
    otpVerified: boolean;
    idType: string;
    idNumber: string;
    idProof: File | null;
    idProofPath?: string;  // Backend path for uploaded ID proof
    photo: string | null;
    photoPath?: string;    // Backend path for uploaded photo
    office: string;
    officer: string;
    purpose: string;
    purposeDetails: string;
    visitorCount: number | string;
    date: Date | null;
    timeSlot: string;
    agreedToTerms: boolean;
    tenant: Tenant; // Added tenant to form data
}

const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ lang, onBackToHome, initialData, tenant }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        userType: 'visitor',
        fullName: '',
        mobile: '',
        email: '',
        otpVerified: false,
        idType: 'aadhaar',
        idNumber: '',
        idProof: null,
        photo: null,
        office: '',
        officer: '',
        purpose: 'Inquiry',
        purposeDetails: '',
        visitorCount: 1,
        date: new Date(),
        timeSlot: '',
        agreedToTerms: false,
        tenant: tenant // Initialize with passed tenant
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);
    
    const totalSteps = 5;
    const t = content[lang];

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ... (Validate steps logic remains unchanged) ...
    const validateStep = (step: number): boolean => {
        // ... (Keep existing validation logic)
         const isHi = lang === 'hi';
        const isMr = lang === 'mr';
        
        switch (step) {
            case 1: 
                if (!formData.fullName?.trim()) {
                    alert(isMr ? "कृपया तुमचे पूर्ण नाव प्रविष्ट करा." : (isHi ? "कृपया अपना पूरा नाम दर्ज करें।" : "Please enter your full name."));
                    return false;
                }
                if (!formData.mobile?.trim()) {
                    alert(isMr ? "कृपया तुमचा मोबाईल नंबर प्रविष्ट करा." : (isHi ? "कृपया अपना मोबाइल नंबर दर्ज करें।" : "Please enter your mobile number."));
                    return false;
                }
                if (!formData.email?.trim()) {
                     alert(isMr ? "कृपया तुमचा ईमेल आयडी प्रविष्ट करा." : (isHi ? "कृपया अपना ईमेल आईडी दर्ज करें।" : "Please enter your email ID."));
                     return false;
                }
                if (!formData.otpVerified) {
                    alert(isMr ? "कृपया ओटीपीद्वारे तुमचा मोबाईल नंबर सत्यापित करा." : (isHi ? "कृपया ओटीपी के साथ अपने मोबाइल नंबर को सत्यापित करें।" : "Please verify your mobile number with OTP."));
                    return false;
                }
                if (!formData.idNumber?.trim()) {
                    alert(isMr ? "कृपया तुमचा आयडी क्रमांक प्रविष्ट करा." : (isHi ? "कृपया अपनी आईडी संख्या दर्ज करें।" : "Please enter your ID number."));
                    return false;
                }
                if (!formData.idProof) {
                    alert(isMr ? "कृपया तुमचा आयडी पुरावा अपलोड करा." : (isHi ? "कृपया अपना आईडी प्रमाण अपलोड करें।" : "Please upload your ID proof."));
                    return false;
                }
                return true;
            case 2:
                if (!formData.office?.trim()) {
                    alert(isMr ? "कृपया कार्यालय/मंत्रालय निवडा." : (isHi ? "कृपया कार्यालय/मंत्रालय का चयन करें।" : "Please select the office/ministry."));
                    return false;
                }
                if (!formData.officer?.trim()) {
                    alert(isMr ? "कृपया भेटणाऱ्या अधिकाऱ्याचे नाव निर्दिष्ट करा." : (isHi ? "कृपया मिलने वाले अधिकारी का उल्लेख करें।" : "Please specify the officer to meet."));
                    return false;
                }
                if (!formData.purpose?.trim()) {
                    alert(isMr ? "कृपया उद्देश निवडा." : (isHi ? "कृपया एक उद्देश्य चुनें।" : "Please select a purpose."));
                    return false;
                }
                if (formData.purpose === 'Other' && !formData.purposeDetails?.trim()) {
                    alert(isMr ? "कृपया तुमच्या उद्देशाचा तपशील द्या." : (isHi ? "कृपया अपने उद्देश्य का विवरण दें।" : "Please specify your purpose details."));
                    return false;
                }
                const vCount = Number(formData.visitorCount);
                if (!formData.visitorCount || isNaN(vCount) || vCount < 1 || vCount > 10) {
                     alert(isMr ? "कृपया अभ्यागतांची वैध संख्या प्रविष्ट करा (1-10)." : (isHi ? "कृपया आगंतुकों की एक मान्य संख्या दर्ज करें (1-10)।" : "Please enter a valid number of visitors (1-10)."));
                     return false;
                }
                return true;
            case 3:
                if (!formData.date) {
                    alert(isMr ? "कृपया तारीख निवडा." : (isHi ? "कृपया एक तारीख चुनें।" : "Please select a date."));
                    return false;
                }
                if (!formData.timeSlot?.trim()) {
                    alert(isMr ? "कृपया वेळ निवडा." : (isHi ? "कृपया समय स्लॉट चुनें।" : "Please select a time slot."));
                    return false;
                }
                return true;
            case 4:
                if (!formData.agreedToTerms) {
                    alert(isMr ? "पुढे जाण्यासाठी तुम्हाला अटी मान्य कराव्या लागतील." : (isHi ? "आगे बढ़ने के लिए आपको शर्तों से सहमत होना होगा।" : "You must agree to the terms to proceed."));
                    return false;
                }
                return true;
            default:
                return true;
        }
    };
    
    const goToStep = (step: number) => {
        if (step > currentStep && !validateStep(currentStep)) return;
        if (step >= 1 && step <= totalSteps) setCurrentStep(step);
    };

    const nextStep = () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };
    
    const renderStep = () => {
        switch(currentStep) {
            case 1: return <Step1Identity lang={lang} formData={formData} updateFormData={updateFormData} />;
            case 2: return <Step2Purpose lang={lang} formData={formData} updateFormData={updateFormData} tenant={tenant} />; // Pass tenant
            case 3: return <Step3DateTime lang={lang} formData={formData} updateFormData={updateFormData} />;
            case 4: return <Step4Summary lang={lang} formData={formData} updateFormData={updateFormData} goToStep={goToStep} />;
            case 5: return <Step5Payment lang={lang} formData={formData} onFinish={onBackToHome} />;
            default: return null;
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl">
            {/* Header Navigation */}
            {currentStep < 5 &&
                <div className="mb-8 flex items-center justify-between">
                    <button onClick={onBackToHome} className="flex items-center text-gray-500 hover:text-[#059669] font-medium transition-colors text-sm px-3 py-2 rounded-lg hover:bg-white/50">
                        <span className="material-symbols-outlined mr-2 text-lg">arrow_back</span>
                        {t.backToHome}
                    </button>
                    <div className="text-sm font-semibold text-[#065F46] bg-[#ECFDF5] px-4 py-1.5 rounded-full border border-[#D1FAE5]">
                        Step {currentStep} of 5
                    </div>
                </div>
            }

            {/* Stepper Wrapper */}
            <div className="mb-8">
                 <Stepper steps={t.steps} currentStep={currentStep} />
            </div>
            
            {/* Main Card */}
            <div className={`transition-all duration-500 ${currentStep < 5 ? 'glass-panel rounded-2xl p-6 md:p-10 shadow-2xl shadow-emerald-900/5 min-h-[400px]' : ''}`}>
                {renderStep()}
            </div>

            {/* Footer Actions */}
            {currentStep < 5 &&
                <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200/50">
                    <div>
                        {currentStep > 1 && (
                            <button 
                                onClick={prevStep} 
                                className="group flex items-center gap-2 px-6 py-3 rounded-xl text-[#065F46] font-semibold hover:bg-[#ECFDF5] transition-all"
                            >
                                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                {t.back}
                            </button>
                        )}
                    </div>
                    
                     {currentStep < totalSteps - 1 ? (
                        <button 
                            onClick={nextStep} 
                            className="bg-[#059669] hover:bg-[#047857] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-600/20 transform transition hover:scale-[1.02] flex items-center gap-2"
                        >
                            {t.next}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    ) : (
                         <button 
                            onClick={nextStep} 
                            disabled={currentStep === 4 && !formData.agreedToTerms} 
                            className="bg-[#064E3B] hover:bg-[#065F46] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-900/20 transform transition hover:scale-[1.02] disabled:opacity-50 disabled:transform-none disabled:shadow-none flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            {t.submit}
                        </button>
                    )}
                </div>
            }
        </div>
    );
};

export default RegistrationWizard;