


import React, { useState, useRef, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../../context/AppContext';
import { AppSettings, AiPersonaName, AiPersonaSettings, CommunicationTemplate } from '../../../types';
import { initialSettings } from '../../../constants';
import MainAiTab from './MainAiTab';
import ModuleAiTab from './ModuleAiTab';
import PersonaTestModal from './PersonaTestModal';
import ConfirmationModal from '../../ui/ConfirmationModal';
import * as api from '../../../services/api';

const AiSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [settings, setSettings] = useState<AppSettings['ai']>(state.settings.ai);
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState<AiPersonaName>('main');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [testModalContext, setTestModalContext] = useState<AiPersonaName | null>(null);
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const tabs: { id: AiPersonaName, label: string }[] = [
        { id: 'main', label: 'Main' },
        { id: 'projectGenerator', label: 'Project Generator' },
        { id: 'projects', label: 'Projects' },
        { id: 'tasks', label: 'Workplan Generator' },
        { id: 'taskGenerator', label: 'Task Generator' },
        { id: 'budget', label: 'Budget' },
        { id: 'members', label: 'Members' },
        { id: 'reports', label: 'Reports' },
        { id: 'media', label: 'Media' },
        { id: 'ecostar', label: 'ECO-STAR' },
        { id: 'interestCompatibility', label: 'Interest Compatibility' },
        { id: 'sdgAlignment', label: 'SDG Alignment' },
        { id: 'recreation', label: 'Recreation Framework' },
    ];
    
    const checkArrows = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) {
            setShowLeftArrow(false);
            setShowRightArrow(false);
            return;
        }
        
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const hasOverflow = scrollWidth > clientWidth;

        setShowLeftArrow(hasOverflow && scrollLeft > 5);
        // Use a 1px tolerance for floating point issues
        setShowRightArrow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        checkArrows();
        const resizeObserver = new ResizeObserver(checkArrows);
        resizeObserver.observe(container);
        container.addEventListener('scroll', checkArrows, { passive: true });

        return () => {
            resizeObserver.disconnect();
            container.removeEventListener('scroll', checkArrows);
        };
    }, [checkArrows]);
    
    const handleScroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const scrollAmount = container.clientWidth * 0.8;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };
    
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
            
            <div className="mt-6 border-b border-slate-200 relative">
                {showLeftArrow && (
                    <button 
                        onClick={() => handleScroll('left')}
                        className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent flex items-center"
                        aria-label="Scroll left"
                    >
                        <i className="fa-solid fa-chevron-left text-slate-500 hover:text-slate-800"></i>
                    </button>
                )}
              <div ref={scrollContainerRef} className="scrollbar-hide overflow-x-auto">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${
                        activeTab === tab.id
                          ? 'border-teal-500 text-teal-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
               {showRightArrow && (
                    <button 
                        onClick={() => handleScroll('right')}
                        className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent flex items-center"
                        aria-label="Scroll right"
                    >
                        <i className="fa-solid fa-chevron-right text-slate-500 hover:text-slate-800"></i>
                    </button>
                )}
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