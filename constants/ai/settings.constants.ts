import { AppSettings } from '../../types.ts';
import { AI_PERSONAS } from './personas.constants.ts';
import { PROJECT_GENERATOR_FIELD_INSTRUCTIONS } from './projectGeneratorField.instructions.ts';
import { OTF_FIELD_INSTRUCTIONS } from './otf.constants.ts';
import { NOHFC_FIELD_INSTRUCTIONS } from './nohfc.constants.ts';
import { ECOSTAR_FIELD_SETTINGS } from './ecostarFieldSettings.ts';
import { INTEREST_COMPATIBILITY_SECTION_SETTINGS } from './interestCompatibility.constants.ts';
import { RESEARCH_PLAN_SECTION_SETTINGS } from './researchPlanSection.instructions.ts';

export const initialSettings: AppSettings = {
  general: {
    collectiveName: 'The Arts Incubator',
    defaultCurrency: 'CAD',
    dateFormat: 'YYYY-MM-DD',
    supabaseUrl: 'https://vfbmiuyamdbquhvhuifb.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmYm1pdXlhbWRicXVodmh1aWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjc2OTksImV4cCI6MjA2NzYwMzY5OX0.Fv1YUVAhPmTNxoJ9G05sTyQeig0qnD26q1ES6ChsiY8',
    organizationalDescription: 'The Arts Incubator is a collective dedicated to fostering artistic innovation and community engagement through collaborative projects and capacity-building initiatives.',
    mission: 'To empower artists and arts collectives by providing tools, resources, and frameworks that reduce administrative burden and unlock creative potential.',
    vision: 'A thriving, resilient, and decentralized arts ecosystem where all artists have the capacity to bring their visions to life.',
    callToAction: 'Interested in contributing your skills to a mission-driven arts project? We are always looking for passionate volunteers. Apply now to be part of our community!',
  },
  theme: {
    // Brand
    primary: '#0d9488', // teal-600
    primaryHover: '#0f766e', // teal-700
    
    // Surfaces
    surfacePage: '#f8fafc', // slate-50
    surfaceCard: '#ffffff', // white
    surfaceMuted: '#f1f5f9', // slate-100

    // Header
    headerBg: '#1e293b', // slate-800
    headerText: '#ffffff', // white
    headerTextHover: '#e2e8f0', // slate-200
    headerNavText: '#cbd5e1', // slate-300
    headerNavTextHover: '#ffffff', // white
    headerNavTextActive: '#ffffff', // white
    headerNavBorderActive: '#5eead4', // teal-300

    // Text
    textDefault: '#334155', // slate-700
    textMuted: '#64748b', // slate-500
    textHeading: '#0f172a', // slate-900
    textOnPrimary: '#ffffff', // white
    textLink: '#0d9488', // teal-600

    // Borders
    borderSubtle: '#e2e8f0', // slate-200
    borderDefault: '#cbd5e1', // slate-300
    borderFocus: '#2dd4bf', // teal-400

    // UI Elements
    buttonPrimaryBg: '#0d9488', // teal-600
    buttonPrimaryBgHover: '#0f766e', // teal-700
    buttonPrimaryText: '#ffffff', // white
    
    buttonSecondaryBg: '#ffffff', // white
    buttonSecondaryBgHover: '#f1f5f9', // slate-100
    buttonSecondaryText: '#334155', // slate-700
    buttonSecondaryBorder: '#cbd5e1', // slate-300

    buttonSpecialBg: '#8b5cf6', // violet-500
    buttonSpecialBgHover: '#7c3aed', // violet-600
    buttonSpecialText: '#ffffff', // white,

    // Semantic Colors (using Tailwind colors for reference)
    statusSuccessBg: '#ecfdf5', // green-50
    statusSuccessText: '#065f46', // green-800
    statusWarningBg: '#fffbeb', // yellow-50
    statusWarningText: '#b45309', // amber-700
    statusErrorBg: '#fef2f2', // red-50
    statusErrorText: '#991b1b', // red-800
    statusInfoBg: '#eff6ff', // blue-50
    statusInfoText: '#1e40af', // blue-800
  },
  projects: {
    statuses: [
      { id: '1', label: 'Pending', color: 'bg-slate-100 text-slate-800' },
      { id: '2', label: 'Active', color: 'bg-green-100 text-green-800' },
      { id: '3', label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
      { id: '4', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
      { id: '5', label: 'Terminated', color: 'bg-rose-100 text-rose-800' },
    ],
    disciplines: [],
  },
  members: {
    roles: [],
    availability: [],
  },
  tasks: {
    statuses: [],
    defaultWorkTypes: {
      paidRate: 25,
      inKindRate: 25,
      volunteerRate: 0,
    },
    workWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  budget: {
    revenueLabels: {},
    expenseLabels: {},
  },
  events: {
    venueTypes: [],
    defaultTicketTiers: [],
  },
  ai: {
    enabled: true,
    plainTextMode: true,
    personas: AI_PERSONAS,
    projectGeneratorFieldInstructions: PROJECT_GENERATOR_FIELD_INSTRUCTIONS,
    otfFieldSettings: OTF_FIELD_INSTRUCTIONS,
    nohfcFieldSettings: NOHFC_FIELD_INSTRUCTIONS,
    ecostarFieldSettings: ECOSTAR_FIELD_SETTINGS,
    interestCompatibilitySectionSettings: INTEREST_COMPATIBILITY_SECTION_SETTINGS,
    researchPlanSectionSettings: RESEARCH_PLAN_SECTION_SETTINGS,
    personaTemplates: {
      main: [], projects: [], members: [], tasks: [], budget: [], reports: [], media: [],
      ecostar: [], projectGenerator: [], interestCompatibility: [], sdgAlignment: [], recreation: [],
      taskGenerator: [], researchPlan: [], otf: [], nohfc: []
    }
  },
  media: {
    boilerplate: 'The Arts Incubator is a collective dedicated to fostering artistic innovation and community engagement.',
    contactInfo: 'For media inquiries, please contact:\nJane Doe\nCommunications Lead\njane.doe@example.com',
    types: [{ id: '1', label: 'News Release', color: '' }, { id: '2', label: 'Media Advisory', color: '' }],
    contactTypes: [{ id: '1', label: 'Media', color: '' }, { id: '2', label: 'Funder', color: '' }, { id: '3', label: 'Community Partner', color: '' }],
    defaultCity: '',
    defaultProvince: '',
    templates: [],
  },
  gallery: {
    splashImage1: 'https://images.unsplash.com/photo-1549492423-400259a5e551?q=80&w=2670&auto=format&fit=crop',
    splashImage2: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2670&auto=format&fit=crop',
    splashImage3: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2670&auto=format&fit=crop',
  },
  sales: {
    pstRate: 0.07,
    gstRate: 0.05,
  },
};