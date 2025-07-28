

import React from 'react';
import { AiPersonaName, AiPersonaSettings, CommunicationTemplate } from '../../../types';
import PersonaEditor from './PersonaEditor';
import PersonaTemplateManager from './PersonaTemplateManager';

interface ModuleAiTabProps {
  personaName: AiPersonaName;
  persona: AiPersonaSettings;
  onPersonaChange: (field: keyof AiPersonaSettings, value: any) => void;
  templates: CommunicationTemplate[];
  onTemplatesChange: (templates: CommunicationTemplate[]) => void;
  onLoadTemplate: (instructions: string) => void;
  onTestPersona: () => void;
}

const ModuleAiTab: React.FC<ModuleAiTabProps> = ({ 
  personaName, 
  persona, 
  onPersonaChange,
  templates,
  onTemplatesChange,
  onLoadTemplate,
  onTestPersona
}) => {
    
    const instructionsMap: Record<AiPersonaName, string> = {
        main: '', // Not used here
        projects: "Define how the AI should assist with project planning, description writing, and goal setting.",
        budget: "Define how the AI should assist with budget creation, analysis, and financial suggestions.",
        members: "Define how the AI should help write or refine artist biographies and profiles.",
        tasks: "Define how the AI should analyze a project's context and existing tasks to generate a comprehensive workplan.",
        taskGenerator: "Configure the AI that generates task lists from a simple user prompt.",
        reports: "Define how the AI should assist in summarizing data and writing formal report narratives.",
        media: "Define how the AI should assist with generating news releases and other communications materials.",
        ecostar: "Configure the AI that helps users build prompts using the E-C-O-S-T-A-R framework for community and ecological impact.",
        projectGenerator: "Configure the AI assistant that guides users through creating a new project from scratch.",
        interestCompatibility: "Configure the AI that analyzes project data to assess compatibility between stakeholders.",
        sdgAlignment: "Configure the AI that analyzes a project's alignment with the UN Sustainable Development Goals.",
        recreation: "Configure the AI that helps align a project with the goals of the Framework for Recreation in Canada.",
        researchPlan: "Configure the AI that assists in drafting sections of a community-based research plan.",
        otf: "Configure the AI assistant that helps draft sections of an Ontario Trillium Foundation (OTF) grant application.",
        nohfc: "Configure the AI assistant that helps draft sections of a Northern Ontario Heritage Fund Corporation (NOHFC) grant application.",
    };

  return (
    <div>
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">{personaName.charAt(0).toUpperCase() + personaName.slice(1)} Persona Settings</h3>
            <button
                type="button"
                onClick={onTestPersona}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <i className="fa-solid fa-flask-vial mr-2"></i>
                Test Persona
            </button>
        </div>
        <p className="text-sm text-slate-600 mb-4">{instructionsMap[personaName]}</p>
      
        <PersonaEditor persona={persona} onChange={onPersonaChange} />
        
        <hr className="my-6 border-slate-200" />

        <h3 className="text-lg font-bold text-slate-800">Persona Templates</h3>
        <p className="text-sm text-slate-600 -mt-2 mb-4">Manage reusable instruction templates for this persona. Loading a template will replace the current instructions in the editor above.</p>
        
        <PersonaTemplateManager
            templates={templates || []}
            onChange={onTemplatesChange}
            onLoadTemplate={onLoadTemplate}
        />
    </div>
  );
};

export default ModuleAiTab;