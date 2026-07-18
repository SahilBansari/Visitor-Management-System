import React, { useState } from 'react';
import { OfficeNode } from '../../../utils/mockDatabase';
import { Button, Tooltip } from '@fluentui/react-components';
import type { Language } from '../../../App';

interface TreeNodeProps {
    node: OfficeNode;
    selectedId: string | null;
    onSelectNode: (id: string) => void;
    level: number;
    lang: Language;
}

const typeLabels = {
    en: { ministry: 'Ministry', dept: 'Department', office: 'Office' },
    hi: { ministry: 'मंत्रालय', dept: 'विभाग', office: 'कार्यालय' },
    mr: { ministry: 'मंत्रालय', dept: 'विभाग', office: 'कार्यालय' },
};

const TreeNode: React.FC<TreeNodeProps> = ({ node, selectedId, onSelectNode, level, lang }) => {
    const [isExpanded, setIsExpanded] = useState(level < 2);
    const hasChildren = node.children && node.children.length > 0;
    const t = typeLabels[lang] || typeLabels.en;

    const iconMap = {
        ministry: 'corporate_fare',
        dept: 'folder',
        office: 'location_city',
    };
    
    const colorMap = {
        ministry: 'text-blue-500 dark:text-blue-400',
        dept: 'text-cyan-600 dark:text-cyan-400',
        office: 'text-neutral-700 dark:text-neutral-300',
    };

    const nodeType = node.type as keyof typeof iconMap;

    return (
        <div>
            <div 
                className={`flex items-center rounded-md transition-colors duration-150 ${selectedId === node.id ? 'bg-secondary/10' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                style={{ paddingLeft: `${level * 16}px` }}
            >
                {hasChildren ? (
                    <Button 
                        appearance="transparent" 
                        size="small" 
                        icon={<span className="material-symbols-outlined text-sm">{isExpanded ? 'expand_more' : 'chevron_right'}</span>} 
                        onClick={() => setIsExpanded(!isExpanded)}
                    />
                ) : <div className="w-8"></div>}

                <button className="flex-grow flex items-center gap-2 text-left py-1.5" onClick={() => onSelectNode(node.id)}>
                    <Tooltip content={t[nodeType] || node.type} relationship="label">
                        <span className={`material-symbols-outlined text-base ${colorMap[nodeType] || 'text-neutral-500'}`}>
                            {iconMap[nodeType] || 'domain'}
                        </span>
                    </Tooltip>
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{node.name}</span>
                </button>
            </div>
            {isExpanded && hasChildren && (
                <div>
                    {node.children?.map(child => (
                        <TreeNode 
                            key={child.id} 
                            node={child} 
                            selectedId={selectedId} 
                            onSelectNode={onSelectNode} 
                            level={level + 1} 
                            lang={lang}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


interface OfficeTreeViewProps {
    nodes: OfficeNode[];
    selectedId: string | null;
    onSelectNode: (id: string) => void;
    lang?: Language; // Optional to prevent breaking existing usage
}

const OfficeTreeView: React.FC<OfficeTreeViewProps> = ({ nodes, selectedId, onSelectNode, lang = 'en' }) => {
    return (
        <div className="p-2">
            {nodes.map(node => (
                <TreeNode 
                    key={node.id} 
                    node={node} 
                    selectedId={selectedId} 
                    onSelectNode={onSelectNode} 
                    level={0} 
                    lang={lang}
                />
            ))}
        </div>
    );
};

export default OfficeTreeView;