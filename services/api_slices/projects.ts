

import { supabase } from '../../supabase.ts';
import { FormData as Project, DetailedBudget, BudgetItem, ProposalSnapshot, ProjectExportData } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';
import { getActivities, getContacts, getDirectExpenses, getEvents, getEventTickets, getHighlights, getMembers, getNewsReleases, getRecreationFrameworkReports, getReports, getResearchPlans, getSdgAlignmentReports, getTasks, getTicketTypes, getVenues, getInteractions, getEcoStarReports, getInterestCompatibilityReports } from '../api';

export const getProjects = async (): Promise<Project[]> => {
    const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*, budget_items(*), project_collaborators(*)');
        
    handleResponse({ data: projectsData, error });

    if (!projectsData) return [];

    return projectsData.map(p => {
        const { budget_items, project_collaborators, ...projectRest } = p;
        const mappedProject = mapObjectToCamelCase(projectRest);

        const budget: DetailedBudget = { revenues: { grants: [], tickets: { actualRevenue: mappedProject.actualSales || 0 }, sales: [], fundraising: [], contributions: [] }, expenses: { professionalFees: [], travel: [], production: [], administration: [], research: [], professionalDevelopment: [] } };
        
        (budget_items || []).forEach((item: any) => {
            const camelItem = mapObjectToCamelCase(item);
            if (camelItem.type === 'revenue' && budget.revenues[camelItem.category as keyof DetailedBudget['revenues']]) {
                (budget.revenues[camelItem.category as keyof DetailedBudget['revenues']] as BudgetItem[]).push(camelItem);
            } else if (camelItem.type === 'expense' && budget.expenses[camelItem.category as keyof DetailedBudget['expenses']]) {
                budget.expenses[camelItem.category as keyof DetailedBudget['expenses']].push(camelItem);
            }
        });

        mappedProject.budget = budget;
        mappedProject.collaboratorDetails = (project_collaborators || []).map((c: any) => mapObjectToCamelCase(c));
        mappedProject.permissionConfirmationFiles = [];
        return mappedProject as Project;
    });
};

const saveProjectData = async (project: Project): Promise<Project> => {
    const isNew = !project.id || project.id.startsWith('proj_');
    const { budget, collaboratorDetails, permissionConfirmationFiles, ...projectRest } = project;

    // Create a mutable payload to modify date fields
    const payload = { ...projectRest } as any;

    // Convert all empty string dates to null for DB compatibility
    if (payload.projectStartDate === '') payload.projectStartDate = null;
    if (payload.projectEndDate === '') payload.projectEndDate = null;
    if (payload.estimatedSalesDate === '') payload.estimatedSalesDate = null;
    if (payload.actualSalesDate === '') payload.actualSalesDate = null;
    
    // 1. Upsert the main project record
    let upsertedProject;
    if (isNew) {
        const { id, ...insertPayload } = payload;
        const { data, error } = await supabase.from('projects').insert(mapObjectToSnakeCase(insertPayload)).select().single();
        if (error) throw error;
        upsertedProject = data;
    } else {
        const { id, ...updatePayload } = payload;
        const { data, error } = await supabase.from('projects').update(mapObjectToSnakeCase(updatePayload)).eq('id', project.id).select().single();
        if (error) throw error;
        upsertedProject = data;
    }

    const projectId = upsertedProject.id;

    // 2. Clear old budget items and collaborators
    await supabase.from('budget_items').delete().eq('project_id', projectId);
    await supabase.from('project_collaborators').delete().eq('project_id', projectId);

    // 3. Insert new budget items
    if (budget) {
        const budgetItemsToInsert = [
            ...Object.entries(budget.revenues).flatMap(([category, items]) =>
                Array.isArray(items) ? items.map(item => ({ ...item, project_id: projectId, type: 'revenue', category })) : []
            ),
            ...Object.entries(budget.expenses).flatMap(([category, items]) =>
                Array.isArray(items) ? items.map(item => ({ ...item, project_id: projectId, type: 'expense', category })) : []
            )
        ].map(item => {
            const { id, ...restOfItem } = item;
            return mapObjectToSnakeCase(restOfItem);
        });

        if (budgetItemsToInsert.length > 0) {
            const { error: budgetError } = await supabase.from('budget_items').insert(budgetItemsToInsert);
            if (budgetError) throw budgetError;
        }
    }

    // 4. Insert new collaborators
    if (collaboratorDetails && collaboratorDetails.length > 0) {
        const collaboratorsToInsert = collaboratorDetails.map(c => ({
            project_id: projectId,
            member_id: c.memberId,
            role: c.role
        }));
        const { error: collabError } = await supabase.from('project_collaborators').insert(collaboratorsToInsert);
        if (collabError) throw collabError;
    }

    // 5. Refetch the complete project
    const allProjects = await getProjects();
    const finalProject = allProjects.find(p => p.id === projectId);
    if (!finalProject) {
        throw new Error("Could not find the project after saving.");
    }

    return finalProject;
};


