
import { getAiResponse } from '../aiService';
import { AppSettings, ProjectContextForAI, InterestCompatibilityReport } from '../../types';

export const generateInterestCompatibilitySection = async (
    context: ProjectContextForAI,
    settings: AppSettings['ai'],
    sectionKey: keyof AppSettings['ai']['interestCompatibilitySectionSettings']
): Promise<Partial<InterestCompatibilityReport>> => {
    const personaSettings = settings.personas.interestCompatibility;
    if (!personaSettings) {
        throw new Error("Interest Compatibility persona settings not found.");
    }
    
    const sectionConfig = settings.interestCompatibilitySectionSettings[sectionKey];
    if (!sectionConfig) {
        throw new Error(`Settings for compatibility section "${String(sectionKey)}" not found.`);
    }

    const finalPrompt = `${sectionConfig.prompt}\n\n### PROJECT CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
    
    const result = await getAiResponse(
        'interestCompatibility',
        finalPrompt,
        settings,
        [],
        { responseSchema: sectionConfig.schema }
    );
    
    const parsedResult = JSON.parse(result.text);

    if (typeof parsedResult !== 'object' || parsedResult === null || !parsedResult.hasOwnProperty(sectionKey)) {
        throw new Error(`AI response did not contain the expected '${String(sectionKey)}' field.`);
    }
    
    return parsedResult;
};
