import { supabase } from '../../supabase.ts';
import { ResearchPlan, ResearchPlanCommunity, RelatedProject } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

export const getResearchPlans = async (): Promise<ResearchPlan[]> => {
    const { data: rawPlans, error } = await supabase.from('research_plans').select('*, research_plan_communities(*)');
    handleResponse({ data: rawPlans, error });
    if (!rawPlans) return [];
    
    return rawPlans.map(plan => {
        const { research_plan_communities, ...rest } = plan;
        const mappedPlan = mapObjectToCamelCase(rest) as ResearchPlan;
        mappedPlan.communities = mapObjectToCamelCase(research_plan_communities || []);
        return mappedPlan;
    });
};

export const addResearchPlan = async (plan: Omit<ResearchPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResearchPlan> => {
    const { communities, ...planData } = plan;
    const { data, error } = await supabase
        .from('research_plans')
        .insert(mapObjectToSnakeCase(planData))
        .select()
        .single();
    handleResponse({data, error});
    
    const newPlanId = data.id;
    if (communities && communities.length > 0) {
        const communitiesToInsert = communities.map(c => ({...c, research_plan_id: newPlanId }));
        const { error: communityError } = await supabase.from('research_plan_communities').insert(communitiesToInsert.map(mapObjectToSnakeCase));
        if (communityError) throw communityError;
    }
    
    const finalPlan = await getResearchPlans().then(plans => plans.find(p => p.id === newPlanId));
    if (!finalPlan) throw new Error("Failed to retrieve plan after creation.");
    return finalPlan;
};

export const updateResearchPlan = async (id: string, plan: Partial<ResearchPlan>): Promise<ResearchPlan> => {
    const { communities, ...planData } = plan;

    const dbPayload = mapObjectToSnakeCase(planData);

    const { data, error } = await supabase
        .from('research_plans')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();
    handleResponse({ data, error });
    
    if (communities !== undefined) {
        const { error: deleteError } = await supabase.from('research_plan_communities').delete().eq('research_plan_id', id);
        if(deleteError) throw deleteError;

        if (communities && communities.length > 0) {
            const communitiesToInsert = communities.map(c => ({...c, research_plan_id: id }));
            const { error: insertError } = await supabase.from('research_plan_communities').insert(communitiesToInsert.map(mapObjectToSnakeCase));
            if (insertError) throw insertError;
        }
    }

    const finalPlan = await getResearchPlans().then(plans => plans.find(p => p.id === id));
    if (!finalPlan) throw new Error("Failed to retrieve plan after update.");
    return finalPlan;
};

export const deleteResearchPlan = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('research_plans').delete().eq('id', id));
};

// Related Projects
export const getRelatedProjects = async (): Promise<RelatedProject[]> => {
    const { data, error } = await supabase
        .from('related_projects')
        .select('*, related_project_associations(project_id)');
    handleResponse({ data, error });
    return (data || []).map(rp => {
        const { related_project_associations, ...rest } = rp;
        const mappedRp = mapObjectToCamelCase(rest);
        mappedRp.associatedProjectIds = (related_project_associations || []).map((rpa: any) => rpa.project_id);
        return mappedRp;
    });
};

export const addRelatedProject = async (project: Omit<RelatedProject, 'id'|'createdAt'|'updatedAt'>): Promise<RelatedProject> => {
    const { associatedProjectIds, ...projectData } = project;
    const { data, error } = await supabase
        .from('related_projects')
        .insert(mapObjectToSnakeCase(projectData))
        .select()
        .single();
    handleResponse({ data, error });

    const newProjectId = data.id;
    if (associatedProjectIds && associatedProjectIds.length > 0) {
        const associationsToInsert = associatedProjectIds.map(pid => ({ related_project_id: newProjectId, project_id: pid }));
        const { error: assocError } = await supabase.from('related_project_associations').insert(associationsToInsert);
        if (assocError) throw assocError;
    }
    
    const { data: finalData, error: finalError } = await supabase.from('related_projects').select('*, related_project_associations(project_id)').eq('id', newProjectId).single();
    handleResponse({data: finalData, error: finalError});
    const { related_project_associations, ...rest } = finalData;
    const mappedRp = mapObjectToCamelCase(rest);
    mappedRp.associatedProjectIds = (related_project_associations || []).map((rpa: any) => rpa.project_id);
    return mappedRp;
};

export const updateRelatedProject = async (id: string, project: Partial<RelatedProject>): Promise<RelatedProject> => {
    const { id: ignoredId, createdAt, associatedProjectIds, ...updateData } = project;
    const { data, error } = await supabase
        .from('related_projects')
        .update(mapObjectToSnakeCase({ ...updateData, updatedAt: new Date().toISOString() }))
        .eq('id', id)
        .select()
        .single();
    handleResponse({ data, error });

    if (associatedProjectIds !== undefined) {
        await supabase.from('related_project_associations').delete().eq('related_project_id', id);
        if (associatedProjectIds.length > 0) {
            const associationsToInsert = associatedProjectIds.map(pid => ({ related_project_id: id, project_id: pid }));
            const { error: assocError } = await supabase.from('related_project_associations').insert(associationsToInsert);
            if (assocError) throw assocError;
        }
    }
    
    const { data: finalData, error: finalError } = await supabase.from('related_projects').select('*, related_project_associations(project_id)').eq('id', id).single();
    handleResponse({data: finalData, error: finalError});
    const { related_project_associations, ...rest } = finalData;
    const mappedRp = mapObjectToCamelCase(rest);
    mappedRp.associatedProjectIds = (related_project_associations || []).map((rpa: any) => rpa.project_id);
    return mappedRp;
};

export const deleteRelatedProject = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('related_projects').delete().eq('id', id));
};