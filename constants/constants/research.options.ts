


import { ResearchPlanSection } from '../types';

export const RESEARCH_PLAN_SECTIONS: { key: ResearchPlanSection; label: string; wordLimit: number }[] = [
    { key: 'titleAndOverview', label: 'Overview', wordLimit: 300 },
    { key: 'researchQuestions', label: 'Research Questions and Objectives', wordLimit: 400 },
    { key: 'communityEngagement', label: 'Community Engagement and Context', wordLimit: 500 },
    { key: 'designAndMethodology', label: 'Research Design and Methodology', wordLimit: 1000 },
    { key: 'artisticAlignmentAndDevelopment', label: 'Artistic Alignment & Development', wordLimit: 1000 },
    { key: 'ethicalConsiderations', label: 'Ethical Considerations and Protocols', wordLimit: 750 },
    { key: 'knowledgeMobilization', label: 'Knowledge Mobilization and Dissemination', wordLimit: 500 },
    { key: 'projectManagement', label: 'Project Management and Timeline', wordLimit: 500 },
    { key: 'sustainability', label: 'Sustainability', wordLimit: 800 },
    { key: 'projectEvaluation', label: 'Project Evaluation', wordLimit: 400 },
];


export const EPISTEMOLOGY_OPTIONS = [
    { value: 'Indigenous Epistemologies', label: 'Indigenous Epistemologies' },
    { value: 'Participatory/Experiential Epistemology', label: 'Participatory/Experiential Epistemology' },
    { value: 'Critical Epistemology', label: 'Critical Epistemology' },
    { value: 'Feminist Epistemology', label: 'Feminist Epistemology' },
    { value: 'Queer Epistemology', label: 'Queer Epistemology' },
    { value: 'Decolonial Epistemology', label: 'Decolonial Epistemology' },
    { value: 'Phenomenological Epistemology', label: 'Phenomenological Epistemology' },
    { value: 'Social Epistemology', label: 'Social Epistemology' },
    { value: 'Pragmatist Epistemology', label: 'Pragmatist Epistemology' },
    { value: 'Realist Epistemology', label: 'Realist Epistemology' },
    { value: 'Post-Positivist Epistemology', label: 'Post-Positivist Epistemology' },
    { value: 'Constructivist Epistemology', label: 'Constructivist Epistemology' },
    { value: 'Other', label: 'Other' },
];

export const PEDAGOGY_OPTIONS = [
    { value: 'Popular Education', label: 'Popular Education' },
    { value: 'Experiential Learning', label: 'Experiential Learning' },
    { value: 'Transformative Learning', label: 'Transformative Learning' },
    { value: 'Place-Based Learning', label: 'Place-Based Learning' },
    { value: 'Culturally Responsive Pedagogy', label: 'Culturally Responsive Pedagogy' },
    { value: 'Intergenerational Learning', label: 'Intergenerational Learning' },
    { value: 'Peer-to-Peer Learning', label: 'Peer-to-Peer Learning' },
    { value: 'Inquiry-Based Learning', label: 'Inquiry-Based Learning' },
    { value: 'Problem-Based Learning (PBL)', label: 'Problem-Based Learning (PBL)' },
    { value: 'Andragogy (Adult Learning Principles)', label: 'Andragogy (Adult Learning Principles)' },
    { value: 'Gamification', label: 'Gamification' },
    { value: 'Open Pedagogy', label: 'Open Pedagogy' },
    { value: 'Other', label: 'Other' },
];

export const METHODOLOGY_OPTIONS = [
    { value: 'Participatory Action Research (PAR)', label: 'Participatory Action Research (PAR)' },
    { value: 'Community-Based Participatory Research (CBPR)', label: 'Community-Based Participatory Research (CBPR)' },
    { value: 'Indigenous Methodologies', label: 'Indigenous Methodologies' },
    { value: 'Feminist Methodologies', label: 'Feminist Methodologies' },
    { value: 'Arts-Based Research', label: 'Arts-Based Research' },
    { value: 'Oral History/Knowledge Transmission', label: 'Oral History/Knowledge Transmission' },
    { value: 'Narrative Inquiry', label: 'Narrative Inquiry' },
    { value: 'Grounded Theory', label: 'Grounded Theory' },
    { value: 'Ethnography', label: 'Ethnography' },
    { value: 'Case Study', label: 'Case Study' },
    { value: 'Discourse Analysis', label: 'Discourse Analysis' },
    { value: 'Participatory Visual Methods', label: 'Participatory Visual Methods' },
    { value: 'Archival Research/Document Analysis', label: 'Archival Research/Document Analysis' },
    { value: 'Netnography', label: 'Netnography' },
    { value: 'Action Research', label: 'Action Research' },
    { value: 'Evaluation Research', label: 'Evaluation Research' },
    { value: 'Community Mapping/Asset-Based Community Development (ABCD)', label: 'Community Mapping/Asset-Based Community Development (ABCD)' },
    { value: 'Design-Based Research (DBR)', label: 'Design-Based Research (DBR)' },
    { value: 'Other', label: 'Other' },
];

export const MIXED_METHOD_OPTIONS = [
    { value: 'Convergent Parallel Design', label: 'Convergent Parallel Design' },
    { value: 'Explanatory Sequential Design', label: 'Explanatory Sequential Design' },
    { value: 'Exploratory Sequential Design', label: 'Exploratory Sequential Design' },
    { value: 'Embedded Design', label: 'Embedded Design' },
    { value: 'Transformative Design', label: 'Transformative Design' },
    { value: 'Multistage Design', label: 'Multistage Design' },
    { value: 'Intervention Design', label: 'Intervention Design' },
    { value: 'Case Study Design', label: 'Case Study Design' },
    { value: 'Other', label: 'Other' },
];