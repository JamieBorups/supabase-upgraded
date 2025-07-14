import { AssessableField, FormData } from '../types.ts';

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
    audience: 'You are an expert editor. Take the following audience description and enhance it for clarity and impact. Expand on the ideas to clearly identify the target audience and the outreach strategy, aiming to use as much of the 100-word limit as possible. The output must be plain text. Respond ONLY with a valid JSON object like: { "suggestions": ["Enhanced audience description as a single string."] }.',
    paymentAndConditions: 'You are an expert editor specializing in arts administration. Take the following text about payment and working conditions and enhance it. Expand on the points to make it more professional and clear, ensuring it meets the standards for a formal grant application and uses the 250-word limit effectively. The output must be plain text with no markdown, headings, or lists. Paragraphs should be separated by double newlines (\\n\\n). Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced text as a single string."] }.',
    schedule: 'You are an expert editor. Take the following project schedule and rewrite it into a clear and concise narrative paragraph that is as close to the 200-word limit as possible. The output must be plain text. Respond ONLY with a valid JSON object like: { "suggestions": ["Enhanced schedule narrative as a single string."] }.',
    culturalIntegrity: 'You are an expert editor with a specialization in cultural sensitivity and grant writing. Take the following statement on cultural integrity and enhance it. Expand on the ideas to make it more respectful, clear, and comprehensive, using the 300-word limit. The output must be plain text with no markdown, headings, or lists. Paragraphs should be separated by double newlines (\\n\\n). Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced statement as a single string."] }.',
    communityImpact: 'You are an expert editor. Take the following community impact statement and enhance it. Make it more compelling and specific by expanding on the points, aiming to fill the 200-word limit. The output must be plain text with no markdown, headings, or lists. Paragraphs should be separated by double newlines (\\n\\n). Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced statement as a single string."] }.',
    organizationalRationale: 'You are an expert editor. Take the following organizational rationale and enhance it to be more strategic and persuasive. Expand on the rationale to effectively use the 200-word limit. The output must be plain text with no markdown, headings, or lists. Paragraphs should be separated by double newlines (\\n\\n). Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced rationale as a single string."] }.',
    artisticDevelopment: 'You are an expert editor. Take the following artistic development statement and enhance it to be more compelling and reflective. Expand on the ideas to make full use of the 200-word limit. The output must be plain text with no markdown, headings, or lists. Paragraphs should be separated by double newlines (\\n\\n). Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced statement as a single string."] }.',
    additionalInfo: 'You are an expert editor. Take the following text provided for the "Additional Information" section and enhance it for clarity, conciseness, and impact, aiming to fill the 250-word limit. Ensure it provides essential, complementary information not covered elsewhere in the application. The output must be plain text with no markdown, headings, or lists. Respond ONLY with a valid JSON object like: { "suggestions": ["Full enhanced text as a single string."] }.',
};