
import React, { useState } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { AppSettings, CustomStatus, CommunicationTemplate } from '../../types';
import FormField from '../ui/FormField';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import ListEditor from '../ui/ListEditor';
import { Input } from '../ui/Input';
import * as api from '../../services/api';

// --- Sub-component for Default settings ---
const DefaultSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [settings, setSettings] = useState<AppSettings['media']>(state.settings.media);
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = <K extends keyof AppSettings['media']>(field: K, value: AppSettings['media'][K]) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        const newSettings = produce(state.settings, draft => {
            draft.media.boilerplate = settings.boilerplate;
            draft.media.contactInfo = settings.contactInfo;
            draft.media.defaultCity = settings.defaultCity;
            draft.media.defaultProvince = settings.defaultProvince;
        });
        try {
            await api.updateSettings(newSettings);
            dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
            setIsDirty(false);
            notify('Default media settings saved!', 'success');
        } catch (error: any) {
            notify(`Error saving settings: ${error.message}`, 'error');
        }
    };
    
    return (
        <div className="space-y-6 max-w-2xl">
            <FormField label="Default Boilerplate" htmlFor="boilerplate" instructions="This is the standard 'About Us' paragraph that is often included at the end of a news release.">
                <TextareaWithCounter
                    id="boilerplate"
                    rows={5}
                    value={settings.boilerplate}
                    onChange={e => handleChange('boilerplate', e.target.value)}
                    wordLimit={100}
                />
            </FormField>

            <FormField label="Default Contact Information" htmlFor="contactInfo" instructions="Provide the standard contact details for media inquiries. This can be pre-filled into new releases.">
                <TextareaWithCounter
                    id="contactInfo"
                    rows={5}
                    value={settings.contactInfo}
                    onChange={e => handleChange('contactInfo', e.target.value)}
                    wordLimit={100}
                />
            </FormField>
            
            <div className="grid grid-cols-2 gap-6">
                <FormField label="Default City" htmlFor="defaultCity">
                    <Input id="defaultCity" value={settings.defaultCity || ''} onChange={e => handleChange('defaultCity', e.target.value)} />
                </FormField>
                <FormField label="Default Province / Territory" htmlFor="defaultProvince">
                    <Input id="defaultProvince" value={settings.defaultProvince || ''} onChange={e => handleChange('defaultProvince', e.target.value)} />
                </FormField>
            </div>

             <div className="pt-5 border-t border-slate-200">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Save Default Settings
                </button>
            </div>
        </div>
    );
};

// --- Sub-component for Communication Types settings ---
const CommunicationTypeSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [types, setTypes] = useState<CustomStatus[]>(state.settings.media.types);
    const [isDirty, setIsDirty] = useState(false);

    const handleTypesChange = (newTypes: CustomStatus[]) => {
        setTypes(newTypes);
        setIsDirty(true);
    };

     const handleSave = async () => {
        const newSettings = produce(state.settings, draft => {
            draft.media.types = types;
        });
        try {
            await api.updateSettings(newSettings);
            dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
            setIsDirty(false);
            notify('Communication types saved!', 'success');
        } catch (error: any) {
            notify(`Error saving settings: ${error.message}`, 'error');
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <p className="text-sm text-slate-500">Define the types of communications you can create (e.g., News Release, Project Update, Social Media Post).</p>
            <ListEditor 
                items={types}
                onChange={handleTypesChange}
                itemLabel="Type"
                withColor={false}
            />
            <div className="pt-5 border-t border-slate-200">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Save Communication Types
                </button>
            </div>
        </div>
    );
};

