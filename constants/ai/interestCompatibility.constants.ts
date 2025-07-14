import { Type } from '@google/genai';
import { AppSettings } from '../../types';

type InterestCompatibilitySettings = AppSettings['ai']['interestCompatibilitySectionSettings'];

export const INTEREST_COMPATIBILITY_PERSONA_INSTRUCTIONS = `You are a strategic analyst specializing in stakeholder management for non-profits. You identify areas of synergy and potential conflict based on project data.`;

export const INTEREST_COMPATIBILITY_SECTION_SETTINGS: InterestCompatibilitySettings = {
    executiveSummary: {
        prompt: 'Generate a detailed, multi-paragraph executive summary (minimum 250 words). This summary must serve as a strategic overview. It must begin by synthesizing the project\'s core mission from its description and background. Then, it must introduce the key stakeholder groups (e.g., collaborators, funders), referencing their roles. Following that, it must provide a high-level preview of the major areas of interest alignment and potential friction that will be detailed later in the report. Conclude with a forward-looking statement about the project\'s potential if these dynamics are managed effectively. The tone should be professional and insightful. Your entire response must be a single block of text with paragraphs separated by double newlines (\\n\\n).',
        schema: { type: Type.OBJECT, properties: { executiveSummary: { type: Type.STRING, description: "A detailed, multi-paragraph executive summary (minimum 250 words) that provides a strategic overview of the project's stakeholder dynamics, including key alignments, potential frictions, and a concluding statement. The text must use double newlines (\\n\\n) to separate paragraphs." } } }
    },
    stakeholderAnalysis: {
        prompt: 'Generate the "stakeholderAnalysis" section. For each key stakeholder, you must deduce a comprehensive list of their likely interests based on their provided bio, assigned tasks, and the project budget. Do not just list generic interests. For each stakeholder, provide at least 3-5 specific, detailed interests. For instance, instead of just "Financial accountability" for a funder, it could be "Ensuring grant funds are spent according to the proposed expense categories" or "Seeing measurable community engagement metrics". For an artist, instead of "artistic expression," it could be "Exploring themes of environmental justice through their specific medium" or "Receiving public recognition for their creative contribution". Be thorough and draw direct connections to the provided project context.',
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
        prompt: 'Generate the "highCompatibilityAreas" section. For each identified area of strong synergy, you must provide a deeply detailed analysis. The "insight" field for each area must be a comprehensive, multi-paragraph explanation (at least 3-4 paragraphs), with paragraphs separated by double newlines (\\n\\n). It should explicitly state which stakeholders are involved, what specific interests of theirs are aligned, and how this alignment creates a powerful advantage for the project. Use the project context (description, budget, collaborator bios) to support your analysis with concrete examples.',
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
        prompt: 'Generate the "potentialConflicts" section as a critical risk analysis. For each potential conflict, provide a very detailed breakdown. The "insight" and "mitigation" fields must be multi-paragraph explorations (at least 3-4 paragraphs each), with paragraphs separated by double newlines (\\n\\n). The insight should detail the conflict\'s root cause, and the mitigation must offer a step-by-step strategy to address it. The "followUpQuestions" and "guidance" should be equally thoughtful and specific.',
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
        prompt: 'Generate "actionableRecommendations". Each recommendation in the array must be a full, detailed paragraph. Do not provide a simple to-do list. Each recommendation should be a strategic initiative that synthesizes findings from the entire analysis. For example, a recommendation shouldn\'t be "Hold a meeting," but rather, "Convene a project kick-off meeting focused on establishing shared goals. The agenda should include a review of the high-compatibility areas to build early momentum and an open discussion of the potential conflicts, using the mitigation strategies as a starting point for dialogue." Provide at least 3-5 such detailed, paragraph-length recommendations.',
        schema: {
            type: Type.OBJECT, properties: {
                actionableRecommendations: { type: Type.ARRAY, description: "A list of at least 3-5 strategic, high-level action items, where each item is a full, detailed paragraph.", items: { type: Type.STRING } }
            }
        }
    },
};
