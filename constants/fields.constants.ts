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

export const PROJECT_GENERATOR_ENHANCE_INSTRUCTIONS: Record<string, string> = {
    projectTitle: 'You are an expert copywriter. Take the following project title and enhance it. Make it more evocative, professional, and memorable, while keeping it concise (under 15 words). Provide 3 enhanced options. Respond ONLY with a valid JSON object like: { "suggestions": ["Option 1", "Option 2", "Option 3"] }.',
    background: 'You are an expert editor and grant writer. Take the following background narrative and enhance it. Your task is to expand, tighten, and professionalize the text. Add more detail, improve the flow and sentence structure, and use more compelling vocabulary to create a stronger narrative. Aim to use as much of the allowable 350-word limit as possible. The output must be plain text with no markdown, headings, or lists. Paragraphs should be separated by double newlines (\\n\\n). Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced narrative as a single string."] }.',
    projectDescription: 'You are an expert grant writer. Take the following project description and enhance it. Your task is to expand on the ideas, making the description more persuasive, clear, and impactful for a grant jury. Aim to use as much of the allowable 500-word limit as possible. Ensure it effectively answers: what, why, and how. The output must be plain text with no markdown, headings, or lists. Paragraphs should be separated by double newlines (\\n\\n). Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced description as a single string."] }.',
    audience: 'You are an expert editor. Take the following audience description and enhance it for clarity and impact. Expand on the ideas to clearly identify the target audience and outreach plan. The response must be a single paragraph of plain text under the 100-word limit. Do not use markdown, headings, or lists. Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced description as a single string."] }.',
    paymentAndConditions: 'Based on the project context, generate a detailed 250-word statement explaining how artist fees are determined and how safe working conditions will be ensured for all participants. Reference CARFAC fee schedules if appropriate. The response must be plain text, broken into multiple paragraphs separated by double newlines (\\n\\n). Do not use markdown, headings, or lists. Respond ONLY with a valid JSON object like: { "suggestions": ["Full statement text as a single string."] }.',
    schedule: 'Based on the project context, generate a clear project schedule narrative that is as close to the 200-word limit as possible. Outline key steps, important dates, and potential venues or presentation formats in a paragraph format. The response must be plain text without markdown, headings, or lists. Respond ONLY with a valid JSON object like: { "suggestions": ["Full schedule narrative as a single string."] }.',
    culturalIntegrity: 'Based on the project context, write a 300-word statement describing the project\'s relationship to the cultures or communities represented and how the work will be approached with cultural integrity and respect. The response must be plain text, broken into multiple paragraphs separated by double newlines (\\n\\n). Do not use markdown, headings, or lists. Respond ONLY with a valid JSON object like: { "suggestions": ["Full statement text as a single string."] }.',
    communityImpact: 'Based on the project context, write a 200-word statement describing the project\'s potential impact on the community and how it might strengthen community connections. The response must be a full paragraph of plain text without markdown, headings, or lists. Respond ONLY with a valid JSON object like: { "suggestions": ["Full statement text as a single string."] }.',
    organizationalRationale: 'For an organizational applicant, write a 200-word statement explaining how this project will strengthen the organization’s ability to fulfill its mandate, mission, and values. The response must be a full paragraph of plain text without markdown, headings, or lists. Respond ONLY with a valid JSON object like: { "suggestions": ["Full rationale as a single string."] }.',
    artisticDevelopment: 'For an individual or group applicant, write a 200-word statement explaining how this project will contribute to their artistic growth and development. The response must be a full paragraph of plain text without markdown, headings, or lists. Respond ONLY with a valid JSON object like: { "suggestions": ["Full statement text as a single string."] }.',
    additionalInfo: 'You are an expert editor. Take the following text provided for the "Additional Information" section and enhance it for clarity, conciseness, and impact, aiming to fill the 250-word limit. Ensure it provides essential, complementary information not covered elsewhere in the application. The output must be plain text with no markdown, headings, or lists. Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced text as a single string."] }.',
    tasks: 'Based on the provided project context, generate a detailed list of actionable tasks to bring this project to life. Your response MUST be ONLY a valid JSON array of objects, where each object is: { "title": string; "description": string; "estimatedHours": number; }.',
};

export const FRAMEWORK_SECTIONS: { key: keyof Omit<RecreationFrameworkReport, 'id' | 'projectId' | 'createdAt' | 'notes' | 'fullReportText'>, label: string }[] = [
    { key: 'executiveSummary', label: 'Executive Summary' },
    { key: 'activeLiving', label: 'Active Living' },
    { key: 'inclusionAndAccess', label: 'Inclusion and Access' },
    { key: 'connectingPeopleWithNature', label: 'Connecting People with Nature' },
    { key: 'supportiveEnvironments', label: 'Supportive Environments' },
    { key: 'recreationCapacity', label: 'Recreation Capacity' },
    { key: 'closingSection', label: 'Closing Section' }
];
