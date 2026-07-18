import React, { useState } from 'react';
import type { Language } from '../../../App';
import { 
  TabList, 
  Tab, 
  Switch, 
  Button, 
  Input, 
  Dropdown, 
  Option,
  Divider,
  Label,
  Text,
  Badge,
  Avatar,
  SelectTabData,
  Spinner
} from '@fluentui/react-components';

interface SettingsContentProps {
    lang: Language;
}

const content = {
    en: {
        title: 'System Configuration',
        tabs: { 
            general: 'General', 
            security: 'Security & Privacy', 
            notify: 'Notifications', 
            integrations: 'Integrations',
            backup: 'Data & Backup' 
        },
        general: {
            identity: 'Organization Identity',
            orgName: 'Organization Name',
            bldgCode: 'Building / Site Code',
            timezone: 'System Timezone',
            locale: 'Default Locale',
            policies: 'Visitor Policies',
            allowWalkins: 'Allow Walk-in Registrations',
            allowWalkinsDesc: 'Enable self-service kiosks at the gate for visitors without prior appointments.',
            requireApproval: 'Require Host Approval',
            requireApprovalDesc: 'All walk-in visitors must be digitally approved by the host before pass issuance.'
        },
        security: {
            access: 'Access Control',
            mfa: 'Enforce MFA for Admins',
            mfaDesc: 'Require Multi-Factor Authentication for all administrative accounts.',
            session: 'Session Timeout (Minutes)',
            retention: 'Data Retention Policy',
            retentionDesc: 'Automatically anonymize or delete visitor logs after a specific period.',
            gdpr: 'GDPR / DPDP Compliance Mode',
            gdprDesc: 'Mask personally identifiable information (PII) in standard reports.'
        },
        notify: {
            channels: 'Notification Channels',
            email: 'Email Gateways',
            sms: 'SMS / WhatsApp Gateways',
            status: { connected: 'Connected', disconnected: 'Disconnected', error: 'Configuration Error' },
            events: 'Trigger Events',
            notifyHostCheckin: 'Notify Host on Check-in',
            notifyHostOverstay: 'Alert Security on Overstay',
            notifyVisitorWelcome: 'Send Digital Pass to Visitor'
        },
        actions: {
            save: 'Save Configuration',
            discard: 'Discard Changes',
            saving: 'Saving...'
        }
    },
    hi: {
        title: 'सिस्टम कॉन्फ़िगरेशन',
        tabs: { 
            general: 'सामान्य', 
            security: 'सुरक्षा और गोपनीयता', 
            notify: 'सूचनाएं', 
            integrations: 'एकीकरण',
            backup: 'डेटा और बैकअप' 
        },
        general: {
            identity: 'संगठन पहचान',
            orgName: 'संगठन का नाम',
            bldgCode: 'भवन / साइट कोड',
            timezone: 'सिस्टम समय क्षेत्र',
            locale: 'डिफ़ॉल्ट लोकेल',
            policies: 'आगंतुक नीतियां',
            allowWalkins: 'वॉक-इन पंजीकरण की अनुमति दें',
            allowWalkinsDesc: 'बिना पूर्व नियुक्ति के आगंतुकों के लिए गेट पर स्वयं-सेवा कियोस्क सक्षम करें।',
            requireApproval: 'मेजबान अनुमोदन की आवश्यकता है',
            requireApprovalDesc: 'पास जारी करने से पहले सभी वॉक-इन आगंतुकों को मेजबान द्वारा डिजिटल रूप से अनुमोदित किया जाना चाहिए।'
        },
        security: {
            access: 'पहुंच नियंत्रण',
            mfa: 'एडमिन के लिए MFA लागू करें',
            mfaDesc: 'सभी प्रशासनिक खातों के लिए मल्टी-फैक्टर प्रमाणीकरण की आवश्यकता है।',
            session: 'सत्र समाप्ति (मिनट)',
            retention: 'डेटा प्रतिधारण नीति',
            retentionDesc: 'एक विशिष्ट अवधि के बाद आगंतुक लॉग को स्वचालित रूप से अज्ञात या हटा दें।',
            gdpr: 'GDPR / DPDP अनुपालन मोड',
            gdprDesc: 'मानक रिपोर्ट में व्यक्तिगत रूप से पहचान योग्य जानकारी (PII) को छिपाएं।'
        },
        notify: {
            channels: 'अधिसूचना चैनल',
            email: 'ईमेल गेटवे',
            sms: 'एसएमएस / व्हाट्सएप गेटवे',
            status: { connected: 'जुड़ा हुआ', disconnected: 'डिस्कनेक्ट', error: 'त्रुटि' },
            events: 'ट्रिगर इवेंट्स',
            notifyHostCheckin: 'चेक-इन पर मेजबान को सूचित करें',
            notifyHostOverstay: 'ओवरस्टे पर सुरक्षा को सचेत करें',
            notifyVisitorWelcome: 'आगंतुक को डिजिटल पास भेजें'
        },
        actions: {
            save: 'कॉन्फ़िगरेशन सहेजें',
            discard: 'परिवर्तन त्यागें',
            saving: 'सहेजा जा रहा है...'
        }
    },
    mr: {
        title: 'सिस्टम कॉन्फिगरेशन',
        tabs: { 
            general: 'सामान्य', 
            security: 'सुरक्षा आणि गोपनीयता', 
            notify: 'सूचना', 
            integrations: 'एकीकरण',
            backup: 'डेटा आणि बॅकअप' 
        },
        general: {
            identity: 'संस्था ओळख',
            orgName: 'संस्थेचे नाव',
            bldgCode: 'इमारत / साइट कोड',
            timezone: 'सिस्टम वेळ क्षेत्र',
            locale: 'डिफॉल्ट लोकॅल',
            policies: 'अभ्यागत धोरणे',
            allowWalkins: 'वॉक-इन नोंदणींना अनुमती द्या',
            allowWalkinsDesc: 'पूर्व भेटीशिवाय अभ्यागतांसाठी गेटवर सेल्फ-सर्व्हिस किओस्क सक्षम करा.',
            requireApproval: 'यजमान मंजुरी आवश्यक आहे',
            requireApprovalDesc: 'पास जारी करण्यापूर्वी सर्व वॉक-इन अभ्यागतांना यजमानाने डिजिटलरित्या मंजूर केले पाहिजे.'
        },
        security: {
            access: 'प्रवेश नियंत्रण',
            mfa: 'अडमिनसाठी MFA सक्तीचे करा',
            mfaDesc: 'सर्व प्रशासकीय खात्यांसाठी मल्टी-फॅक्टर ऑथेंटिकेशन आवश्यक आहे.',
            session: 'सत्र कालबाह्य (मिनिटे)',
            retention: 'डेटा धारणा धोरण',
            retentionDesc: 'विशिष्ट कालावधीनंतर अभ्यागत नोंदी स्वयंचलितपणे निनावी करा किंवा हटवा.',
            gdpr: 'GDPR / DPDP अनुपालन मोड',
            gdprDesc: 'मानक अहवालांमध्ये वैयक्तिकरित्या ओळखण्यायोग्य माहिती (PII) लपवा.'
        },
        notify: {
            channels: 'सूचना चॅनेल',
            email: 'ईमेल गेटवे',
            sms: 'एसएमएस / व्हॉट्सअॅप गेटवे',
            status: { connected: 'कनेक्ट केले', disconnected: 'डिस्कनेक्ट केले', error: 'त्रुटी' },
            events: 'ट्रिगर इव्हेंट्स',
            notifyHostCheckin: 'चेक-इनवर यजमानाला सूचित करा',
            notifyHostOverstay: 'ओव्हरस्टेवर सुरक्षेला सावध करा',
            notifyVisitorWelcome: 'अभ्यागताला डिजिटल पास पाठवा'
        },
        actions: {
            save: 'कॉन्फिगरेशन जतन करा',
            discard: 'बदल रद्द करा',
            saving: 'जतन करत आहे...'
        }
    }
};

