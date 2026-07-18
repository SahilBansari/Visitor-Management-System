import React, { useState, useEffect, useMemo } from 'react';
import type { Language } from '../../../App';
import { Button, Input } from '@fluentui/react-components';
import { getOfficeTree, OfficeNode } from '../../../utils/mockDatabase';
import OfficeTreeView from '../../../components/admin/offices/OfficeTreeView';
import OfficeEditForm from '../../../components/admin/offices/OfficeEditForm';

interface OfficesContentProps {
    lang: Language;
}

const content = {
    en: {
        addOffice: 'Add Office',
        importCsv: 'Import CSV',
        downloadTemplate: 'Download Template',
        searchPlaceholder: 'Search by name, address, pin-code...',
        emptyStateTitle: 'Select an office',
        emptyStateBody: 'Choose an office from the tree on the left to view and edit its details.',
    },
    hi: {
        addOffice: 'कार्यालय जोड़ें',
        importCsv: 'CSV आयात करें',
        downloadTemplate: 'टेम्पलेट डाउनलोड करें',
        searchPlaceholder: 'नाम, पता, पिन-कोड द्वारा खोजें...',
        emptyStateTitle: 'एक कार्यालय चुनें',
        emptyStateBody: 'विवरण देखने और संपादित करने के लिए बाईं ओर स्थित ट्री से एक कार्यालय चुनें।',
    },
    mr: {
        addOffice: 'कार्यालय जोडा',
        importCsv: 'CSV आयात करा',
        downloadTemplate: 'टेम्पलेट डाउनलोड करा',
        searchPlaceholder: 'नाव, पत्ता, पिन-कोड द्वारे शोधा...',
        emptyStateTitle: 'एक कार्यालय निवडा',
        emptyStateBody: 'तपशील पाहण्यासाठी आणि संपादित करण्यासाठी डावीकडील ट्रीमधून एक कार्यालय निवडा.',
    }
};

const findNodeById = (nodes: OfficeNode[], id: string): OfficeNode | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

const filterTree = (nodes: OfficeNode[], searchTerm: string): OfficeNode[] => {
    if (!searchTerm) return nodes;

    const lowercasedFilter = searchTerm.toLowerCase();

    function filter(node: OfficeNode): OfficeNode | null {
        const children = (node.children || []).map(filter).filter(Boolean) as OfficeNode[];

        if (
            node.name.toLowerCase().includes(lowercasedFilter) ||
            node.address?.toLowerCase().includes(lowercasedFilter) ||
            children.length > 0
        ) {
            return { ...node, children };
        }
        return null;
    }

    return nodes.map(filter).filter(Boolean) as OfficeNode[];
};


const OfficesContent: React.FC<OfficesContentProps> = ({ lang }) => {
    const t = content[lang];
    const [offices, setOffices] = useState<OfficeNode[]>([]);
    const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        getOfficeTree().then(setOffices);
    }, []);
    
    const selectedOffice = useMemo(() => {
        if (!selectedOfficeId) return null;
        return findNodeById(offices, selectedOfficeId);
    }, [selectedOfficeId, offices]);

    const filteredOffices = useMemo(() => filterTree(offices, searchTerm), [offices, searchTerm]);

    return (
        <div className="flex flex-col h-full">
            {/* Top Actions */}
            <div className="flex-shrink-0 flex flex-wrap items-center gap-2 mb-4">
                <Button appearance="primary" icon={<span className="material-symbols-outlined">add</span>}>
                    {t.addOffice}
                </Button>
                <Button icon={<span className="material-symbols-outlined">upload</span>}>{t.importCsv}</Button>
                <Button icon={<span className="material-symbols-outlined">download</span>}>{t.downloadTemplate}</Button>
                <div className="flex-grow min-w-[250px]">
                    <Input 
                        placeholder={t.searchPlaceholder}
                        className="w-full"
                        value={searchTerm}
                        onChange={(_, data) => setSearchTerm(data.value)}
                        contentAfter={<span className="material-symbols-outlined text-neutral-500">search</span>}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-hidden">
                {/* Left Pane: Tree View */}
                <div className="md:col-span-1 lg:col-span-1 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-y-auto">
                    <OfficeTreeView 
                        nodes={filteredOffices}
                        selectedId={selectedOfficeId}
                        onSelectNode={setSelectedOfficeId}
                    />
                </div>

                {/* Right Pane: Details/Form */}
                <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-y-auto p-6">
                    {selectedOffice ? (
                        <OfficeEditForm office={selectedOffice} lang={lang} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <span className="material-symbols-outlined text-6xl text-neutral-400 dark:text-neutral-600">wysiwyg</span>
                            <h2 className="mt-4 text-xl font-bold font-heading">{t.emptyStateTitle}</h2>
                            <p className="mt-1 text-neutral-600 dark:text-neutral-400 max-w-xs">{t.emptyStateBody}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfficesContent;