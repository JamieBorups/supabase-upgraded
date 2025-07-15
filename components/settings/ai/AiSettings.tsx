

import React, { useState } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../../context/AppContext';
import { AppSettings, AiPersonaName, AiPersonaSettings, CommunicationTemplate, InterestCompatibilitySectionSettings } from '../../../types';
import { initialSettings } from '../../../constants.ts';
import MainAiTab from './MainAiTab';
import ModuleAiTab from './ModuleAiTab';
import PersonaTestModal from './PersonaTestModal';
import ConfirmationModal from '../../ui/ConfirmationModal';
import * as api from '../../../services/api';
import EcoStarSettingsEditor from './EcoStarSettingsEditor';
import InterestCompatibilitySettingsEditor from './InterestCompatibilitySettingsEditor';
import { Select } from '../../ui/Select';
import FormField from '../../ui/FormField';
import ResearchPlanSettingsEditor from './ResearchPlanSettingsEditor.tsx';

const AiSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [settings, setSettings] = useState<AppSettings['ai']>(state.settings.ai);
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState<AiPersonaName>('main');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [testModalContext, setTestModalContext] = useState<AiPersonaName | null>(null);

    const tabs: { id: AiPersonaName, label: string }[] = [
        { id: 'main', label: 'Main' },
        { id: 'researchPlan', label: 'Research Plan' },
        { id: 'ecostar', label: 'ECO-STAR' },
        { id: 'interestCompatibility', label: 'Interest Compatibility' },
        { id: 'sdgAlignment', label: 'SDG Alignment' },
        { id: 'recreation', label: 'Recreation Framework' },
        { id: 'projectGenerator', label: 'Project Generator' },
        { id: 'projects', label: 'Projects' },
        { id: 'tasks', label: 'Workplan Generator' },
        { id: 'taskGenerator', label: 'Task Generator' },
        { id: 'budget', label: 'Budget' },
        { id: 'members', label: 'Members' },
        { id: 'reports', label: 'Reports' },
        { id: 'media', label: 'Media' },
    ];
    
    const handlePersonaChange = (personaName: AiPersonaName, field: keyof AiPersonaSettings, value: any) => {
        setSettings(prev => produce(prev, draft => {
            const persona = draft.personas[personaName];
            if (persona) {
                switch (field) {
                    case 'instructions':
                        persona.instructions = value;
                        break;
                    case 'model':
                        persona.model = value;
                        break;
                    case 'temperature':
                        persona.temperature = value;
                        break;
                }
            }
        }));
        setIsDirty(true);
    };

    const handleTemplatesChange = (personaName: AiPersonaName, newTemplates: CommunicationTemplate[]) => {
        setSettings(prev => produce(prev, draft => {
            draft.personaTemplates[personaName] = newTemplates;
        }));
        setIsDirty(true);
    };

    const handleTemplateLoad = (personaName: AiPersonaName, instructions: string) => {
        setSettings(prev => produce(prev, draft => {
            draft.personas[personaName].instructions = instructions;
        }));
        setIsDirty(true);
        notify('Template loaded. Click "Save Changes" to apply.', 'info');
    };
    
    const handleEcoStarFieldSettingsChange = (newFieldSettings: any) => {
         setSettings(prev => produce(prev, draft => {
            draft.ecostarFieldSettings = newFieldSettings;
        }));
        setIsDirty(true);
    }
    
    const handleInterestCompatibilitySectionSettingsChange = (newSectionSettings: Record<string, InterestCompatibilitySectionSettings>) => {
        setSettings(prev => produce(prev, draft => {
            draft.interestCompatibilitySectionSettings = newSectionSettings;
        }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        const newSettings = produce(state.settings, draft => {
            draft.ai = settings;
        });
        try {
            await api.updateSettings(newSettings);
            dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
            setIsDirty(false);
            notify('AI settings saved!', 'success');
        } catch (error: any) {
            notify(`Error saving settings: ${error.message}`, 'error');
        }
    };

    const handleResetClick = () => {
        setIsResetModalOpen(true);
    };

    const confirmReset = () => {
        setSettings(initialSettings.ai);
        setIsDirty(true);
        setIsResetModalOpen(false);
        notify('AI settings have been reset to default. Click "Save Changes" to apply.', 'info');
    };

    const renderContent = () => {
        const persona = settings.personas[activeTab];
        const templates = settings.personaTemplates?.[activeTab] || [];
        
        if (activeTab === 'main') {
            return (
                <MainAiTab 
                    enabled={settings.enabled}
                    onEnabledChange={(value) => {
                        setSettings(prev => ({ ...prev, enabled: value }));
                        setIsDirty(true);
                    }}
                    plainTextMode={settings.plainTextMode}
                    onPlainTextModeChange={(value) => {
                        setSettings(prev => ({ ...prev, plainTextMode: value }));
                        setIsDirty(true);
                    }}
                    persona={persona}
                    onPersonaChange={(field, value) => handlePersonaChange('main', field, value)}
                    templates={templates}
                    onTemplatesChange={(newTemplates) => handleTemplatesChange('main', newTemplates)}
                    onLoadTemplate={(instructions) => handleTemplateLoad('main', instructions)}
                    onTestPersona={() => setTestModalContext('main')}
                />
            );
        }
        
        if (activeTab === 'ecostar') {
            return (
                <EcoStarSettingsEditor
                    persona={persona}
                    onPersonaChange={(field, value) => handlePersonaChange(activeTab, field, value)}
                    fieldSettings={settings.ecostarFieldSettings}
                    onFieldSettingsChange={handleEcoStarFieldSettingsChange}
                    onTestPersona={() => setTestModalContext(activeTab)}
                />
            )
        }
        
        if (activeTab === 'interestCompatibility') {
            return (
                 <InterestCompatibilitySettingsEditor
                    persona={persona}
                    onPersonaChange={(field, value) => handlePersonaChange(activeTab, field, value)}
                    sectionSettings={settings.interestCompatibilitySectionSettings}
                    onSectionSettingsChange={handleInterestCompatibilitySectionSettingsChange}
                    onTestPersona={() => setTestModalContext(activeTab)}
                />
            )
        }
        
        if (activeTab === 'researchPlan') {
            return (
                 <ResearchPlanSettingsEditor
                    persona={persona}
                    onPersonaChange={(field, value) => handlePersonaChange(activeTab, field, value)}
                    sectionSettings={settings.researchPlanSectionSettings}
                    onSectionSettingsChange={(newSettings) => {
                         setSettings(prev => produce(prev, draft => {
                            draft.researchPlanSectionSettings = newSettings;
                        }));
                        setIsDirty(true);
                    }}
                    onTestPersona={() => setTestModalContext(activeTab)}
                />
            )
        }
        
        return (
            <ModuleAiTab
                personaName={activeTab}
                persona={persona}
                onPersonaChange={(field, value) => handlePersonaChange(activeTab, field, value)}
                templates={templates}
                onTemplatesChange={(newTemplates) => handleTemplatesChange(activeTab, newTemplates)}
                onLoadTemplate={(instructions) => handleTemplateLoad(activeTab, instructions)}
                onTestPersona={() => setTestModalContext(activeTab)}
            />
        );
    };

    return (
        <div>
            {isResetModalOpen && (
                <ConfirmationModal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                    onConfirm={confirmReset}
                    title="Reset AI Settings"
                    message="Are you sure you want to reset all AI settings to their default values? This action cannot be undone."
                    confirmButtonText="Yes, Reset"
                />
            )}
            {testModalContext && (
                <PersonaTestModal
                    isOpen={true}
                    onClose={() => setTestModalContext(null)}
                    context={testModalContext}
                    settings={settings}
                />
            )}
            <h2 className="text-2xl font-bold text-slate-900">AI Personas & Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Configure the personality and behavior of specialized AI assistants for each part of the application.</p>
            
            <div className="mt-6 border-b border-slate-200 pb-4">
                <FormField label="Select Persona to Edit" htmlFor="ai-persona-select" className="mb-0 max-w-sm">
                    <Select
                        id="ai-persona-select"
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as AiPersonaName)}
                        options={tabs.map(tab => ({ value: tab.id, label: tab.label }))}
                    />
                </FormField>
            </div>
            
            <div className="mt-6">
                {renderContent()}
            </div>
            
            <div className="mt-8 pt-5 border-t border-slate-200 flex justify-between items-center">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Save Changes
                </button>
                 <button
                    type="button"
                    onClick={handleResetClick}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    );
};

export default AiSettings;