const SettingsContent: React.FC<SettingsContentProps> = ({ lang }) => {
    const t = content[lang];
    const [selectedTab, setSelectedTab] = useState<string>('general');
    const [isSaving, setIsSaving] = useState(false);

    const handleTabSelect = (_: unknown, data: SelectTabData) => {
        setSelectedTab(String(data.value));
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate network request
        setTimeout(() => setIsSaving(false), 1500);
    };

    // --- Tab Content Renderers ---

    const renderGeneral = () => (
        <div className="space-y-8 animate-fadeIn">
            <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                    <span className="material-symbols-outlined">business</span> {t.general.identity}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <Label required>{t.general.orgName}</Label>
                        <Input defaultValue="Ministry of Home Affairs" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>{t.general.bldgCode}</Label>
                        <Input defaultValue="NB-DEL-01" disabled appearance="filled-darker" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>{t.general.timezone}</Label>
                        <Dropdown placeholder="Select timezone" defaultValue="IST (UTC+05:30)">
                            <Option>IST (UTC+05:30)</Option>
                            <Option>UTC (GMT+00:00)</Option>
                        </Dropdown>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>{t.general.locale}</Label>
                        <Dropdown placeholder="Select locale" defaultValue="en-IN">
                            <Option>en-IN (English)</Option>
                            <Option>hi-IN (Hindi)</Option>
                        </Dropdown>
                    </div>
                </div>
            </section>
            
            <Divider />

            <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                    <span className="material-symbols-outlined">policy</span> {t.general.policies}
                </h3>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-row justify-between items-start md:items-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                        <div>
                            <Text weight="semibold" block>{t.general.allowWalkins}</Text>
                            <Text size={200} className="text-neutral-500">{t.general.allowWalkinsDesc}</Text>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex flex-row justify-between items-start md:items-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                        <div>
                            <Text weight="semibold" block>{t.general.requireApproval}</Text>
                            <Text size={200} className="text-neutral-500">{t.general.requireApprovalDesc}</Text>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </section>
        </div>
    );

    const renderSecurity = () => (
        <div className="space-y-8 animate-fadeIn">
             <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                    <span className="material-symbols-outlined">verified_user</span> {t.security.access}
                </h3>
                 <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-800">
                        <div>
                            <Text weight="semibold" block>{t.security.mfa}</Text>
                            <Text size={200} className="text-neutral-500">{t.security.mfaDesc}</Text>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex flex-col gap-2 max-w-xs">
                        <Label>{t.security.session}</Label>
                        <Input type="number" defaultValue="30" contentAfter="min" />
                    </div>
                </div>
            </section>

            <Divider />

            <section>
                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                    <span className="material-symbols-outlined">folder_managed</span> {t.security.retention}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex flex-col gap-2">
                        <Label>{t.security.retentionDesc}</Label>
                        <Dropdown defaultValue="90 Days">
                            <Option>30 Days</Option>
                            <Option>90 Days</Option>
                            <Option>180 Days</Option>
                            <Option>1 Year</Option>
                            <Option>Indefinite (Not Recommended)</Option>
                        </Dropdown>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                        <div className="mr-4">
                            <Text weight="semibold" block>{t.security.gdpr}</Text>
                            <Text size={200} className="text-neutral-500">{t.security.gdprDesc}</Text>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </section>
        </div>
    );

    const renderNotify = () => (
        <div className="space-y-8 animate-fadeIn">
            <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                    <span className="material-symbols-outlined">hub</span> {t.notify.channels}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Avatar color="colorful" icon={<span className="material-symbols-outlined">mail</span>} />
                            <div>
                                <Text weight="semibold" block>{t.notify.email}</Text>
                                <Text size={200} className="text-neutral-500">smtp.nic.in:587</Text>
                            </div>
                        </div>
                        <Badge appearance="tint" color="success">{t.notify.status.connected}</Badge>
                    </div>
                    <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Avatar color="colorful" icon={<span className="material-symbols-outlined">sms</span>} />
                             <div>
                                <Text weight="semibold" block>{t.notify.sms}</Text>
                                <Text size={200} className="text-neutral-500">CDAC SMS Gateway</Text>
                            </div>
                        </div>
                        <Badge appearance="tint" color="warning">{t.notify.status.error}</Badge>
                    </div>
                </div>
            </section>

            <Divider />
            
            <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                    <span className="material-symbols-outlined">bolt</span> {t.notify.events}
                </h3>
                <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <Text>{t.notify.notifyHostCheckin}</Text>
                        <Switch defaultChecked />
                    </div>
                    <Divider />
                     <div className="flex justify-between items-center">
                        <Text>{t.notify.notifyHostOverstay}</Text>
                        <Switch defaultChecked />
                    </div>
                    <Divider />
                     <div className="flex justify-between items-center">
                        <Text>{t.notify.notifyVisitorWelcome}</Text>
                        <Switch />
                    </div>
                </div>
            </section>
        </div>
    );

    const renderContent = () => {
        switch(selectedTab) {
            case 'general': return renderGeneral();
            case 'security': return renderSecurity();
            case 'notify': return renderNotify();
            default: return (
                <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                    <span className="material-symbols-outlined text-4xl mb-2">construction</span>
                    <p>Module under development</p>
                </div>
            );
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row bg-white dark:bg-neutral-900 rounded-lg shadow-sm overflow-hidden border border-neutral-200 dark:border-neutral-800">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-xl font-bold font-heading text-primary dark:text-white">{t.title}</h2>
                </div>
                <div className="p-2 overflow-y-auto flex-grow">
                    <TabList 
                        selectedValue={selectedTab} 
                        onTabSelect={handleTabSelect}
                        vertical 
                        appearance="subtle"
                        size="large"
                    >
                        <Tab value="general" icon={<span className="material-symbols-outlined">tune</span>}>
                            {t.tabs.general}
                        </Tab>
                        <Tab value="security" icon={<span className="material-symbols-outlined">security</span>}>
                            {t.tabs.security}
                        </Tab>
                        <Tab value="notify" icon={<span className="material-symbols-outlined">notifications</span>}>
                            {t.tabs.notify}
                        </Tab>
                        <Tab value="integrations" icon={<span className="material-symbols-outlined">integration_instructions</span>}>
                            {t.tabs.integrations}
                        </Tab>
                        <Tab value="backup" icon={<span className="material-symbols-outlined">cloud_sync</span>}>
                            {t.tabs.backup}
                        </Tab>
                    </TabList>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-neutral-900">
                <div className="flex-grow overflow-y-auto p-6 md:p-10">
                    <div className="max-w-4xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
                
                {/* Sticky Action Footer */}
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3 backdrop-blur-sm">
                    <Button disabled={isSaving}>{t.actions.discard}</Button>
                    <Button 
                        appearance="primary" 
                        onClick={handleSave} 
                        disabled={isSaving}
                        icon={isSaving ? <Spinner size="tiny" /> : <span className="material-symbols-outlined">save</span>}
                    >
                        {isSaving ? t.actions.saving : t.actions.save}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SettingsContent;