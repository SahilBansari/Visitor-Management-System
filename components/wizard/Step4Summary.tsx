import React, { useState } from 'react';
import type { Language } from '../../App';
import type { FormData } from './RegistrationWizard';
import { Checkbox, Button, Spinner } from '@fluentui/react-components';

interface Step4SummaryProps {
    lang: Language;
    formData: FormData;
    updateFormData: (field: keyof FormData, value: any) => void;
    goToStep: (step: number) => void;
}

const content = {
    en: {
        title: "Confirm Your Details",
        identityTitle: "Identity Details",
        userType: "Category",
        name: "Name",
        mobile: "Mobile",
        idType: "ID Type",
        idNumber: "ID Number",
        idProof: "ID Proof",
        visitTitle: "Visit Details",
        office: "Office",
        officer: "Officer",
        purpose: "Purpose",
        visitors: "Visitors",
        datetimeTitle: "Appointment Time",
        date: "Date",
        time: "Time",
        edit: "Edit",
        terms: "I agree to the Department rules and regulations.",
        sendPass: "Send E-Pass via SMS & WhatsApp",
        passSent: "E-Pass Delivered Successfully!",
    },
    hi: {
        title: "अपने विवरण की पुष्टि करें",
        identityTitle: "पहचान विवरण",
        userType: "श्रेणी",
        name: "नाम",
        mobile: "मोबाइल",
        idType: "आईडी प्रकार",
        idNumber: "आईडी संख्या",
        idProof: "आईडी प्रमाण",
        visitTitle: "यात्रा विवरण",
        office: "कार्यालय",
        officer: "अधिकारी",
        purpose: "उद्देश्य",
        visitors: "आगंतुक",
        datetimeTitle: "अपॉइंटमेंट का समय",
        date: "दिनांक",
        time: "समय",
        edit: "संपादित करें",
        terms: "मैं विभाग के नियमों और विनियमों से सहमत हूं।",
        sendPass: "SMS और WhatsApp द्वारा ई-पास भेजें",
        passSent: "ई-पास सफलतापूर्वक भेजा गया!",
    },
    mr: {
        title: "आपल्या तपशीलांची पुष्टी करा",
        identityTitle: "ओळख तपशील",
        userType: "श्रेणी",
        name: "नाव",
        mobile: "मोबाईल",
        idType: "आयडी प्रकार",
        idNumber: "आयडी क्रमांक",
        idProof: "आयडी पुरावा",
        visitTitle: "भेटीचे तपशील",
        office: "कार्यालय",
        officer: "अधिकारी",
        purpose: "उद्देश",
        visitors: "अभ्यागत",
        datetimeTitle: "अपॉइंटमेंटची वेळ",
        date: "तारीख",
        time: "वेळ",
        edit: "संपादित करा",
        terms: "मी विभागाच्या नियम आणि अटींशी सहमत आहे.",
        sendPass: "SMS आणि WhatsApp द्वारे ई-पास पाठवा",
        passSent: "ई-पास यशस्वीरित्या पाठवला!",
    }
};

const SummaryRow: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="flex justify-between items-center py-2 border-b border-neutral-200 dark:border-neutral-700">
        <dt className="text-sm text-neutral-600 dark:text-neutral-400">{label}</dt>
        <dd className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{value}{children}</dd>
    </div>
);

const SummarySection: React.FC<{ title: string; onEdit: () => void; children: React.ReactNode }> = ({ title, onEdit, children }) => (
    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold font-heading text-lg">{title}</h3>
            <button onClick={onEdit} className="text-sm text-secondary font-semibold hover:underline">{content.en.edit}</button>
        </div>
        <dl>{children}</dl>
    </div>
);

const Step4Summary: React.FC<Step4SummaryProps> = ({ lang, formData, updateFormData, goToStep }) => {
    const t = content[lang];
    const fullPurpose = formData.purpose === 'Other' ? formData.purposeDetails : formData.purpose;
    const [sendingPass, setSendingPass] = useState(false);
    const [passSent, setPassSent] = useState(false);

    const handleSendPass = () => {
        setSendingPass(true);
        // Simulate backend API call to Twilio/WhatsApp Business API
        setTimeout(() => {
            setSendingPass(false);
            setPassSent(true);
        }, 2000);
    };

    return (
        <div>
            <h2 className="text-2xl font-heading font-bold text-primary dark:text-white mb-8 text-center">{t.title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 flex flex-col items-center">
                    {formData.photo && <img src={formData.photo} alt="Visitor" className="w-48 h-48 object-cover rounded-lg shadow-md" />}
                    
                    {/* Instant Pass Delivery Section */}
                    <div className="mt-6 w-full max-w-[200px] flex flex-col gap-2">
                        {!passSent ? (
                            <Button 
                                appearance="outline" 
                                onClick={handleSendPass} 
                                disabled={sendingPass || !formData.mobile}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                {sendingPass ? <Spinner size="extra-tiny" /> : <span className="material-symbols-outlined text-sm">send_to_mobile</span>}
                                {sendingPass ? 'Sending...' : t.sendPass}
                            </Button>
                        ) : (
                            <div className="bg-green-100 border border-green-300 text-green-800 px-3 py-2 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {t.passSent}
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <SummarySection title={t.identityTitle} onEdit={() => goToStep(1)}>
                        <SummaryRow label={t.userType} value={formData.userType.toUpperCase()} />
                        <SummaryRow label={t.name} value={formData.fullName} />
                        <SummaryRow label={t.mobile} value={formData.mobile} />
                        {formData.userType === 'officer' && (
                            <>
                                <SummaryRow label={t.idType} value={formData.idType} />
                                <SummaryRow label={t.idNumber} value={formData.idNumber} />
                                <SummaryRow label={t.idProof} value={formData.idProof ? "Uploaded" : "Not Uploaded"} />
                            </>
                        )}
                    </SummarySection>

                    <SummarySection title={t.visitTitle} onEdit={() => goToStep(2)}>
                        <SummaryRow label={t.office} value={formData.office} />
                        <SummaryRow label={t.officer} value={formData.officer} />
                        <SummaryRow label={t.purpose} value={fullPurpose} />
                        <SummaryRow label={t.visitors} value={formData.visitorCount} />
                    </SummarySection>

                    <SummarySection title={t.datetimeTitle} onEdit={() => goToStep(3)}>
                        <SummaryRow label={t.date} value={formData.date?.toLocaleDateString(lang)} />
                        <SummaryRow label={t.time} value={formData.timeSlot} />
                    </SummarySection>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <Checkbox
                    checked={formData.agreedToTerms}
                    onChange={(e, data) => updateFormData('agreedToTerms', !!data.checked)}
                    label={t.terms}
                />
            </div>
        </div>
    );
};

export default Step4Summary;