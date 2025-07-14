
import { Content, GoogleGenAI } from "@google/genai";
import { AiPersonaName, AppSettings } from '../types.ts';

export async function getAiResponse(
    context: AiPersonaName,
    userPrompt: string,
    settings: AppSettings['ai'],
    history: Content[] = [],
    options: { forceJson?: boolean, responseSchema?: any } = {}
): Promise<{ text: string }> {

    if (!settings || !settings.enabled) {
        throw new Error("AI features are currently disabled in settings.");
    }
    
    // Per guidelines, *always* assume process.env.API_KEY is available.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // This is a failsafe for local dev, but the primary assumption is it exists.
        throw new Error("API Key is not configured in the environment. Please set the API_KEY environment variable.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey }); // Correct initialization.
        const corePersona = settings.personas.main;
        const contextPersona = settings.personas[context];

        if (!corePersona || !contextPersona) {
            throw new Error(`Invalid persona context provided: ${context}`);
        }

        let systemInstruction = `
//--- CORE INSTRUCTION (Your base personality) ---
${corePersona.instructions}

//--- SPECIALIZED TASK (Your current role as ${context}) ---
Your current task is related to ${context}. Your specific instructions are:
${contextPersona.instructions}
        `.trim();
        
        const contents = [
            ...history,
            {
                role: 'user',
                parts: [{ text: userPrompt }]
            }
        ];
        
        const config: any = { // Use 'any' to dynamically add properties
            systemInstruction,
            temperature: contextPersona.temperature,
        };

        // This is a critical logic fix. 
        // We must ONLY apply one of these formatting rules, not both.
        if (options.responseSchema) {
            config.responseSchema = options.responseSchema;
            config.responseMimeType = 'application/json'; // Enforce this when schema is used
        } else if (options.forceJson) {
            config.responseMimeType = 'application/json';
        } else if (settings.plainTextMode) {
            systemInstruction += `\n\n--- FORMATTING RULE ---\nIMPORTANT: Your entire response must be in plain text. Do not use any markdown formatting. Do not use asterisks for bolding or italics. Do not use # for headings. Do not use numbered or bulleted lists. Use simple line breaks to separate paragraphs or ideas.`;
            config.systemInstruction = systemInstruction; // Re-assign updated instructions
        }

        const response = await ai.models.generateContent({
            model: contextPersona.model,
            contents: contents,
            config: config
        });

        return { text: response.text };

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        if (error.message && error.message.includes('API key not valid')) {
            throw new Error('The provided API Key is not valid. Please check your environment configuration.');
        }
        throw new Error(`An error occurred while contacting the AI service: ${error.message || 'Unknown error'}`);
    }
}
