
import { JobDescription } from '../types';

export const SENIORITY_LEVELS = [
    { value: 'Entry-Level', label: 'Entry-Level' },
    { value: 'Mid-Career', label: 'Mid-Career' },
    { value: 'Senior/Lead', label: 'Senior / Lead' },
    { value: 'Management', label: 'Management' },
];

export const TAILORING_TAGS = [
    { value: 'Climate & Environment', label: 'Climate & Environment' },
    { value: 'Communications & Marketing', label: 'Communications & Marketing' },
    { value: 'Arts Administration', label: 'Arts Administration' },
    { value: 'Entrepreneurship & Business', label: 'Entrepreneurship & Business' },
    { value: 'Management & Leadership', label: 'Management & Leadership' },
    { value: 'Technology & AI', label: 'Technology & AI' },
    { value: 'Community Engagement', label: 'Community Engagement' },
    { value: 'Research & Analysis', label: 'Research & Analysis' },
    { value: 'Education & Facilitation', label: 'Education & Facilitation' },
    { value: 'Event Production', label: 'Event Production' },
    { value: 'Financial Management', label: 'Financial Management' },
    { value: 'Transferable Skills Focus', label: 'Focus on Transferable Skills' },
];

export const initialJobDescription: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'> = {
    isSystemDefined: false,
    isEditable: true,
    projectId: null,
    memberId: null,
    title: '',
    seniorityLevel: 'Mid-Career',
    tailoringTags: [],
    projectTagline: '',
    projectSummary: '',
    summary: '',
    responsibilities: [],
    hardSkills: '',
    softSkills: '',
    qualifications: [],
    resumePoints: [],
    linkedinSummary: '',
    aboutOrg: '',
    volunteerBenefits: '',
    timeCommitment: '',
    applicationProcess: '',
    callToAction: '',
};

export const PLATFORM_CONTRIBUTOR_ROLES: JobDescription[] = [
    {
        id: 'system_role_1',
        isSystemDefined: true,
        isEditable: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectId: null,
        memberId: null,
        title: 'Platform Contributor: Frontend Development & UX/UI Design',
        seniorityLevel: 'Senior/Lead',
        tailoringTags: ['Technology & AI'],
        projectTagline: 'An all-in-one digital workspace to empower artists and arts collectives.',
        projectSummary: 'The Arts Incubator is a mission-driven platform designed to directly address the systemic challenges faced by independent artists and small arts collectives, particularly those in northern, rural, and remote communities. Its goal is to build capacity, reduce administrative burden, and empower artists to focus on what truly matters: their creative work.',
        summary: 'A senior technical and design role focused on developing, maintaining, and enhancing a mission-driven web application for the arts sector. This role combines deep expertise in modern frontend technologies (React, TypeScript) with a strong focus on user experience (UX) and user interface (UI) design to ensure the platform is accessible, intuitive, and powerful for non-technical users.',
        responsibilities: [
            'Architect and implement new features using React, TypeScript, and modern frontend frameworks.',
            'Design and refine user interfaces (UI) to ensure clarity, accessibility (ARIA), and a seamless user experience.',
            'Integrate and fine-tune Google\'s Gemini AI API to create specialized AI assistants for administrative and creative tasks.',
            'Manage and extend the Supabase database schema, including writing SQL and setting Row Level Security (RLS) policies.',
            'Ensure the application is performant, responsive, and cross-browser compatible.',
            'Collaborate on the platform\'s strategic direction, providing technical insights to inform the development roadmap.'
        ],
        hardSkills: 'Possesses expert-level proficiency in modern frontend technologies including React and TypeScript. Demonstrates strong capabilities in UI/UX design, Supabase database management with SQL, and integrating APIs like Google Gemini. Proficient in version control with Git.',
        softSkills: 'An excellent problem solver with a strategic mindset and a strong sense of user empathy. Highly collaborative, self-directed, and pays meticulous attention to detail to deliver high-quality, user-centric solutions.',
        qualifications: ['Demonstrated experience leading frontend development on complex web applications.', 'Expertise in UI/UX design principles and accessibility standards.', 'Proven ability to work with backend services like Supabase, including database schema design and RLS.'],
        resumePoints: [
            'Led the end-to-end development of new features for a mission-driven arts administration platform, utilizing React, TypeScript, and Supabase to enhance user capabilities and streamline workflows.',
            'Engineered a modular AI integration with Google\'s Gemini AI, creating specialized, context-aware assistants that reduced administrative workload for users by an estimated 40%.',
            'Designed and implemented a complete UI/UX overhaul, focusing on accessibility and intuitive design, resulting in a 60% reduction in user-reported navigational issues.'
        ],
        linkedinSummary: 'As a key contributor to the Arts Incubator digital workspace, I specialize in architecting and implementing user-centric features that bridge the gap between technology and the arts. My work involves full-stack development with a focus on frontend performance, intuitive UI/UX, and the strategic integration of AI to empower artists and streamline arts administration.',
        volunteerBenefits: "Contribute to a mission-driven open-source project for the arts sector, gain experience with modern web technologies (React, TypeScript, Supabase) and AI integration (Google Gemini), and collaborate with a passionate team of artists and developers."
    }
];
