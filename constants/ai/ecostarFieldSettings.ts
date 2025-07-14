import { Type } from '@google/genai';
import { EcoStarFieldSettings } from '../../types';

const ecoStarSectionSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise, well-written narrative of 2-3 paragraphs suitable for a grant application, focusing on the project's relationship with this section. You MUST use the provided chat history as the primary source for this summary." },
        keyConsiderations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 important factors, potential challenges, or strengths related to this section, derived from the chat history. Each item must be a complete sentence." },
        followUpQuestions: { 
            type: Type.ARRAY, 
            description: "A list of 3-5 probing questions to help the user think more deeply about this aspect of their project. For each question, you MUST also provide a brief, insightful sample answer based on the project context.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "A thought-provoking follow-up question." },
                    sampleAnswer: { type: Type.STRING, description: "A concise, helpful sample answer to the question, based on the project's context."}
                },
                required: ['question', 'sampleAnswer']
            }
        }
    },
    required: ['summary', 'keyConsiderations', 'followUpQuestions']
};

export const ECOSTAR_FIELD_SETTINGS: EcoStarFieldSettings = {
    Environment: {
        prompt: `Generate a JSON report for the "Environment" section. This refers to the specific context, place, and time of the project (social, cultural, political, economic, and natural).`,
        schema: ecoStarSectionSchema,
    },
    Customer: {
        prompt: `Generate a JSON report for the "Customer" section. This refers to who the project is creating value for, including direct audiences, active participants, the broader community, and even non-human entities like ecosystems.`,
        schema: ecoStarSectionSchema,
    },
    Opportunity: {
        prompt: `Generate a JSON report for the "Opportunity" section. This refers to why the project is important *right now*—its timeliness and urgency.`,
        schema: ecoStarSectionSchema,
    },
    Solution: {
        prompt: `Generate a JSON report for the "Solution" section. This refers to the specific artistic offering (e.g., a performance, workshop, exhibition) that addresses the identified need or opportunity.`,
        schema: ecoStarSectionSchema,
    },
    Team: {
        prompt: `Generate a JSON report for the "Team" section. This refers to who is bringing the project to life and why they are the right people for the job, considering their skills, experience, and community connections.`,
        schema: ecoStarSectionSchema,
    },
    Advantage: {
        prompt: `Generate a JSON report for the "Advantage" section. This refers to what makes the project's approach unique or more effective than alternatives—its "secret sauce."`,
        schema: ecoStarSectionSchema,
    },
    Results: {
        prompt: `Generate a JSON report for the "Results" section. This refers to the tangible and intangible outcomes the project aims to achieve.`,
        schema: ecoStarSectionSchema,
    },
};