export const addProject = async (project: Project): Promise<Project> => {
    return saveProjectData(project);
};

export const updateProject = async (id: string, project: Project): Promise<Project> => {
    return saveProjectData({ ...project, id });
};

export const updateProjectStatus = async (projectId: string, status: string): Promise<void> => handleResponse(await supabase.from('projects').update({ status }).eq('id', projectId));
export const deleteProject = async (id: string): Promise<void> => handleResponse(await supabase.from('projects').delete().eq('id', id));

export const getProposals = async (): Promise<ProposalSnapshot[]> => mapObjectToCamelCase(handleResponse(await supabase.from('proposal_snapshots').select('*')));
export const addProposal = async (proposal: ProposalSnapshot): Promise<ProposalSnapshot> => mapObjectToCamelCase(handleResponse(await supabase.from('proposal_snapshots').insert(mapObjectToSnakeCase(proposal)).select().single()));
export const deleteProposal = async (id: string): Promise<void> => handleResponse(await supabase.from('proposal_snapshots').delete().eq('id', id));

export const getProjectExportData = async (projectId: string): Promise<ProjectExportData> => {
    const project = await getProjects().then(projects => projects.find(p => p.id === projectId));
    if (!project) throw new Error("Project not found");

    const allTasks = await getTasks();
    const projectTasks = allTasks.filter(task => task.projectId === projectId);
    
    const [activities, directExpenses, reports, highlights, newsReleases, proposals, contacts, interactions, venues, events, ticketTypes, eventTickets, ecostarReports, interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports, researchPlans] = await Promise.all([
        getActivities().then(a => a.filter(act => projectTasks.some(t => t.id === act.taskId))),
        getDirectExpenses().then(d => d.filter(exp => exp.projectId === projectId)),
        getReports().then(r => r.filter(rep => rep.projectId === projectId)),
        getHighlights().then(h => h.filter(hl => hl.projectId === projectId)),
        getNewsReleases().then(nr => nr.filter(n => n.projectId === projectId)),
        getProposals().then(p => p.filter(prop => prop.projectId === projectId)),
        getContacts().then(c => c.filter(con => con.associatedProjectIds.includes(projectId))),
        getInteractions().then(i => i.filter(inter => contacts.some(c => c.id === inter.contactId && c.associatedProjectIds.includes(projectId)))),
        getVenues(),
        getEvents().then(e => e.filter(evt => evt.projectId === projectId)),
        getTicketTypes(),
        getEventTickets().then(et => et.filter(t => events.some(e => e.id === t.eventId && e.projectId === projectId))),
        getEcoStarReports().then(esr => esr.filter(r => r.projectId === projectId)),
        getInterestCompatibilityReports().then(icr => icr.filter(r => r.projectId === projectId)),
        getSdgAlignmentReports().then(sdg => sdg.filter(r => r.projectId === projectId)),
        getRecreationFrameworkReports().then(rfr => rfr.filter(r => r.projectId === projectId)),
        getResearchPlans().then(rp => rp.filter(r => r.projectId === projectId)),
    ]);

    const memberIds = new Set(project.collaboratorDetails.map(c => c.memberId));
    const members = await getMembers().then(m => m.filter(mem => memberIds.has(mem.id)));

    return { project, tasks: projectTasks, activities, directExpenses, members, newsReleases, reports, highlights, proposals, contacts, interactions, venues, events, ticketTypes, eventTickets, ecostarReports, interestCompatibilityReports, sdgAlignmentReports, recreationFrameworkReports, researchPlans };
};
