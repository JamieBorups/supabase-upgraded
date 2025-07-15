
import { getAiResponse } from './aiService';
import { AppSettings, EcoStarField, FormData as Project, Member, ReportSectionContent, ResearchPlan } from '../types';

/**
 * Generates the context prompt for the ECO-STAR AI.
 * @param basePrompt The specific instruction for the AI task.
 * @param project The project data to use as context.
 * @param members The list of all members to find collaborator details.
 * @returns A fully constructed prompt with context.
 */
const constructContextPrompt = (basePrompt: string, project: Project, members: Member[], researchPlan?: ResearchPlan | null): string => {
    const collaboratorDetails = project.collaboratorDetails.map(c => {
        const member = members.find(m => m.id === c.memberId);
        return member ? `${member.firstName} ${member.lastName} (${c.role})` : `Unknown Member (${c.role})`;
    }).join(', ');

    const context: any = {
        projectTitle: project.projectTitle,
        projectDescription: project.projectDescription,
        background: project.background,
        audience: project.audience,
        schedule: project.schedule,
        collaborators: collaboratorDetails,
        culturalIntegrity: project.culturalIntegrity,
        additionalInfo: project.additionalInfo,
    };

    if (researchPlan) {
        context.researchPlanContext = {
            title: researchPlan.titleAndOverview,
            researchQuestions: researchPlan.researchQuestions,
            methodologies: researchPlan.methodologies,
            epistemologies: researchPlan.epistemologies,
            ethicalConsiderations: researchPlan.ethicalConsiderations
        };
    }


    return `${basePrompt}\n\n### PROJECT CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
};


/**
 * Generates a single section of the ECO-STAR report.
 * @param topic The ECO-STAR field to generate.
 * @param project The project data.
 * @param members The list of all members.
 * @param settings The current application AI settings.
 * @param chatHistoryText The text from the user's brainstorming chat for this topic.
 * @returns The parsed report section content.
 */
export const generateEcoStarSection = async (
    topic: EcoStarField,
    project: Project,
    members: Member[],
    settings: AppSettings['ai'],
    chatHistoryText: string = '',
    researchPlan?: ResearchPlan | null
): Promise<ReportSectionContent> => {
    const fieldConfig = settings.ecostarFieldSettings[topic.key];
    if (!fieldConfig) {
        throw new Error(`Configuration for ECO-STAR section "${topic.key}" not found.`);
    }

    const basePrompt = `${fieldConfig.prompt} ${chatHistoryText ? `Use the following chat history as your primary source for generating the report content: \n\n${chatHistoryText}` : 'Use the general project context provided for your analysis.'}`;
    const finalPrompt = constructContextPrompt(basePrompt, project, members, researchPlan);

    try {
        const result = await getAiResponse(
            'ecostar',
            finalPrompt,
            settings,
            [],
            { responseSchema: fieldConfig.schema }
        );

        const parsedResult = JSON.parse(result.text);

        if (
            typeof parsedResult !== 'object' || parsedResult === null ||
            !('summary' in parsedResult) ||
            !Array.isArray(parsedResult.keyConsiderations) ||
            !Array.isArray(parsedResult.followUpQuestions)
        ) {
            throw new Error("AI response did not match the expected report structure.");
        }

        return parsedResult as ReportSectionContent;

    } catch (error) {
        console.error(`Error generating ECO-STAR section "${topic.key}":`, error);
        throw error; // Re-throw to be caught by the calling component
    }
};
