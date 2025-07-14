
import { AppSettings } from '../../types.ts';
import { AI_PERSONAS } from './personas.constants.ts';
import { PROJECT_GENERATOR_FIELD_INSTRUCTIONS } from './projectGeneratorField.instructions.ts';

export const initialSettings: AppSettings = {
  general: {
    collectiveName: 'The Arts Incubator',
    defaultCurrency: 'CAD',
    dateFormat: 'YYYY-MM-DD',
    supabaseUrl: 'https://vfbmiuyamdbquhvhuifb.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmYm1pdXlhbWRicXVodmh1aWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjc2OTksImV4cCI6MjA2NzYwMzY5OX0.Fv1YUVAhPmTNxoJ9G05sTyQeig0qnD26q1ES6ChsiY8',
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
    plainTextMode: false,
    personas: AI_PERSONAS,
    projectGeneratorFieldInstructions: PROJECT_GENERATOR_FIELD_INSTRUCTIONS,
    personaTemplates: {
      main: [], projects: [], members: [], tasks: [], budget: [], reports: [], media: [],
      ecostar: [], projectGenerator: [], interestCompatibility: [], sdgAlignment: [], recreation: [],
      taskGenerator: []
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
