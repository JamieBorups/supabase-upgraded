
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, JobDescription, FormData as Project } from '../../types';

export const generateBulkJobDescriptions = async (
    project: Project,
    config: { additionalDetails: string; seniorityLevel: string; tailoringTags: string[] },
    appState: AppState
): Promise<Partial<JobDescription>[]> => {

    const { settings, tasks, otfApplications, researchPlans, ecostarReports } = appState;

    if (!settings || !settings.ai.enabled) {
        throw new Error("AI features are currently disabled in settings.");
    }
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key is not configured in the environment.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const persona = settings.ai.personas.experienceHub;
    if (!persona) {
        throw new Error("Experience Hub AI persona not found in settings.");
    }

    // --- CONTEXT GATHERING ---
    const context: any = {
        organizationalContext: {
            name: settings.general.collectiveName,
            description: settings.general.organizationalDescription,
            mission: settings.general.mission,
            vision: settings.general.vision,
            callToAction: settings.general.callToAction,
            contactInfo: settings.media.contactInfo
        },
        project: {
            title: project.projectTitle,
            description: project.projectDescription,
            background: project.background,
            schedule: project.schedule,
            goals: project.artisticDevelopment,
        },
        tasks: tasks.filter(t => t.projectId === project.id).map(t => ({ title: t.title, description: t.description })),
    };

    if (config.additionalDetails.trim()) {
        context.userRequest = `The user has provided the following specific requests or keywords to guide the job creation: "${config.additionalDetails.trim()}"`;
    } else {
        context.userRequest = "The user has not provided specific roles. Generate a balanced team of 5-7 members suitable for this project.";
    }
    
    context.guidance = `Please adhere to the following general guidance for all roles: Seniority should be around '${config.seniorityLevel}'. Emphasize skills related to: [${config.tailoringTags.join(', ')}].`;


    const getMostRecent = <T extends { createdAt: string }>(items: T[]) => items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const projectOtf = otfApplications.find(a => a.projectId === project.id);
    const projectResearch = researchPlans.find(r => r.projectId === project.id);
    const projectEcoStar = getMostRecent(ecostarReports.filter(r => r.projectId === project.id));

    if(projectOtf) context.otfContext = { objective: projectOtf.projObjective, fundingPriority: projectOtf.projFundingPriority };
    if(projectResearch) context.researchContext = { overview: projectResearch.titleAndOverview, questions: projectResearch.researchQuestions };
    if(projectEcoStar) context.ecoStarContext = { environment: projectEcoStar.environmentReport?.summary, customer: projectEcoStar.customerReport?.summary };
    
    // --- PROMPT CONSTRUCTION ---
    const prompt = `Based on the comprehensive project and organizational context provided, generate an array of 5 to 7 generic job descriptions for the team that would be ideal to execute this project.
Each object in the array MUST be a complete job description with all fields filled out according to the schema. The organizational fields ('aboutOrg', 'callToAction', etc.) should be consistent across all generated roles, derived from the organizational context. The project-specific fields ('projectTagline', 'projectSummary') should also be consistent. The role-specific fields ('title', 'summary', etc.) should be unique for each role.
${JSON.stringify(context, null, 2)}`;
    
    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                projectTagline: { type: Type.STRING, description: "A compelling, one-sentence tagline about the project itself." },
                projectSummary: { type: Type.STRING, description: "A short, exciting summary paragraph (approx. 50-70 words) about the overall project." },
                title: { type: Type.STRING, description: "The specific title for this role." },
                seniorityLevel: { type: Type.STRING, enum: ['Entry-Level', 'Mid-Career', 'Senior/Lead', 'Management'] },
                summary: { type: Type.STRING, description: "A summary of this specific role." },
                responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                qualifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                hardSkills: { type: Type.STRING, description: "A single string containing 2-4 complete sentences describing hard skills in context." },
                softSkills: { type: Type.STRING, description: "A single string containing 2-4 complete sentences describing soft skills in context." },
                volunteerBenefits: { type: Type.STRING, description: "A paragraph outlining the benefits for a volunteer in this role, such as skill development, networking, and community impact." },
                timeCommitment: { type: Type.STRING, description: "A paragraph describing the expected time commitment and logistics." },
                applicationProcess: { type: Type.STRING, description: "A paragraph explaining how to get involved, providing clear, low-barrier steps for expressing interest." },
                callToAction: { type: Type.STRING, description: "A welcoming and inclusive call to action to encourage community participation." }
            },
            required: [
                'projectTagline', 'projectSummary', 'title', 'seniorityLevel', 'summary', 
                'responsibilities', 'qualifications', 'hardSkills', 'softSkills', 
                'volunteerBenefits', 'timeCommitment', 'applicationProcess', 'callToAction'
            ]
        }
    };
    
    try {
        const response = await ai.models.generateContent({
            model: persona.model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: persona.instructions,
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                temperature: persona.temperature
            }
        });

        let jsonString = response.text.trim();
        const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1];
        }

        const parsedResult = JSON.parse(jsonString);
        
        if (!Array.isArray(parsedResult)) {
            throw new Error("AI response was not a valid array of job descriptions.");
        }
        
        return parsedResult;

    } catch (error: any) {
        console.error("Error calling Gemini API for bulk job descriptions:", error);
        throw new Error(`An error occurred while contacting the AI service: ${error.message || 'Unknown error'}`);
    }
};