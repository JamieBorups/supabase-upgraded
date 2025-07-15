
import { Type } from '@google/genai';
import { AppSettings } from '../../types';

type ResearchPlanSettings = AppSettings['ai']['researchPlanSectionSettings'];

const commonResponseFormat = "Your response for this section MUST be only a single string of well-written, multi-paragraph text formatted for a formal research proposal. Use double newlines (\\n\\n) to separate paragraphs. Do not use markdown, headings, or lists unless explicitly part of the content (like a list of questions).";

export const RESEARCH_PLAN_SECTION_SETTINGS: ResearchPlanSettings = {
    titleAndOverview: {
        prompt: `Generate a 'Project Title and Overview' section. Based on the project context, create a clear, concise, and co-created project title. Then, write a compelling executive summary (2-3 paragraphs) that highlights the project's purpose, methods, and expected outcomes, explicitly articulating the community's central role. ${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    communityEngagement: {
        prompt: `Generate a 'Community Engagement and Context' section. Detail the communities involved, their demographics, and cultural context. Explain why a CBR approach is suitable, aligning with community needs and strengths. Document any existing relationships and strategies for building trust. Crucially, describe how community needs were identified through participatory processes. ${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    researchQuestions: {
        prompt: `Generate a 'Research Questions and Objectives' section. Formulate broad, overarching research questions developed in collaboration with the community. Then, list specific, measurable objectives that clearly demonstrate how the research will benefit the community. ${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    designAndMethodology: {
        prompt: `Generate a 'Research Design and Methodology' section. Articulate the research paradigm, ensuring it aligns with community values. For Indigenous projects, explicitly state and describe Indigenous research approaches. Detail participatory and culturally appropriate data collection methods. Describe a collaborative data analysis process and explain a respectful sampling strategy involving the community. ${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    ethicalConsiderations: {
        prompt: `Generate an 'Ethical Considerations and Protocols' section. Outline a comprehensive, culturally appropriate consent process, respecting community self-determination (including collective consent for Indigenous contexts). Detail data confidentiality, management, and ownership, emphasizing data sovereignty. Explain how the research will ensure reciprocity and benefits sharing. Outline strategies for cultural sensitivity and competence. ${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    knowledgeMobilization: {
        prompt: `Generate a 'Knowledge Mobilization and Dissemination' section. Describe diverse, community-driven strategies for sharing findings in accessible formats. Explain how the project will build community capacity for future initiatives. Clearly articulate the anticipated impacts and outcomes, framed by community-defined benefits. ${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    projectManagement: {
        prompt: `Generate a 'Project Management and Timeline' section. Propose a realistic timeline with key milestones, developed collaboratively with community partners. Clearly define roles and responsibilities for all team members, emphasizing shared decision-making. Outline a detailed budget that supports community participation and benefit. ${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    projectEvaluation: {
        prompt: `Generate a 'Project Evaluation' section. Describe a participatory evaluation framework. Explain how the project's success will be assessed, with significant community involvement in defining success metrics and methods. ${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
};
