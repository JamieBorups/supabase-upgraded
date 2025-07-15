
import React, { useState, useMemo } from 'react';
import { Input } from '../../ui/Input.tsx';
import { ARTISTIC_DISCIPLINES, PROVINCES } from '../../../constants.ts';
import { AccordionItem, SchemaTable, ConstantsTable } from './SchemaReport.components.tsx';
import { schemaGroups } from './schemaConfigs.ts';

const SchemaReportPage: React.FC = () => {
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['project']));
    const [searchTerm, setSearchTerm] = useState('');

    const toggleSection = (key: string) => {
        setOpenSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const filteredGroups = useMemo(() => {
        if (!searchTerm) return schemaGroups;
        const lowerSearchTerm = searchTerm.toLowerCase();

        return schemaGroups
            .map(group => {
                const filteredConfigs = group.configs.filter(config =>
                    config.title.toLowerCase().includes(lowerSearchTerm) ||
                    config.description.toLowerCase().includes(lowerSearchTerm) ||
                    config.fieldConfig.some(field => field.key.toLowerCase().includes(lowerSearchTerm) || field.desc.toLowerCase().includes(lowerSearchTerm))
                );

                if (filteredConfigs.length > 0) {
                    return { ...group, configs: filteredConfigs };
                }
                return null;
            })
            .filter((group): group is NonNullable<typeof group> => group !== null);
    }, [searchTerm]);

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-slate-900">Data Schema Report</h1>
            <p className="text-slate-500 mt-1 mb-6">A developer-focused, read-only report of all major data models in the application. This page reflects the initial values defined in the application's constants.</p>
            
             <div className="mb-6 sticky top-20 bg-white/80 backdrop-blur-sm py-2 z-10">
                <Input 
                    placeholder="Search models and fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-6">
                {filteredGroups.length > 0 ? filteredGroups.map(group => (
                    <div key={group.moduleTitle} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-300">{group.moduleTitle}</h2>
                        <div className="space-y-4">
                            {group.configs.map(config => (
                                <AccordionItem
                                    key={config.key}
                                    title={config.title}
                                    description={config.description}
                                    isOpen={openSections.has(config.key)}
                                    onToggle={() => toggleSection(config.key)}
                                >
                                    <SchemaTable dataObject={config.dataObject} fieldConfig={config.fieldConfig} />
                                </AccordionItem>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 text-slate-500">
                        <p>No schema models match your search term.</p>
                    </div>
                )}

                <AccordionItem
                    key="constants"
                    title="Shared Constants"
                    description="Enumerated values used in dropdowns and selectors across the application."
                    isOpen={openSections.has('constants')}
                    onToggle={() => toggleSection('constants')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <ConstantsTable title="Artistic Disciplines" constants={ARTISTIC_DISCIPLINES} />
                        <ConstantsTable title="Provinces & Territories" constants={PROVINCES} />
                    </div>
                </AccordionItem>
            </div>
        </div>
    );
};

export default SchemaReportPage;
