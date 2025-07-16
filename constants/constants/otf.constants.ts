
import { OtfApplication } from '../types';

export const SECTOR_OPTIONS = [
    { value: '', label: 'Select a sector...' },
    { value: 'Arts/Culture', label: 'Arts/Culture' },
    { value: 'Environment', label: 'Environment' },
    { value: 'Human and Social Services', label: 'Human and Social Services' },
    { value: 'Sports/Recreation', label: 'Sports/Recreation' },
];

export const BILINGUAL_MANDATE_OPTIONS = [
    { value: '', label: 'Select a mandate...' },
    { value: 'Agency designated under the French Language Services Act', label: 'Agency designated under the French Language Services Act' },
    { value: 'Area designated under the French Language Services Act', label: 'Area designated under the French Language Services Act' },
    { value: 'Mandated by Board of Directors and/or Funder', label: 'Mandated by Board of Directors and/or Funder' },
    { value: 'Non-mandated but serving Francophone population', label: 'Non-mandated but serving Francophone population' },
];

export const POPULATION_PERCENTAGE_OPTIONS = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10].map(p => ({ value: p.toString(), label: `${p}%` }));

export const POPULATION_LANGUAGE_OPTIONS = [
    { value: 'Bilingual (French/English)', label: 'Bilingual (French/English)' },
    { value: 'Francophone (and offered services in French)', label: 'Francophone (and offered services in French)' },
    { value: 'Other Language excluding English or French', label: 'Other Language excluding English or French' },
    { value: 'General Population', label: 'General Population' },
];

export const POPULATION_GENDER_OPTIONS = [
    { value: 'Non-binary', label: 'Non-binary' },
    { value: 'Trans-Men/Trans-Women', label: 'Trans-Men/Trans-Women' },
    { value: 'Men/Boys', label: 'Men/Boys' },
    { value: 'Women/Girls', label: 'Women/Girls' },
    { value: 'General Population', label: 'General Population' },
];

export const POPULATION_LIVED_EXPERIENCE_OPTIONS = [
    { value: 'People living in low income', label: 'People living in low income' },
    { value: 'People who are newcomers/refugees', label: 'People who are newcomers/refugees' },
    { value: 'People living with disabilities', label: 'People living with disabilities' },
    { value: 'People living with mental health challenges/addiction', label: 'People living with mental health challenges/addiction' },
    { value: 'General population', label: 'General Population' },
];

export const POPULATION_IDENTITY_OPTIONS = [
    { value: 'Black', label: 'Black' },
    { value: 'Indigenous', label: 'Indigenous' },
    { value: '2SLGBTQIA+', label: '2SLGBTQIA+' },
    { value: 'Other racialized groups', label: 'Other racialized groups' },
    { value: 'General Population', label: 'General Population' },
];

export const LEADERSHIP_REFLECTION_OPTIONS = [
    { value: 'Yes', label: 'Yes' },
    { value: 'Somewhat', label: 'Somewhat' },
    { value: 'No', label: 'No' },
    { value: 'Unsure', label: 'Unsure' },
];

export const OTF_SUPPORTS_OPTIONS = [
    { value: 'Support Centre', label: 'Support Centre' },
    { value: 'Website', label: 'Website' },
    { value: 'Webinar', label: 'Webinar' },
    { value: 'Coaching call', label: 'Coaching call' },
    { value: 'None of the above', label: 'None of the above' },
];

export const PROJ_AGE_OPTIONS = [
    { value: 'Children up to 12 years', label: 'Children up to 12 years' },
    { value: 'Youth (13-24)', label: 'Youth (13-24)' },
    { value: 'Adults (25-64)', label: 'Adults (25-64)' },
    { value: 'Seniors (65 and over)', label: 'Seniors (65 and over)' },
    { value: 'General population (all age groups)', label: 'General population (all age groups)' },
];

export const COMMUNITY_SIZE_OPTIONS = [
    { value: 'Rural or Small Communities (20,000 or less)', label: 'Rural or Small Communities (20,000 or less)' },
    { value: 'Mid-sized Communities (20,001 - 100,000)', label: 'Mid-sized Communities (20,001 - 100,000)' },
    { value: 'Urban Centres and Metropolitan Suburbs (100,000+)', label: 'Urban Centres and Metropolitan Suburbs (100,000+)' },
];

export const TERM_OPTIONS = [
    { value: '6', label: '6 months' },
    { value: '12', label: '12 months' },
];

export const FUNDING_PRIORITY_OPTIONS = [
    { value: 'Foster physically active lifestyles', label: 'Foster physically active lifestyles' },
    { value: 'Support participation in the conservation and restoration of the environment.', label: 'Support participation in the conservation and restoration of the environment.' },
    { value: 'Enrich lives through arts, culture, and heritage', label: 'Enrich lives through arts, culture, and heritage' },
    { value: 'Help people build stronger connections and a deeper sense of belonging in their community', label: 'Help people build stronger connections and a deeper sense of belonging in their community' },
    { value: 'Support youth to develop stronger social, emotional, leadership skills', label: 'Support youth to develop stronger social, emotional, leadership skills' },
    { value: 'Enable economically vulnerable people to meet their basic needs and/or strengthen their financial stability', label: 'Enable economically vulnerable people to meet their basic needs and/or strengthen their financial stability' },
];

export const OBJECTIVE_OPTIONS = [
    { value: 'Create or adapt organizational strategy to build resilience and capacity to deliver programs and services.', label: 'Create or adapt organizational strategy to build resilience and capacity to deliver programs and services.' },
    { value: 'Prepare for the future by developing or adapting digital technology to deliver programs and services.', label: 'Prepare for the future by developing or adapting digital technology to deliver programs and services.' },
    { value: 'Enhance staff and/or volunteer skills to deliver programs and services.', label: 'Enhance staff and/or volunteer skills to deliver programs and services.' },
    { value: 'Design and/or pilot an innovative program or service to address a community need.', label: 'Design and/or pilot an innovative program or service to address a community need.' },
];

export const OTF_BUDGET_CATEGORIES = [
    { value: '', label: 'Select category...' },
    { value: 'Direct Personnel Costs', label: 'Direct Personnel Costs' },
    { value: 'Direct Non-Personnel Costs – Purchased Service', label: 'Direct Non-Personnel Costs – Purchased Service' },
    { value: 'Direct Non-Personnel Costs – Workshops/Meetings', label: 'Direct Non-Personnel Costs – Workshops/Meetings' },
    { value: 'Direct Non-Personnel Costs – Supplies and Materials', label: 'Direct Non-Personnel Costs – Supplies and Materials' },
    { value: 'Direct Non-Personnel Costs – Non-fixed Equipment', label: 'Direct Non-Personnel Costs – Non-fixed Equipment' },
    { value: 'Direct Non-Personnel Costs – Travel', label: 'Direct Non-Personnel Costs – Travel' },
    { value: 'Overhead and Administration Costs', label: 'Overhead and Administration Costs' },
];