// --- Sub-component for Contact Types settings ---
const ContactTypeSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [types, setTypes] = useState<CustomStatus[]>(state.settings.media.contactTypes);
    const [isDirty, setIsDirty] = useState(false);

    const handleTypesChange = (newTypes: CustomStatus[]) => {
        setTypes(newTypes);
        setIsDirty(true);
    };

     const handleSave = async () => {
        const newSettings = produce(state.settings, draft => {
            draft.media.contactTypes = types;
        });
        try {
            await api.updateSettings(newSettings);
            dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
            setIsDirty(false);
            notify('Contact types saved!', 'success');
        } catch (error: any) {
            notify(`Error saving settings: ${error.message}`, 'error');
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <p className="text-sm text-slate-500">Define high-level categories for your contacts (e.g., Media, Funder, Venue) for powerful filtering.</p>
            <ListEditor 
                items={types}
                onChange={handleTypesChange}
                itemLabel="Contact Type"
                withColor={false}
            />
            <div className="pt-5 border-t border-slate-200">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Save Contact Types
                </button>
            </div>
        </div>
    );
};


// --- Sub-component for Communication Templates ---
const TemplateSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [templates, setTemplates] = useState<CommunicationTemplate[]>(state.settings.media.templates);
    const [isDirty, setIsDirty] = useState(false);

    const newId = () => `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const handleUpdateTemplate = (id: string, field: 'name' | 'instructions', value: string) => {
        setTemplates(prev => produce(prev, draft => {
            const item = draft.find(t => t.id === id);
            if (item) {
                item[field] = value;
            }
        }));
        setIsDirty(true);
    };

    const handleAddTemplate = () => {
        setTemplates(prev => [...prev, {
            id: newId(),
            name: 'New Template',
            instructions: 'Your goal is to...'
        }]);
        setIsDirty(true);
    };

    const handleRemoveTemplate = (id: string) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
        setIsDirty(true);
    };

    const handleSave = async () => {
        const newSettings = produce(state.settings, draft => {
            draft.media.templates = templates;
        });
        try {
            await api.updateSettings(newSettings);
            dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
            setIsDirty(false);
            notify('AI templates saved!', 'success');
        } catch (error: any) {
            notify(`Error saving settings: ${error.message}`, 'error');
        }
    };
    
    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-500">Create reusable templates with specific instructions for the AI to generate different kinds of content (e.g., a formal announcement vs. a casual thank you message).</p>
            <div className="space-y-4">
                {templates.map(template => (
                    <div key={template.id} className="p-4 border border-slate-300 rounded-lg bg-slate-50 relative">
                        <button 
                            type="button" 
                            onClick={() => handleRemoveTemplate(template.id)} 
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-100"
                        >
                            <i className="fa-solid fa-trash-alt fa-fw"></i>
                        </button>
                        <FormField label="Template Name" htmlFor={`name-${template.id}`}>
                            <Input 
                                id={`name-${template.id}`} 
                                value={template.name} 
                                onChange={(e) => handleUpdateTemplate(template.id, 'name', e.target.value)}
                            />
                        </FormField>
                        <FormField label="AI Instructions" htmlFor={`instructions-${template.id}`}>
                            <TextareaWithCounter
                                id={`instructions-${template.id}`}
                                value={template.instructions}
                                onChange={(e) => handleUpdateTemplate(template.id, 'instructions', e.target.value)}
                                rows={4}
                                wordLimit={300}
                            />
                        </FormField>
                    </div>
                ))}
            </div>
            <div>
                <button
                    type="button"
                    onClick={handleAddTemplate}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add New Template
                </button>
            </div>
            <div className="pt-5 border-t border-slate-200">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Save AI Templates
                </button>
            </div>
        </div>
    )
};


// --- Main Component ---
const MediaSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'defaults' | 'commTypes' | 'contactTypes' | 'templates'>('defaults');

    const tabs = [
        { id: 'defaults' as const, label: 'Defaults'},
        { id: 'commTypes' as const, label: 'Communication Types'},
        { id: 'contactTypes' as const, label: 'Contact Types' },
        { id: 'templates' as const, label: 'AI Templates'},
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'defaults': return <DefaultSettings />;
            case 'commTypes': return <CommunicationTypeSettings />;
            case 'contactTypes': return <ContactTypeSettings />;
            case 'templates': return <TemplateSettings />;
            default: return <DefaultSettings />;
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Media & Communication Settings</h2>
            
            <div className="mt-4 border-b border-slate-200">
              <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                  {tabs.map(tab => (
                      <button
                        key={tab.id}
                        type="button"
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
            
            <div className="mt-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default MediaSettings;
