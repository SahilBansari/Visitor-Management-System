import React from 'react';
import type { Language } from '../App';

interface FooterProps {
    lang: Language;
}

const content = {
    en: {
        nicCompliance: 'NIC Compliant',
        grievance: 'Grievance Redressal',
        sitemap: 'Sitemap',
        copyright: `© ${new Date().getFullYear()} National Informatics Centre. All Rights Reserved.`,
    },
    hi: {
        nicCompliance: 'एनआईसी अनुपालक',
        grievance: 'शिकायत निवारण',
        sitemap: 'साइटमैप',
        copyright: `© ${new Date().getFullYear()} राष्ट्रीय सूचना विज्ञान केंद्र। सर्वाधिकार सुरक्षित।`,
    },
    mr: {
        nicCompliance: 'एनआयसी अनुरूप',
        grievance: 'तक्रार निवारण',
        sitemap: 'साइटमॅप',
        copyright: `© ${new Date().getFullYear()} राष्ट्रीय सूचना विज्ञान केंद्र. सर्व हक्क राखीव.`,
    },
};

const NicLogo = () => (
    <svg className="w-24 h-auto" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="40" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" className="fill-neutral-600 dark:fill-neutral-400">
        NIC
      </text>
      <path d="M70 15 L70 45 M75 30 L95 30 M85 20 L85 40" strokeWidth="2" className="stroke-primary dark:stroke-white"/>
      <text x="110" y="40" fontFamily="Arial, sans-serif" fontSize="16" className="fill-neutral-600 dark:fill-neutral-400">
        Gov. of India
      </text>
    </svg>
);

const Footer: React.FC<FooterProps> = ({ lang }) => {
    return (
        // UPDATED: Glass effect instead of solid gray, blending with the new background
        <footer className="bg-white/40 dark:bg-black/40 backdrop-blur-md border-t border-white/20 dark:border-white/5">
            <div className="container mx-auto px-6 md:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <NicLogo />
                        <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                            {content[lang].nicCompliance}
                        </span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                        <a href="#" className="hover:text-primary dark:hover:text-secondary">{content[lang].grievance}</a>
                        <a href="#" className="hover:text-primary dark:hover:text-secondary">{content[lang].sitemap}</a>
                    </div>
                </div>
                <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-8 border-t border-neutral-200/50 dark:border-neutral-700/50 pt-6">
                    <p>{content[lang].copyright}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;