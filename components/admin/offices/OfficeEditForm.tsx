import React, { useState, useEffect } from 'react';
import { OfficeNode } from '../../../utils/mockDatabase'; // Adjust path if needed
import { Button, Input, Label, Textarea, Dropdown, Option, Avatar } from '@fluentui/react-components';
import type { Language } from '../../../App';

interface OfficeEditFormProps {
    office: OfficeNode;
    lang?: Language;
}

const content = {
    en: {
        title: 'Edit Office Details',
        name: 'Office Name',
        type: 'Office Type',
        address: 'Address',
        head: 'Head of Office',
        contact: 'Contact Number',
        email: 'Email Address',
        save: 'Save Changes',
        delete: 'Delete Office',
        types: ['Headquarters', 'Circle Office', 'Division Office', 'Sub-Division'],
        cancel: 'Cancel'
    },
    hi: {
        title: 'कार्यालय विवरण संपादित करें',
        name: 'कार्यालय का नाम',
        type: 'कार्यालय का प्रकार',
        address: 'पता',
        head: 'कार्यालय प्रमुख',
        contact: 'संपर्क नंबर',
        email: 'ईमेल पता',
        save: 'परिवर्तन सहेजें',
        delete: 'कार्यालय हटाएं',
        types: ['मुख्यालय', 'सर्कल कार्यालय', 'मंडल कार्यालय', 'उप-मंडल'],
        cancel: 'रद्द करें'
    },
    mr: {
        title: 'कार्यालय तपशील संपादित करा',
        name: 'कार्यालयाचे नाव',
        type: 'कार्यालयाचा प्रकार',
        address: 'पत्ता',
        head: 'कार्यालय प्रमुख',
        contact: 'संपर्क क्रमांक',
        email: 'ईमेल पत्ता',
        save: 'बदल जतन करा',
        delete: 'कार्यालय हटवा',
        types: ['मुख्यालय', 'सर्कल कार्यालय', 'विभाग कार्यालय', 'उप-विभाग'],
        cancel: 'रद्द करा'
    }
};

const OfficeEditForm: React.FC<OfficeEditFormProps> = ({ office, lang = 'en' }) => {
    const t = content[lang];
    const [formData, setFormData] = useState<Partial<OfficeNode>>({});
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setFormData(office);
        setIsDirty(false);
    }, [office]);

    const handleChange = (field: keyof OfficeNode, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = () => {
        alert(`Saved changes for ${formData.name}`);
        setIsDirty(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div className="w-16 h-16 bg-brand/10 rounded-lg flex items-center justify-center text-brand">
                    <span className="material-symbols-outlined text-3xl">apartment</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{t.title}</h2>
                    <p className="text-sm text-neutral-500 font-mono">ID: {office.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <Label required>{t.name}</Label>
                    <Input value={formData.name || ''} onChange={(e, d) => handleChange('name', d.value)} />
                </div>

                <div className="flex flex-col gap-2">
                    <Label>{t.type}</Label>
                    <Dropdown 
                        value={formData.type || ''} 
                        placeholder="Select Type"
                        onOptionSelect={(_, d) => handleChange('type', d.optionValue)}
                    >
                        {t.types.map(type => <Option key={type} value={type}>{type}</Option>)}
                    </Dropdown>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                    <Label>{t.address}</Label>
                    <Textarea 
                        value={formData.address || ''} 
                        onChange={(e, d) => handleChange('address', d.value)} 
                        rows={3}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label>{t.head}</Label>
                    <div className="flex gap-2">
                        <Input className="flex-grow" value={formData.headOfOffice || ''} onChange={(e, d) => handleChange('headOfOffice', d.value)} />
                        <Button icon={<span className="material-symbols-outlined">person_search</span>} />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>{t.contact}</Label>
                    <Input type="tel" value={formData.contactNumber || ''} onChange={(e, d) => handleChange('contactNumber', d.value)} />
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800">
                <Button appearance="subtle" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    {t.delete}
                </Button>
                
                <div className="flex gap-3">
                    {isDirty && <Button appearance="subtle" onClick={() => setFormData(office)}>{t.cancel}</Button>}
                    <Button appearance="primary" disabled={!isDirty} onClick={handleSave}>
                        {t.save}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OfficeEditForm;