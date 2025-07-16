
import { Type } from '@google/genai';
import { AppSettings, InterestCompatibilityReport } from '../../types';

type InterestCompatibilitySettings = AppSettings['ai']['interestCompatibilitySectionSettings'];

export const INTEREST_COMPATIBILITY_PERSONA_INSTRUCTIONS = `You are a strategic analyst specializing in stakeholder management for non-profits. You identify areas of synergy and potential conflict based on project data. If a formal Research Plan is provided in the context, you MUST treat it as the primary source of truth for the project's official goals and methodologies, weighing it more heavily than informal project descriptions.`;

export const REPORT_SECTIONS: { key: keyof Omit<InterestCompatibilityReport, 'id' | 'projectId' | 'createdAt' | 'notes' | 'fullReportText'>, label: string }[] = [
    { key: 'executiveSummary', label: 'Executive Summary' },
    { key: 'stakeholderAnalysis', label: 'Stakeholder Analysis' },
    { key: 'highCompatibilityAreas', label: 'High Compatibility Areas' },
    { key: 'potentialConflicts', label: 'Potential Conflicts' },
    { key: 'actionableRecommendations', label: 'Actionable Recommendations' },
];

export const INTEREST_COMPATIBILITY_SECTION_SETTINGS: InterestCompatibilitySettings = {
    executiveSummary: {
        prompt: 'Generate a detailed, multi-paragraph executive summary (minimum 250 words). This summary must serve as a strategic overview. It must begin by synthesizing the project\'s core mission, prioritizing the formal goals stated in the `researchPlanContext` if available, over the general project description. Then, it must introduce the key stakeholder groups (e.g., collaborators, funders), referencing their roles. Following that, it must provide a high-level preview of the major areas of interest alignment and potential friction that will be detailed later in the report. Conclude with a forward-looking statement about the project\'s potential if these dynamics are managed effectively. The tone should be professional and insightful. Your entire response must be a single block of text with paragraphs separated by double newlines (\\n\\n).',
        schema: { type: Type.OBJECT, properties: { executiveSummary: { type: Type.STRING, description: "A detailed, multi-paragraph executive summary (minimum 250 words) that provides a strategic overview of the project's stakeholder dynamics, including key alignments, potential frictions, and a concluding statement. The text must use double newlines (\\n\\n) to separate paragraphs." } } }
    },
    stakeholderAnalysis: {
        prompt: 'Generate the "stakeholderAnalysis" section. For each key stakeholder, you must deduce a comprehensive list of their likely interests based on all context. Critically, if a `researchPlanContext` is provided, you must heavily weigh the goals, methodologies, and community engagement strategies outlined within it as the definitive interests for project-related stakeholders. For other stakeholders, use their provided bio, assigned tasks, and the project budget. Do not just list generic interests. For each stakeholder, provide at least 3-5 specific, detailed interests. For instance, instead of just "Financial accountability," it could be "Ensuring grant funds are spent on the specific methodologies described in the research plan." For an artist, instead of "artistic expression," it could be "Exploring themes of environmental justice through their specific medium." Be thorough and draw direct connections to the provided project context, especially the research plan.',
        schema: {
          type: Type.OBJECT, properties: {
            stakeholderAnalysis: {
              type: Type.ARRAY,
              description: 'List of all key stakeholders and their inferred interests.',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The stakeholder's name or group." },
                  role: { type: Type.STRING, description: "The stakeholder's role in the project." },
                  interests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of at least 3-5 specific, detailed interests for the stakeholder, justified by the project context." }
                },
                required: ['name', 'role', 'interests']
              }
            }
          }
        }
    },
    highCompatibilityAreas: {
        prompt: 'Generate the "highCompatibilityAreas" section. For each identified area of strong synergy, you must provide a deeply detailed analysis. The "insight" field for each area must be a comprehensive, multi-paragraph explanation (at least 3-4 paragraphs), with paragraphs separated by double newlines (\\n\\n). It should explicitly state which stakeholders are involved and what specific interests of theirs are aligned. If a `researchPlanContext` is available, you must use it to find alignments between the formal plan and collaborator bios or budget allocations, explaining how this alignment creates a powerful advantage for the project. Support your analysis with concrete examples.',
        schema: {
            type: Type.OBJECT, properties: {
                highCompatibilityAreas: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            area: { type: Type.STRING, description: 'The area of synergy.' },
                            stakeholders: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Stakeholders involved in this synergy.' },
                            insight: { type: Type.STRING, description: 'A comprehensive, multi-paragraph (3-4 paragraphs minimum) explanation of the synergy, supported by concrete examples from the project context. Use double newlines (\\n\\n) to separate paragraphs.' },
                            followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 2-3 strategic, thought-provoking questions for team reflection.' },
                            guidance: { type: Type.STRING, description: 'A concrete suggestion for how to use the AI to act on this insight.' }
                        }, required: ['area', 'stakeholders', 'insight', 'followUpQuestions', 'guidance']
                    }
                }
            }
        }
    },
    potentialConflicts: {
        prompt: 'Generate the "potentialConflicts" section as a critical risk analysis. For each potential conflict, provide a very detailed breakdown. The "insight" and "mitigation" fields must be multi-paragraph explorations (at least 3-4 paragraphs each), with paragraphs separated by double newlines (\\n\\n). The insight should detail the conflict\'s root cause, identifying any discrepancies between the formal `researchPlanContext` and the more informal project description or collaborator bios. The mitigation must offer a step-by-step strategy to address it. The "followUpQuestions" and "guidance" should be equally thoughtful and specific.',
        schema: {
            type: Type.OBJECT, properties: {
                potentialConflicts: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            area: { type: Type.STRING, description: 'The area of potential conflict.' },
                            stakeholders: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Stakeholders involved in this conflict.' },
                            insight: { type: Type.STRING, description: 'A multi-paragraph (3-4 paragraphs minimum) exploration of the conflict\'s root cause. Use double newlines (\\n\\n) to separate paragraphs.' },
                            mitigation: { type: Type.STRING, description: 'A detailed, multi-paragraph strategy with step-by-step guidance for mitigating the conflict. Use double newlines (\\n\\n) to separate paragraphs.' },
                            followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 2-3 specific, difficult questions for team conversation.' },
                            guidance: { type: Type.STRING, description: 'A concrete suggestion for how the AI can help mediate or create alternatives.' }
                        }, required: ['area', 'stakeholders', 'insight', 'mitigation', 'followUpQuestions', 'guidance']
                    }
                }
            }
        }
    },
    actionableRecommendations: {
        prompt: 'Generate "actionableRecommendations". Each recommendation in the array must be a full, detailed paragraph. Do not provide a simple to-do list. Each recommendation should be a strategic initiative that synthesizes findings from the entire analysis, paying special attention to insights derived from the `researchPlanContext`. For example, a recommendation could be, "Convene a project kick-off meeting focused on aligning the team with the formal Research Plan. The agenda should explicitly bridge any gaps between the collaborator bios and the stated methodologies in the plan, using the high-compatibility areas as a foundation for building a shared understanding." Provide at least 3-5 such detailed, paragraph-length recommendations.',
        schema: {
            type: Type.OBJECT, properties: {
                actionableRecommendations: { type: Type.ARRAY, description: "A list of at least 3-5 strategic, high-level action items, where each item is a full, detailed paragraph.", items: { type: Type.STRING } }
            }
        }
    },
};
