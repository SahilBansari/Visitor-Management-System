import React from 'react';
import type { Language } from '../App';

interface StepCardProps {
    icon: string;
    title: string;
    description: string;
    stepNumber: number;
}

const StepCard: React.FC<StepCardProps> = ({ icon, title, description, stepNumber }) => (
    // UPDATED: Glass Panel Card
    <div className="glass-panel relative p-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <div className="absolute top-4 left-4 w-10 h-10 bg-primary/10 text-primary dark:text-white rounded-full flex items-center justify-center font-bold font-heading">
            {stepNumber}
        </div>
        <div className="text-center">
            <div className="flex justify-center items-center mb-4">
                <span className="material-symbols-outlined text-5xl text-secondary">{icon}</span>
            </div>
            <h3 className="font-heading text-2xl font-bold text-primary dark:text-white mb-2">{title}</h3>
            <p className="text-neutral-600 dark:text-neutral-300">{description}</p>
        </div>
    </div>
);


interface HowItWorksProps {
    lang: Language;
}

const content = {
    en: {
        title: "Simple & Secure Process",
        steps: [
            { icon: 'app_registration', title: 'Pre-Register', description: 'Book your appointment online from anywhere, anytime.' },
            { icon: 'qr_code_2', title: 'Get Pass', description: 'Receive a secure QR code pass on your mobile and email.' },
            { icon: 'meeting_room', title: 'Walk-in', description: 'Scan your pass at the gate for a seamless, quick entry.' }
        ]
    },
    hi: {
        title: "सरल और सुरक्षित प्रक्रिया",
        steps: [
            { icon: 'app_registration', title: 'पूर्व-पंजीकरण करें', description: 'कहीं से भी, कभी भी अपना अपॉइंटमेंट ऑनलाइन बुक करें।' },
            { icon: 'qr_code_2', title: 'पास प्राप्त करें', description: 'अपने मोबाइल और ईमेल पर एक सुरक्षित क्यूआर कोड पास प्राप्त करें।' },
            { icon: 'meeting_room', title: 'प्रवेश करें', description: 'निर्बाध, त्वरित प्रवेश के लिए गेट पर अपना पास स्कैन करें।' }
        ]
    },
    mr: {
        title: "सोपी आणि सुरक्षित प्रक्रिया",
        steps: [
            { icon: 'app_registration', title: 'पूर्व-नोंदणी करा', description: 'कुठूनही, कधीही आपली अपॉइंटमेंट ऑनलाइन बुक करा.' },
            { icon: 'qr_code_2', title: 'पास मिळवा', description: 'आपल्या मोबाईल आणि ईमेलवर सुरक्षित क्यूआर कोड पास प्राप्त करा.' },
            { icon: 'meeting_room', title: 'प्रवेश करा', description: 'जलद प्रवेशासाठी गेटवर आपला पास स्कॅन करा.' }
        ]
    }
};

const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
    return (
        // UPDATED: Transparent background
        <section className="py-20 bg-transparent">
            <div className="container mx-auto px-6 md:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-100">
                        {content[lang].title}
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {content[lang].steps.map((step, index) => (
                        <StepCard key={index} stepNumber={index + 1} {...step} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;