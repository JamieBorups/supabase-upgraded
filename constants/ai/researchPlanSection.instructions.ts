
import { Type } from '@google/genai';
import { AppSettings } from '../../types';

type ResearchPlanSettings = AppSettings['ai']['researchPlanSectionSettings'];

const commonResponseFormat = "Your response for this section MUST be only a single string of well-written, multi-paragraph text formatted for a formal research proposal. Use double newlines (\\n\\n) to separate paragraphs. Do not use markdown bullet points or numbered lists unless specified in a sub-heading's instructions.";

export const RESEARCH_PLAN_SECTION_SETTINGS: ResearchPlanSettings = {
    titleAndOverview: {
        prompt: `Generate a 'Project Title and Overview' section of at least 300 words. The response must be structured with the following sub-headings:
- **Project Title:** Create a clear, concise, and co-created project title.
- **Executive Summary:** Write a compelling executive summary (2-3 paragraphs) that highlights the project's purpose, methods, and expected outcomes, explicitly articulating the community's central role.
${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    communityEngagement: {
        prompt: `Generate a 'Community Engagement and Context' section of at least 800 words. Structure your response with the following sub-headings, providing a detailed, multi-paragraph analysis for each:
- **Community Profile:** Detail the communities involved, their demographics, and cultural context.
- **Rationale for a Community-Based Approach:** Explain why a CBR approach is suitable, aligning with community needs and strengths.
- **History of Engagement and Trust-Building:** Document any existing relationships and specific strategies for building trust.
- **Participatory Needs and Strengths Assessment:** Describe how community needs and assets were identified through participatory processes.
${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    researchQuestions: {
        prompt: `Generate a 'Research Questions and Objectives' section. Structure your response with the following sub-headings:
- **Overarching Research Questions:** Formulate 2-3 broad, overarching research questions developed in collaboration with the community. Present these as a narrative paragraph.
- **Specific Research Objectives:** List 4-5 specific, measurable, achievable, relevant, and time-bound (SMART) objectives that clearly demonstrate how the research will benefit the community.
${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    designAndMethodology: {
        prompt: `Generate a 'Research Design and Methodology' section of at least 1000 words. Structure your response with the following sub-headings, providing a detailed, multi-paragraph analysis for each:
- **Research Paradigm and Theoretical Framework:** Articulate the research paradigm (e.g., constructivist, critical theory) and how it aligns with the selected epistemologies.
- **Research Design:** Describe the overall design (e.g., case study, ethnographic). For Indigenous projects, explicitly state and describe Indigenous research approaches.
- **Sampling Strategy:** Explain the participant selection process, ensuring it is respectful and involves the community.
- **Data Collection Methods:** Detail all proposed participatory and culturally appropriate data collection methods (e.g., story circles, workshops, interviews).
- **Data Analysis Process:** Describe the plan for a collaborative data analysis process where community members are involved in interpreting the findings.
${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    ethicalConsiderations: {
        prompt: `Generate an 'Ethical Considerations and Protocols' section of at least 1000 words. Structure your response with the following sub-headings, providing a detailed, multi-paragraph analysis for each:
- **Informed Consent Process:** Outline a comprehensive, culturally appropriate, and ongoing consent process.
- **Confidentiality and Anonymity:** Detail specific strategies to protect participant data and identities.
- **Data Sovereignty and Ownership:** Explain the plan for community data ownership, control, access, and possession, respecting principles of data sovereignty.
- **Reciprocity and Benefits Sharing:** Articulate the tangible and intangible benefits that will be shared with the community.
- **Cultural Safety and Competence:** Outline strategies researchers will use to ensure culturally safe engagement.
- **Potential Risks and Mitigation:** Identify any potential risks to participants or the community and describe the plan to mitigate them.
${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    knowledgeMobilization: {
        prompt: `Generate a 'Knowledge Mobilization and Dissemination' section of at least 800 words. Structure your response with the following sub-headings, providing a detailed, multi-paragraph analysis for each:
- **Dissemination Strategy:** Describe diverse, community-driven strategies for sharing findings in accessible and culturally appropriate formats (e.g., reports, workshops, artistic creations, presentations).
- **Community Capacity Building:** Explain how the project will build community capacity for future initiatives, fostering long-term impact.
- **Anticipated Impacts and Outcomes:** Clearly articulate the short-term and long-term anticipated impacts, framed by community-defined benefits.
- **Long-Term Sustainability:** Discuss plans for sustaining the project's benefits after the funding period ends.
${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    projectManagement: {
        prompt: `Generate a 'Project Management and Timeline' section of at least 800 words. Structure your response with the following sub-headings, providing a detailed, multi-paragraph analysis for each:
- **Project Timeline and Key Milestones:** Propose a realistic timeline with key milestones.
- **Roles and Responsibilities:** Clearly define roles and responsibilities for all team members, including community partners, emphasizing shared decision-making.
- **Budget Justification for Community Participation:** Provide a rationale for budget items that specifically support community participation and benefit (e.g., honoraria, childcare, food).
- **Governance and Decision-Making Structure:** Describe how the project will be governed and how decisions will be made collaboratively.
${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
    projectEvaluation: {
        prompt: `Generate a 'Project Evaluation' section of at least 800 words. Structure your response with the following sub-headings, providing a detailed, multi-paragraph analysis for each:
- **Participatory Evaluation Framework:** Describe a participatory evaluation framework where community members help define success.
- **Success Metrics and Indicators:** List the specific qualitative and quantitative indicators that will be used to measure success.
- **Evaluation Timeline and Methods:** Outline when and how evaluation activities will occur throughout the project lifecycle.
- **Feedback Loop to Community:** Explain how evaluation findings will be shared back with the community to inform future actions.
${commonResponseFormat}`,
        schema: { type: Type.STRING }
    },
};
