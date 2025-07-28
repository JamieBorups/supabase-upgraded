
import { Type } from '@google/genai';
import { NOHFC_BUDGET_CATEGORIES } from '../nohfc.constants';

const RULE_TEMPLATE = (charLimit: number) => `Your response MUST strictly adhere to these rules:
1.  The output must be a single block of plain text. DO NOT use markdown, headings, or lists.
2.  The response MUST NOT exceed ${charLimit} characters.
3.  Do not add any introductory phrases. Respond only with the requested content.`;

const LONG_RULE_TEMPLATE = (wordLimit: number) => `Your response MUST strictly adhere to these rules:
1.  The output must be a well-structured, multi-paragraph narrative in plain text. Use double newlines (\\n\\n) to separate paragraphs.
2.  The response must be approximately ${wordLimit} words.
3.  Do not use any markdown, headings, or lists.
4.  Do not add any introductory phrases. Respond only with the requested content.`;

export const NOHFC_FIELD_INSTRUCTIONS: Record<string, string> = {
    question_1a: `Based on the provided context, describe the organization's nature, its sector (recreation), and its mandate as a Local Services Board, aligning with the Northern Services Boards Act. ${RULE_TEMPLATE(1500)}`,
    question_1b: `Write a detailed, enhanced response for the organization description. Deeply connect the organization's mandate to the NOHFC guidelines, the Framework for Recreation in Canada, and the specific powers of Recreation under the Northern Services Boards Act. ${LONG_RULE_TEMPLATE(1000)}`,
    question_1c: `Based on the project context, answer the question "Why is the project being undertaken?". Explain the primary motivation and rationale. What problem does it solve or what opportunity does it address for the community? ${RULE_TEMPLATE(1500)}`,
    question_1d: `Write a detailed, enhanced response for "Why is the project being undertaken?". Elaborate on the project's motivation, aligning it with community needs, the NOHFC guidelines, and the Framework for Recreation in Canada. ${LONG_RULE_TEMPLATE(1000)}`,
    question_1e: `Based on the project context, answer the question "Is the project identified in a planning process such as a current community or organizational plan? Please explain." If it is, name the plan and describe the alignment. If not, explain why it's still a priority. ${RULE_TEMPLATE(1500)}`,
    question_1f: `Write a detailed, enhanced response regarding the project's identification in a planning process. Provide a strong justification for its alignment with strategic plans or, if not formally identified, its alignment with emergent community needs. ${LONG_RULE_TEMPLATE(1000)}`,
    question_2a: `Answer "What are the key activities that will be undertaken to complete the project?". List the primary actions, steps, and tasks involved in the project's execution. ${RULE_TEMPLATE(1500)}`,
    question_2b: `Write a detailed, enhanced response about the key project activities. Fully align every aspect with the Framework for Recreation, NOHFC guidelines, and the Northern Services Boards Act. ${LONG_RULE_TEMPLATE(1000)}`,
    question_3a: `Answer "What are the expected outcomes and benefits of the project?". Detail the anticipated results, improvements, and positive impacts for the community and facility. ${RULE_TEMPLATE(1500)}`,
    question_3b: `Write a detailed, enhanced response about the expected outcomes and benefits. Ensure all outcomes are framed within the context of the Framework for Recreation, NOHFC guidelines, and the Northern Services Boards Act. ${LONG_RULE_TEMPLATE(1000)}`,
    question_4a: `Answer "Please identify the technical, managerial and financial capacity for implementing the project:". Describe the skills, experience, and resources available to successfully execute the project. ${RULE_TEMPLATE(1500)}`,
    question_4b: `Write a detailed, enhanced response identifying the capacity for implementing the project. Provide concrete examples and justifications that align with the Framework for Recreation, NOHFC guidelines, and the Northern Services Boards Act. ${LONG_RULE_TEMPLATE(1000)}`,
    question_5a: `Answer "Please identify the technical, managerial and financial capacity for sustaining the facility:". Describe the long-term plan for operating and maintaining the facility after the project is complete. ${RULE_TEMPLATE(1500)}`,
    question_5b: `Write a detailed, enhanced response identifying the capacity for sustaining the facility. Focus on long-term sustainability and alignment with the Framework for Recreation, NOHFC guidelines, and the Northern Services Boards Act. ${LONG_RULE_TEMPLATE(1000)}`,
    question_6a: `Answer "Please explain how the project builds on and optimizes the capacity and efficiency of existing infrastructure.". Describe how this project enhances, rather than duplicates, current assets. ${RULE_TEMPLATE(1500)}`,
    question_6b: `Write a detailed, enhanced response explaining how the project optimizes existing infrastructure, ensuring it aligns with the Framework for Recreation, NOHFC guidelines, and the Northern Services Boards Act. ${LONG_RULE_TEMPLATE(1000)}`,
    question_7a: `Answer "Why is NOHFC funding necessary for the completion of the project?". Explain why this funding is critical and what would happen without it. ${RULE_TEMPLATE(1500)}`,
    question_7b: `Write a detailed, enhanced response explaining the need for NOHFC funding. This section must heavily valorize and justify all activities by aligning them with the five goals of the Framework for Recreation in Canada. ${LONG_RULE_TEMPLATE(1000)}`,
    question_8a: `Answer "In addition to the funding sources identified herein, have you approached or applied to any other funding programs?". Detail any other applications and their status, or explain why none have been approached. ${RULE_TEMPLATE(1500)}`,
    question_8b: `Write a detailed, enhanced response regarding other funding applications, ensuring full alignment with the Framework for Recreation, NOHFC guidelines, and the Northern Services Boards Act. ${LONG_RULE_TEMPLATE(1000)}`,
    projectBudget: `Based on the provided project context, generate a comprehensive and realistic project budget. The total requested amount from NOHFC should be appropriate for a Community Enhancement project (typically up to $200,000 for small communities). Include a variety of relevant line items from different categories. Note that Administrative Costs are calculated at 15% of the subtotal and should not be included as a line item in the main budget. Your response must adhere strictly to the provided JSON schema.`
};

export const NOHFC_BUDGET_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        budgetItems: {
            type: Type.ARRAY,
            description: "A detailed project budget with relevant line items.",
            items: {
                type: Type.OBJECT,
                properties: {
                    category: {
                        type: Type.STRING,
                        description: "The budget category for the item.",
                        enum: NOHFC_BUDGET_CATEGORIES.filter(c => c.value).map(c => c.value)
                    },
                    itemDescription: {
                        type: Type.STRING,
                        description: "A short, descriptive name for the budget item (e.g., 'Facility rental for workshops')."
                    },
                    costBreakdown: {
                        type: Type.STRING,
                        description: "A detailed breakdown of how the cost is calculated (e.g., '5 workshops x $200/day')."
                    },
                    requestedAmount: {
                        type: Type.NUMBER,
                        description: "The total amount requested for this item, rounded to the nearest dollar."
                    },
                    justification: {
                        type: Type.STRING,
                        description: "A concise, compelling justification for why this expense is necessary for the project, aligning it with NOHFC's goals."
                    }
                },
                required: ['category', 'itemDescription', 'costBreakdown', 'requestedAmount', 'justification']
            }
        }
    },
    required: ['budgetItems']
};
