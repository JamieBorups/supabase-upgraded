

import { SalesSettings } from './sales.types';
import { EcoStarFieldSettings } from './ecostar.types';
import { ResearchPlanSectionSettings } from './research.types.ts';

export type SettingsCategory = 'general' | 'database' | 'projects' | 'members' | 'tasks' | 'ai' | 'budget' | 'highlights' | 'media' | 'events' | 'proposals' | 'users' | 'sales';
export interface CustomStatus { id: string; label: string; color: string; }
export interface CustomDiscipline { id: string; name: string; genres: { id: string; name: string }[]; }
export interface CustomRole { id: string; name: string; }
export interface CustomTaskStatus { id: string; name: string; color: string; }

export type AiPersonaName = 'main' | 'projects' | 'members' | 'tasks' | 'budget' | 'reports' | 'media' | 'ecostar' | 'projectGenerator' | 'interestCompatibility' | 'sdgAlignment' | 'recreation' | 'taskGenerator' | 'researchPlan';

export interface AiPersonaSettings {
  instructions: string;
  model: string;
  temperature: number;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  instructions: string;
}

export interface InterestCompatibilitySectionSettings {
    prompt: string;
    schema: any;
}

export interface AppSettings {
  general: {
    collectiveName: string;
    defaultCurrency: 'CAD' | 'USD' | 'EUR';
    dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
    supabaseUrl: string;
    supabaseAnonKey: string;
  };
  projects: {
    statuses: CustomStatus[];
    disciplines: CustomDiscipline[];
  };
  members: {
    roles: CustomRole[];
    availability: CustomRole[];
  };
  tasks: {
    statuses: CustomTaskStatus[];
    defaultWorkTypes: {
      paidRate: number;
      inKindRate: number;
      volunteerRate: number;
    };
    workWeek: string[];
  };
  budget: {
    revenueLabels: Record<string, string>;
    expenseLabels: Record<string, string>;
  };
  events: {
    venueTypes: CustomStatus[];
    defaultTicketTiers: { id: string; name: string; price: number; }[];
  };
  ai: {
    enabled: boolean;
    plainTextMode: boolean;
    personas: Record<AiPersonaName, AiPersonaSettings>;
    personaTemplates: Record<AiPersonaName, CommunicationTemplate[]>;
    projectGeneratorFieldInstructions: Record<string, string>;
    ecostarFieldSettings: EcoStarFieldSettings;
    interestCompatibilitySectionSettings: Record<keyof Omit<import('../interestCompatibility.types').InterestCompatibilityReport, 'id' | 'projectId' | 'createdAt' | 'notes' | 'fullReportText'>, InterestCompatibilitySectionSettings>;
    researchPlanSectionSettings: Record<keyof Omit<import('../research.types').ResearchPlan, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'notes' | 'researchTypes' | 'fullReportHtml'>, ResearchPlanSectionSettings>;
  };
  media: {
    boilerplate: string;
    contactInfo: string;
    types: CustomStatus[];
    contactTypes: CustomStatus[];
    defaultCity: string;
    defaultProvince: string;
    templates: CommunicationTemplate[];
  };
  gallery: {
    splashImage1: string;
    splashImage2: string;
    splashImage3: string;
  };
  sales: SalesSettings;
}