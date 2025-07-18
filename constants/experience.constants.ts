
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
    summary: '',
    responsibilities: [],
    hardSkills: [],
    softSkills: [],
    qualifications: [],
    resumePoints: [],
    linkedinSummary: '',
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
        summary: 'A senior technical and design role focused on developing, maintaining, and enhancing a mission-driven web application for the arts sector. This role combines deep expertise in modern frontend technologies (React, TypeScript) with a strong focus on user experience (UX) and user interface (UI) design to ensure the platform is accessible, intuitive, and powerful for non-technical users.',
        responsibilities: [
            'Architect and implement new features using React, TypeScript, and modern frontend frameworks.',
            'Design and refine user interfaces (UI) to ensure clarity, accessibility (ARIA), and a seamless user experience.',
            'Integrate and fine-tune Google\'s Gemini AI API to create specialized AI assistants for administrative and creative tasks.',
            'Manage and extend the Supabase database schema, including writing SQL and setting Row Level Security (RLS) policies.',
            'Ensure the application is performant, responsive, and cross-browser compatible.',
            'Collaborate on the platform\'s strategic direction, providing technical insights to inform the development roadmap.'
        ],
        hardSkills: ['React', 'TypeScript', 'JavaScript (ES6+)', 'Supabase', 'SQL', 'CSS/TailwindCSS', 'UI/UX Design', 'API Integration (Gemini)', 'Git/Version Control'],
        softSkills: ['Problem Solving', 'Strategic Thinking', 'User Empathy', 'Attention to Detail', 'Collaboration', 'Self-Direction'],
        qualifications: ['Demonstrated experience leading frontend development on complex web applications.', 'Expertise in UI/UX design principles and accessibility standards.', 'Proven ability to work with backend services like Supabase, including database schema design and RLS.'],
        resumePoints: [
            'Led the end-to-end development of new features for a mission-driven arts administration platform, utilizing React, TypeScript, and Supabase to enhance user capabilities and streamline workflows.',
            'Engineered a modular AI integration with Google\'s Gemini AI, creating specialized, context-aware assistants that reduced administrative workload for users by an estimated 40%.',
            'Designed and implemented a complete UI/UX overhaul, focusing on accessibility and intuitive design, resulting in a 60% reduction in user-reported navigational issues.'
        ],
        linkedinSummary: 'As a key contributor to the Arts Incubator digital platform, I specialized in architecting and implementing robust frontend solutions with a deep focus on user experience. My work involved leveraging React and TypeScript to build complex, data-driven interfaces, and integrating Google\'s Gemini AI to create novel, assistive tools for artists. I played a vital role in designing the Supabase database schema and ensuring the platform remained scalable, accessible, and aligned with its core mission of building capacity in the arts sector.'
    },
    {
        id: 'system_role_2',
        isSystemDefined: true,
        isEditable: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectId: null,
        memberId: null,
        title: 'Platform Contributor: Strategic Planning & Content Development',
        seniorityLevel: 'Management',
        tailoringTags: ['Arts Administration', 'Management & Leadership', 'Research & Analysis'],
        summary: 'A strategic role focused on shaping the content, functionality, and direction of the Arts Incubator platform. This role involves deep research into arts funding systems, community needs, and strategic frameworks (e.g., ECO-STAR, SDG) to guide the development of AI personas and user-facing tools that build capacity and empower artists.',
        responsibilities: [
            'Conduct in-depth research into arts funding body requirements (e.g., OAC, MAC, CCA) to inform the design of project management and reporting modules.',
            'Co-design and write the instructional prompts for specialized AI personas, translating complex strategic frameworks into actionable AI behaviors.',
            'Develop and write content for the User Guide, ensuring all features are clearly documented and accessible to non-technical users.',
            'Provide user support, gather community feedback, and synthesize insights to inform the platform\'s strategic development roadmap.',
            'Ensure the platform remains aligned with its core mission of data sovereignty, accessibility, and empowerment for northern and remote communities.'
        ],
        hardSkills: ['Strategic Analysis', 'Grant Writing', 'Technical Writing', 'User Research', 'Content Strategy', 'AI Prompt Engineering'],
        softSkills: ['Systems Thinking', 'Communication', 'Empathy', 'Instructional Design', 'Stakeholder Management', 'Visioning'],
        qualifications: ['Extensive experience in arts administration, grant writing, and project management.', 'Demonstrated ability to translate complex strategic concepts into clear, accessible content.', 'Experience in user-centered design and gathering community feedback.'],
        resumePoints: [
            'Co-led the strategic design of an arts administration platform by reverse-engineering public funding systems, ensuring its features directly addressed the needs of artists seeking grants.',
            'Authored the complete instructional framework for a suite of specialized AI assistants, translating complex models like ECO-STAR and UN SDGs into effective, context-aware AI personas.',
            'Developed a comprehensive, 30-part User Guide, creating accessible documentation that increased user adoption and reduced support requests.'
        ],
        linkedinSummary: 'As a strategic lead for the Arts Incubator platform, I guided its functional and content development to ensure it met the real-world needs of artists and arts administrators. My work involved researching funding ecosystems to inform feature design, and co-creating the instructional DNA for the platform\'s suite of specialized AI assistants. I am passionate about building tools that empower creative communities through thoughtful design, clear communication, and a commitment to user-centered principles.'
    }
];
