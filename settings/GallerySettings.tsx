import React, { useState } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { AppSettings } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';

const SplashScreenSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [settings, setSettings] = useState<AppSettings['gallery']>(state.settings.gallery);
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = <K extends keyof AppSettings['gallery']>(field: K, value: AppSettings['gallery'][K]) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = () => {
        const newSettings = produce(state.settings, draft => {
            draft.gallery = settings;
        });
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
        setIsDirty(false);
        notify('Splash screen settings saved!', 'success');
    };
    
    return (
        <div>
            <h3 className="text-xl font-bold text-slate-900">Splash Screen Settings</h3>
            <p className="mt-1 text-sm text-slate-500">Configure images that appear randomly on the application's splash screen.</p>
            
            <div className="mt-8 space-y-6 max-w-2xl">
                <FormField label="Splash Image URL 1" htmlFor="splashImage1">
                    <Input 
                        id="splashImage1" 
                        value={settings.splashImage1} 
                        onChange={e => handleChange('splashImage1', e.target.value)} 
                    />
                </FormField>

                <FormField label="Splash Image URL 2" htmlFor="splashImage2">
                    <Input 
                        id="splashImage2" 
                        value={settings.splashImage2} 
                        onChange={e => handleChange('splashImage2', e.target.value)} 
                    />
                </FormField>

                <FormField label="Splash Image URL 3" htmlFor="splashImage3">
                    <Input 
                        id="splashImage3" 
                        value={settings.splashImage3} 
                        onChange={e => handleChange('splashImage3', e.target.value)} 
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
}

const HighlightsSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'splash' | 'gallery'>('splash');

    return (
        <div>
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('splash')}
                    className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${
                      activeTab === 'splash'
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Splash Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gallery')}
                    className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${
                      activeTab === 'gallery'
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Gallery (Coming Soon)
                  </button>
              </nav>
            </div>

            <div className="mt-8">
                {activeTab === 'splash' && <SplashScreenSettings />}
                {activeTab === 'gallery' && (
                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 opacity-60">
                        <h3 className="text-lg font-semibold text-slate-800">Gallery Management</h3>
                        <p className="text-sm text-slate-500 mt-1">Functionality to create and manage curated highlight galleries will be available here in a future update.</p>
                    </div>
                )}
            </div>
        </div>
    )
};

export default HighlightsSettings;