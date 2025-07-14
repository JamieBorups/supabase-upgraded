

import React from 'react';
import { AiPersonaSettings, CommunicationTemplate } from '../../../types';
import FormField from '../../ui/FormField';
import ToggleSwitch from '../../ui/ToggleSwitch';
import PersonaEditor from './PersonaEditor';
import PersonaTemplateManager from './PersonaTemplateManager';

interface MainAiTabProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  plainTextMode: boolean;
  onPlainTextModeChange: (enabled: boolean) => void;
  persona: AiPersonaSettings;
  onPersonaChange: (field: keyof AiPersonaSettings, value: any) => void;
  templates: CommunicationTemplate[];
  onTemplatesChange: (templates: CommunicationTemplate[]) => void;
  onLoadTemplate: (instructions: string) => void;
  onTestPersona: () => void;
}

const MainAiTab: React.FC<MainAiTabProps> = ({ 
  enabled, onEnabledChange, 
  plainTextMode, onPlainTextModeChange, 
  persona, onPersonaChange, 
  templates, onTemplatesChange,
  onLoadTemplate, onTestPersona 
}) => {

  return (
    <div className="space-y-8">
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <FormField label="Master AI Switch" htmlFor="ai-enabled">
          <ToggleSwitch id="ai-enabled" label={enabled ? 'AI Features are Active' : 'AI Features are Inactive'} checked={enabled} onChange={onEnabledChange} />
          <p className="text-xs text-slate-500 mt-2">This switch globally enables or disables all AI-powered features.</p>
        </FormField>
         <FormField label="Plain Text Mode" htmlFor="plain-text-mode">
          <ToggleSwitch id="plain-text-mode" label={plainTextMode ? 'Plain Text Mode is On' : 'Plain Text Mode is Off'} checked={plainTextMode} onChange={onPlainTextModeChange} />
          <p className="text-xs text-slate-500 mt-2">Force AI responses to plain text, removing markdown for easy copy-pasting.</p>
        </FormField>
      </div>

      <hr className="my-6 border-slate-200" />
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Main Persona Settings</h3>
         <button
            type="button"
            onClick={onTestPersona}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            <i className="fa-solid fa-flask-vial mr-2"></i>
            Test Persona
        </button>
      </div>
      <p className="text-sm text-slate-600 -mt-6">This is the base persona that defines the AI's core personality and tone across the entire application.</p>

      <PersonaEditor persona={persona} onChange={onPersonaChange} />
      
      <hr className="my-6 border-slate-200" />

      <h3 className="text-lg font-bold text-slate-800">Persona Templates</h3>
      <p className="text-sm text-slate-600 -mt-6">Manage reusable instruction templates for this persona. Loading a template will replace the current instructions in the editor above.</p>
      
      <PersonaTemplateManager 
        templates={templates}
        onChange={onTemplatesChange}
        onLoadTemplate={onLoadTemplate}
      />

    </div>
  );
};

export default MainAiTab;