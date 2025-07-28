import { MAIN_PERSONA_INSTRUCTIONS } from './main.persona.ts';
import { PROJECTS_PERSONA_INSTRUCTIONS } from './projects.persona.ts';
import { MEMBERS_PERSONA_INSTRUCTIONS } from './members.persona.ts';
import { TASKS_PERSONA_INSTRUCTIONS } from './tasks.persona.ts';
import { TASK_GENERATOR_PERSONA_INSTRUCTIONS } from './taskGenerator.persona.ts';
import { BUDGET_PERSONA_INSTRUCTIONS } from './budget.persona.ts';
import { REPORTS_PERSONA_INSTRUCTIONS } from './reports.persona.ts';
import { MEDIA_PERSONA_INSTRUCTIONS } from './media.persona.ts';
import { ECOSTAR_PERSONA_INSTRUCTIONS } from './ecostar.persona.ts';
import { PROJECT_GENERATOR_PERSONA_INSTRUCTIONS } from './projectGenerator.persona.ts';
import { INTEREST_COMPATIBILITY_PERSONA_INSTRUCTIONS } from './interestCompatibility.persona.ts';
import { SDG_ALIGNMENT_PERSONA_INSTRUCTIONS } from './sdgAlignment.persona.ts';
import { RECREATION_PERSONA_INSTRUCTIONS } from './recreation.persona.ts';
import { RESEARCH_PLAN_PERSONA_INSTRUCTIONS } from './researchPlan.persona.ts';
import { OTF_PERSONA_INSTRUCTIONS } from './otf.persona.ts';
import { NOHFC_PERSONA_INSTRUCTIONS } from './nohfc.persona.ts';

export const AI_PERSONAS = {
    main: { instructions: MAIN_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.7 },
    projects: { instructions: PROJECTS_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.8 },
    members: { instructions: MEMBERS_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.7 },
    tasks: { instructions: TASKS_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.6 },
    taskGenerator: { instructions: TASK_GENERATOR_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.7 },
    budget: { instructions: BUDGET_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.5 },
    reports: { instructions: REPORTS_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.5 },
    media: { instructions: MEDIA_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.8 },
    ecostar: { instructions: ECOSTAR_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.7 },
    projectGenerator: { instructions: PROJECT_GENERATOR_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.9 },
    interestCompatibility: { instructions: INTEREST_COMPATIBILITY_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.6 },
    sdgAlignment: { instructions: SDG_ALIGNMENT_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.6 },
    recreation: { instructions: RECREATION_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.7 },
    researchPlan: { instructions: RESEARCH_PLAN_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.7 },
    otf: { instructions: OTF_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.7 },
    nohfc: { instructions: NOHFC_PERSONA_INSTRUCTIONS, model: 'gemini-2.5-flash', temperature: 0.7 },
};