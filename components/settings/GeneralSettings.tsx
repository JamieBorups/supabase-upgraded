
import React, { useState } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { AppSettings } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import * as api from '../../services/api';

const GeneralSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [settings, setSettings] = useState<AppSettings['general']>(state.settings.general);
    const [isDirty, setIsDirty] = useState(false);

    const isConnected = !state.setupNeeded;

    const handleChange = <K extends keyof AppSettings['general']>(field: K, value: AppSettings['general'][K]) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        const newSettings = produce(state.settings, draft => {
            draft.general = settings;
        });
        try {
            await api.updateSettings(newSettings);
            dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
            setIsDirty(false);
            notify('General settings saved!', 'success');
        } catch (error: any) {
            notify(`Error saving settings: ${error.message}`, 'error');
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900">General Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Configure application-wide settings and check system status.</p>
            
            <div className="mt-8 p-4 border border-slate-200 rounded-lg bg-slate-50/70">
                <h3 className="text-lg font-semibold text-slate-800">System Status</h3>
                <div className="mt-4">
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-slate-700">Database Connection:</span>
                        <span className={`ml-2 font-bold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                            {isConnected ? 'Connected' : 'Connection Failed'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-6">
                        {isConnected 
                            ? 'Successfully connected to the Supabase database.' 
                            : 'Could not connect to the database. Please check your Supabase URL and Key in the environment variables.'}
                    </p>
                </div>
            </div>

            <div className="mt-8 space-y-6 max-w-2xl">
                <FormField label="Collective Name" htmlFor="collectiveName" instructions="This name will appear in the application header.">
                    <Input 
                        id="collectiveName" 
                        value={settings.collectiveName} 
                        onChange={e => handleChange('collectiveName', e.target.value)} 
                    />
                </FormField>

                <FormField label="Default Currency" htmlFor="defaultCurrency" instructions="Select the primary currency for budgeting and reporting.">
                    <Select 
                        id="defaultCurrency"
                        value={settings.defaultCurrency}
                        onChange={e => handleChange('defaultCurrency', e.target.value as AppSettings['general']['defaultCurrency'])}
                        options={[
                            { value: 'CAD', label: 'CAD - Canadian Dollar' },
                            { value: 'USD', label: 'USD - US Dollar' },
                            { value: 'EUR', label: 'EUR - Euro' },
                        ]}
                    />
                </FormField>

                <FormField label="Date Format" htmlFor="dateFormat" instructions="Choose how dates are displayed throughout the application.">
                    <Select 
                        id="dateFormat"
                        value={settings.dateFormat}
                        onChange={e => handleChange('dateFormat', e.target.value as AppSettings['general']['dateFormat'])}
                        options={[
                            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g., 2025-07-21)' },
                            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g., 07/21/2025)' },
                            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g., 21/07/2025)' },
                        ]}
                    />
                </FormField>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-200">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default GeneralSettings;
