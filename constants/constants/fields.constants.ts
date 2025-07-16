
import { AssessableField, FormData, RecreationFrameworkReport } from '../types.ts';

// Budget
export const REVENUE_FIELDS = {
    grants: [
        { key: 'grant1', label: 'Manitoba Arts Council' },
        { key: 'grant2', label: 'Canada Council for the Arts' },
        { key: 'grant3', label: 'Winnipeg Arts Council' },
    ],
    tickets: [], // Handled separately
    sales: [
        { key: 'sales1', label: 'Artwork Sales' },
        { key: 'sales2', label: 'Merchandise' },
    ],
    fundraising: [
        { key: 'fundraising1', label: 'Donations' },
        { key: 'fundraising2', label: 'Sponsorship' },
    ],
    contributions: [
        { key: 'contrib1', label: 'Applicant Cash Contribution' },
        { key: 'contrib2', label: 'In-kind Contributions' },
    ],
};

export const EXPENSE_FIELDS = {
    professionalFees: [
        { key: 'fee1', label: 'Artist Fees' },
        { key: 'fee2', label: 'Technician Fees' },
    ],
    travel: [
        { key: 'travel1', label: 'Accommodation' },
        { key: 'travel2', label: 'Airfare' },
        { key: 'travel3', label: 'Per Diems' },
    ],
    production: [
        { key: 'prod1', label: 'Venue Rental' },
        { key: 'prod2', label: 'Equipment Rental' },
        { key: 'prod3', label: 'Materials & Supplies' },
    ],
    administration: [
        { key: 'admin1', label: 'Office Supplies' },
        { key: 'admin2', label: 'Marketing' },
    ],
    research: [
        { key: 'research1', label: 'Consultant Fees' }
    ],
    professionalDevelopment: [
        { key: 'pd1', label: 'Course Fees' }
    ],
};


// Tools
export const PROJECT_ASSESSABLE_FIELDS: AssessableField[] = [
    { key: 'projectTitle', label: 'Project Title', wordLimit: 15 },
    { key: 'background', label: 'Background', wordLimit: 350 },
    { key: 'projectDescription', label: 'Project Description', wordLimit: 500 },
    { key: 'audience', label: 'Audience & Participants', wordLimit: 100 },
    { key: 'paymentAndConditions', label: 'Payment & Conditions', wordLimit: 250 },
    { key: 'schedule', label: 'Schedule', wordLimit: 750 },
    { key: 'culturalIntegrity', label: 'Cultural Integrity', wordLimit: 300 },
    { key: 'communityImpact', label: 'Community Impact', wordLimit: 200 },
    { key: 'organizationalRationale', label: 'Organizational Rationale', wordLimit: 200 },
    { key: 'artisticDevelopment', label: 'Artistic Development', wordLimit: 200 },
    { key: 'artisticDisciplinesAndGenres', label: 'Disciplines & Genres', wordLimit: 0 }
];

export const GENERATOR_FIELDS: { key: keyof FormData, label: string, wordLimit: number }[] = [
    { key: 'projectTitle', label: 'Project Title', wordLimit: 15 },
    { key: 'background', label: 'Background', wordLimit: 350 },
    { key: 'projectDescription', label: 'Project Description', wordLimit: 500 },
    { key: 'audience', label: 'Audience', wordLimit: 100 },
    { key: 'paymentAndConditions', label: 'Payment and working conditions', wordLimit: 250 },
    { key: 'schedule', label: 'Schedule', wordLimit: 200 },
    { key: 'culturalIntegrity', label: 'Cultural Integrity', wordLimit: 300 },
    { key: 'communityImpact', label: 'Community Impact', wordLimit: 200 },
    { key: 'organizationalRationale', label: 'Organizational Rationale', wordLimit: 200 },
    { key: 'artisticDevelopment', label: 'Artistic Development', wordLimit: 200 },
    { key: 'additionalInfo', label: 'Additional Information', wordLimit: 250 },
];

export const FRAMEWORK_SECTIONS: { key: keyof Omit<RecreationFrameworkReport, 'id' | 'projectId' | 'createdAt' | 'notes' | 'fullReportText'>, label: string }[] = [
    { key: 'executiveSummary', label: 'Executive Summary' },
    { key: 'activeLiving', label: 'Active Living' },
    { key: 'inclusionAndAccess', label: 'Inclusion and Access' },
    { key: 'connectingPeopleWithNature', label: 'Connecting People with Nature' },
    { key: 'supportiveEnvironments', label: 'Supportive Environments' },
    { key: 'recreationCapacity', label: 'Recreation Capacity' },
    { key: 'closingSection', label: 'Closing Section' }
];
