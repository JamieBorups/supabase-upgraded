
import { Type } from '@google/genai';

const RULE_TEMPLATE = (wordLimit: number, lowerBound: number) => `Your response MUST follow these strict rules:
1. The output must be plain text paragraphs ONLY. Use double newlines (\\n\\n) to separate paragraphs. Do not use markdown, headings, bold, italics, or lists.
2. Word count is critical. You must write as close to the ${wordLimit}-word limit as possible, and your response MUST be between ${lowerBound} and ${wordLimit} words. NEVER exceed the word count.
3. Do not include any section titles or headings in your response. Respond only with the generated text.`;

export const OTF_PROJECT_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    projectPlan: {
      type: Type.ARRAY,
      description: "A project plan with exactly 3 deliverables.",
      items: {
        type: Type.OBJECT,
        properties: {
          deliverable: { type: Type.STRING, description: "A detailed, single-sentence project deliverable." },
          keyTask: { type: Type.STRING, description: "The single most important key task for this deliverable, written as a detailed sentence." },
          timing: { type: Type.STRING, description: "The timeframe for this deliverable, written as a detailed sentence." },
        },
        required: ['deliverable', 'keyTask', 'timing']
      }
    }
  },
  required: ['projectPlan']
};


export const OTF_BUDGET_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        budgetItems: {
            type: Type.ARRAY,
            description: "A detailed project budget with a variety of relevant line items.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: {
                        type: Type.STRING,
                        description: "The budget category.",
                        enum: [
                            "Direct Personnel Costs", "Direct Non-Personnel Costs – Purchased Service",
                            "Direct Non-Personnel Costs – Workshops/Meetings", "Direct Non-Personnel Costs – Supplies and Materials",
                            "Direct Non-Personnel Costs – Non-fixed Equipment", "Direct Non-Personnel Costs – Travel",
                            "Overhead and Administration Costs"
                        ]
                    },
                    itemDescription: { type: Type.STRING, description: "A short, descriptive name for the budget item (max 10 words)." },
                    costBreakdown: { type: Type.STRING, description: "A detailed breakdown of the costs for this item (max 25 words)." },
                    requestedAmount: { type: Type.NUMBER, description: "The total amount requested for this item, rounded to the nearest dollar." }
                },
                required: ['category', 'itemDescription', 'costBreakdown', 'requestedAmount']
            }
        }
    },
    required: ['budgetItems']
};


export const OTF_FIELD_INSTRUCTIONS: Record<string, string> = {
  basicIdea: `Based on the project context and OTF guidelines, write a short, clear paragraph that summarizes the core idea or concept of the project. This will be a high-level summary that can guide the rest of the application.
${RULE_TEMPLATE(100, 90)}`,
  missionStatement: `Based on the project context and OTF guidelines, write a concise mission statement of approximately 150 words. Focus on the organization's principal mandate or overarching goal.`,
  activitiesDescription: `Based on the project context and OTF guidelines, describe the organization's typical activities, services, or programs.
${RULE_TEMPLATE(200, 190)}`,
  projDescription: `Based on the project context and OTF guidelines, describe the project, clearly stating its purpose, activities, and expected outcomes.
${RULE_TEMPLATE(200, 190)}`,
  projImpactExplanation: `Based on the project context and OTF guidelines, explain how this project will impact the organization's ability to deliver programs and services.
${RULE_TEMPLATE(200, 190)}`,
  projWhyAndWhoBenefits: `Based on the project context and OTF guidelines, explain why this project is being undertaken and who will primarily benefit. Craft a compelling narrative.
${RULE_TEMPLATE(200, 190)}`,
  projBarriersExplanation: `Based on the project context and OTF guidelines, explain how the project will help populations experiencing barriers (socio-economic, geographic, cultural, etc.). Write a detailed explanation.
${RULE_TEMPLATE(200, 190)}`,
  projFinalDescription: `Based on the project context and OTF guidelines, create a project description following this exact format: "[Grantee Operating Name] will use a $[Requested Amount] Seed grant over [Term in Months] months to [your description]". You must fill in the bracketed information. The descriptive part of your response MUST be as close to 20 words as possible and MUST NOT exceed 20 words. The entire response must be a single, plain text sentence. Do not use any markdown or headings.`,
  projectPlan: `Based on the project context and all available information, generate a comprehensive and realistic project plan. The plan MUST contain exactly 3 distinct, relevant project deliverables. For each deliverable, provide a single, detailed sentence for the deliverable itself, its most important key task, and its timing. Your response must adhere strictly to the provided JSON schema.`,
  projectBudget: `Based on the project context, timeline, and activities, generate a comprehensive and realistic project budget. The total requested amount should be between $10,000 and $100,000. Include a variety of relevant line items from different categories. Ensure that "Overhead and Administration Costs" do not exceed 15% of the total budget. Your response must adhere strictly to the provided JSON schema.`
};