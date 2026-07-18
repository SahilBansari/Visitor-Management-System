import React from 'react';
import type { Language } from '../../../App';
import { Button, Tooltip, Switch, Slider } from '@fluentui/react-components';

interface AIModelsContentProps {
    lang: Language;
}

const content = {
    en: {
        title: 'AI Model Health & Management',
        killSwitch: 'Kill-switch All AI',
        killSwitchConfirm: 'This will disable all AI features immediately. Type CONFIRM to proceed.',
        viewLogs: 'View Logs',
        retrain: 'Re-train',
        download: 'Download ONNX',
    },
    hi: {
        title: 'एआई मॉडल स्वास्थ्य और प्रबंधन',
        killSwitch: 'सभी एआई को बंद करें',
        killSwitchConfirm: 'यह सभी एआई सुविधाओं को तुरंत अक्षम कर देगा। आगे बढ़ने के लिए CONFIRM टाइप करें।',
        viewLogs: 'लॉग देखें',
        retrain: 'पुनः प्रशिक्षित करें',
        download: 'ONNX डाउनलोड करें',
    },
    mr: {
        title: 'एआय मॉडेल आरोग्य आणि व्यवस्थापन',
        killSwitch: 'सर्व एआय बंद करा',
        killSwitchConfirm: 'हे सर्व एआय वैशिष्ट्ये त्वरित अक्षम करेल. पुढे जाण्यासाठी CONFIRM टाईप करा.',
        viewLogs: 'लॉग पहा',
        retrain: 'पुन्हा प्रशिक्षित करा',
        download: 'ONNX डाउनलोड करा',
    }
};

const models = [
    { name: 'Face-Match', version: 'v2.1.4', accuracy: 99.2, uptime: 100, inferences: 142 },
    { name: 'Officer-Suggest', version: 'v1.8.2', accuracy: 94.7, uptime: 100, inferences: 89 },
    { name: 'Forecast', version: 'v3.0.1', accuracy: 91.5, uptime: 99.8, inferences: 12 },
    { name: 'Risk-Score', version: 'v1.5.0', accuracy: 88.9, uptime: 100, inferences: 201 },
    { name: 'Voice-Intent', version: 'v1.2.3', accuracy: 96.1, uptime: 99.9, inferences: 45 },
    { name: 'OCR', version: 'v2.5.0', accuracy: 97.8, uptime: 100, inferences: 112, drift: true },
];

const ModelCard: React.FC<{ model: typeof models[0], t: typeof content.en }> = ({ model, t }) => (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col">
        {model.drift && (
            <div className="bg-error/10 text-error text-xs font-bold p-2 text-center">
                Drift Alert: Accuracy has dropped by more than 5%
            </div>
        )}
        <div className="p-4 flex-grow">
            <div className="flex justify-between items-start">
                <h3 className="font-bold font-heading text-lg">{model.name}</h3>
                <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded-full font-mono">{model.version}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                <div>
                    <p className="text-neutral-500">Accuracy/F1</p>
                    <p className="font-bold text-xl">{model.accuracy}%</p>
                </div>
                <div>
                    <p className="text-neutral-500">Uptime (24h)</p>
                    <p className="font-bold text-xl">{model.uptime}%</p>
                </div>
                <div>
                    <p className="text-neutral-500">Inferences/min</p>
                    <p className="font-bold text-xl">{model.inferences}</p>
                </div>
            </div>
            {/* Placeholder for sparkline */}
            <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded-md my-4"></div>
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">A/B Test</label>
                <Slider defaultValue={100} min={0} max={100} step={10} className="w-32" />
            </div>
        </div>
        <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex justify-end gap-2">
            <Button size="small" appearance="subtle">{t.viewLogs}</Button>
            <Button size="small" appearance="outline">{t.retrain}</Button>
            <Button size="small" appearance="primary">{t.download}</Button>
        </div>
    </div>
);


const AIModelsContent: React.FC<AIModelsContentProps> = ({ lang }) => {
    const t = content[lang];

    const handleKillSwitch = () => {
        const confirmation = prompt(t.killSwitchConfirm);
        if (confirmation === 'CONFIRM') {
            alert('All AI features have been disabled.');
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold font-heading">{t.title}</h1>
                <Button 
                    appearance="primary" 
                    style={{ backgroundColor: '#B00020', color: 'white' }} 
                    onClick={handleKillSwitch}
                >
                    {t.killSwitch}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map(model => <ModelCard key={model.name} model={model} t={t} />)}
            </div>
        </div>
    );
};

export default AIModelsContent;