import React, { useState } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { AppSettings, ThemeSettings } from '../../types';
import FormField from '../ui/FormField';
import * as api from '../../services/api';
import { initialSettings } from '../../constants';

const ColorInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-24 text-sm font-mono p-1 border border-slate-300 rounded-md"
            />
            <input
                type="color"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-8 h-8 p-0 border-none rounded-md cursor-pointer"
            />
        </div>
    </div>
);


const ThemeSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [settings, setSettings] = useState<ThemeSettings>(state.settings.theme);
    const [isDirty, setIsDirty] = useState(false);
    
    const handleChange = (field: keyof ThemeSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        const newSettings = produce(state.settings, draft => {
            draft.theme = settings;
        });
        try {
            await api.updateSettings(newSettings);
            dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
            setIsDirty(false);
            notify('Theme settings saved! The new look is now active.', 'success');
        } catch (error: any) {
            notify(`Error saving theme: ${error.message}`, 'error');
        }
    };
    
    const handleReset = () => {
        const defaultTheme = initialSettings.theme;
        setSettings(defaultTheme);
        setIsDirty(true);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Theme & Appearance</h2>
            <p className="mt-1 text-sm text-slate-500">Customize the application's color scheme. Changes are applied live across the entire application.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800">Brand & Accents</h3>
                    <div className="space-y-3">
                        <ColorInput label="Primary" value={settings.primary} onChange={v => handleChange('primary', v)} />
                        <ColorInput label="Primary Hover" value={settings.primaryHover} onChange={v => handleChange('primaryHover', v)} />
                        <ColorInput label="Link Text" value={settings.textLink} onChange={v => handleChange('textLink', v)} />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800">Surfaces</h3>
                    <div className="space-y-3">
                        <ColorInput label="Page Background" value={settings.surfacePage} onChange={v => handleChange('surfacePage', v)} />
                        <ColorInput label="Card Background" value={settings.surfaceCard} onChange={v => handleChange('surfaceCard', v)} />
                        <ColorInput label="Muted Background" value={settings.surfaceMuted} onChange={v => handleChange('surfaceMuted', v)} />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800">Header / Main Menu</h3>
                    <div className="space-y-3">
                        <ColorInput label="Background" value={settings.headerBg} onChange={v => handleChange('headerBg', v)} />
                        <ColorInput label="Title Text" value={settings.headerText} onChange={v => handleChange('headerText', v)} />
                        <ColorInput label="Nav Text" value={settings.headerNavText} onChange={v => handleChange('headerNavText', v)} />
                        <ColorInput label="Nav Active Text" value={settings.headerNavTextActive} onChange={v => handleChange('headerNavTextActive', v)} />
                        <ColorInput label="Nav Active Border" value={settings.headerNavBorderActive} onChange={v => handleChange('headerNavBorderActive', v)} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800">Text</h3>
                     <div className="space-y-3">
                        <ColorInput label="Heading Text" value={settings.textHeading} onChange={v => handleChange('textHeading', v)} />
                        <ColorInput label="Default Text" value={settings.textDefault} onChange={v => handleChange('textDefault', v)} />
                        <ColorInput label="Muted Text" value={settings.textMuted} onChange={v => handleChange('textMuted', v)} />
                        <ColorInput label="Text on Primary" value={settings.textOnPrimary} onChange={v => handleChange('textOnPrimary', v)} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800">Borders & Forms</h3>
                     <div className="space-y-3">
                        <ColorInput label="Subtle Border" value={settings.borderSubtle} onChange={v => handleChange('borderSubtle', v)} />
                        <ColorInput label="Default Border" value={settings.borderDefault} onChange={v => handleChange('borderDefault', v)} />
                        <ColorInput label="Focus Ring" value={settings.borderFocus} onChange={v => handleChange('borderFocus', v)} />
                    </div>
                </div>
                
                <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                    <h3 className="font-bold text-lg text-slate-800">UI Elements (Buttons)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                            <h4 className="font-semibold">Primary Button</h4>
                            <ColorInput label="Background" value={settings.buttonPrimaryBg} onChange={v => handleChange('buttonPrimaryBg', v)} />
                            <ColorInput label="Background Hover" value={settings.buttonPrimaryBgHover} onChange={v => handleChange('buttonPrimaryBgHover', v)} />
                            <ColorInput label="Text" value={settings.buttonPrimaryText} onChange={v => handleChange('buttonPrimaryText', v)} />
                        </div>
                        <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                             <h4 className="font-semibold">Secondary Button</h4>
                            <ColorInput label="Background" value={settings.buttonSecondaryBg} onChange={v => handleChange('buttonSecondaryBg', v)} />
                            <ColorInput label="Background Hover" value={settings.buttonSecondaryBgHover} onChange={v => handleChange('buttonSecondaryBgHover', v)} />
                            <ColorInput label="Text" value={settings.buttonSecondaryText} onChange={v => handleChange('buttonSecondaryText', v)} />
                            <ColorInput label="Border" value={settings.buttonSecondaryBorder} onChange={v => handleChange('buttonSecondaryBorder', v)} />
                        </div>
                         <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                            <h4 className="font-semibold">Special Action Button</h4>
                            <ColorInput label="Background" value={settings.buttonSpecialBg} onChange={v => handleChange('buttonSpecialBg', v)} />
                            <ColorInput label="Background Hover" value={settings.buttonSpecialBgHover} onChange={v => handleChange('buttonSpecialBgHover', v)} />
                            <ColorInput label="Text" value={settings.buttonSpecialText} onChange={v => handleChange('buttonSpecialText', v)} />
                        </div>
                    </div>
                </div>
                 
                 <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                    <h3 className="font-bold text-lg text-slate-800">Semantic Colors (for Statuses, etc.)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-3 p-4 border rounded-lg bg-green-50">
                            <h4 className="font-semibold">Success</h4>
                            <ColorInput label="Background" value={settings.statusSuccessBg} onChange={v => handleChange('statusSuccessBg', v)} />
                            <ColorInput label="Text" value={settings.statusSuccessText} onChange={v => handleChange('statusSuccessText', v)} />
                        </div>
                        <div className="space-y-3 p-4 border rounded-lg bg-yellow-50">
                             <h4 className="font-semibold">Warning</h4>
                            <ColorInput label="Background" value={settings.statusWarningBg} onChange={v => handleChange('statusWarningBg', v)} />
                            <ColorInput label="Text" value={settings.statusWarningText} onChange={v => handleChange('statusWarningText', v)} />
                        </div>
                         <div className="space-y-3 p-4 border rounded-lg bg-red-50">
                             <h4 className="font-semibold">Error</h4>
                            <ColorInput label="Background" value={settings.statusErrorBg} onChange={v => handleChange('statusErrorBg', v)} />
                            <ColorInput label="Text" value={settings.statusErrorText} onChange={v => handleChange('statusErrorText', v)} />
                        </div>
                         <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
                             <h4 className="font-semibold">Info</h4>
                            <ColorInput label="Background" value={settings.statusInfoBg} onChange={v => handleChange('statusInfoBg', v)} />
                            <ColorInput label="Text" value={settings.statusInfoText} onChange={v => handleChange('statusInfoText', v)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-200 flex justify-between">
                <button
                    onClick={handleReset}
                    className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100"
                >
                    Reset to Defaults
                </button>
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

export default ThemeSettings;