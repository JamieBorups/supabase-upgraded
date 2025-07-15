

import { supabase } from '../../supabase.ts';
import { ResearchPlan, ResearchPlanCommunity } from '../../types.ts';
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
    const { data, error } = await supabase
        .from('research_plans')
        .update(mapObjectToSnakeCase(planData))
        .eq('id', id)
        .select()
        .single();
    handleResponse({ data, error });
    
    // Replace communities: delete old ones, insert new ones
    const { error: deleteError } = await supabase.from('research_plan_communities').delete().eq('research_plan_id', id);
    if(deleteError) throw deleteError;

    if (communities && communities.length > 0) {
        const communitiesToInsert = communities.map(c => ({...c, research_plan_id: id }));
        const { error: insertError } = await supabase.from('research_plan_communities').insert(communitiesToInsert.map(mapObjectToSnakeCase));
        if (insertError) throw insertError;
    }

    const finalPlan = await getResearchPlans().then(plans => plans.find(p => p.id === id));
    if (!finalPlan) throw new Error("Failed to retrieve plan after update.");
    return finalPlan;
};

export const deleteResearchPlan = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('research_plans').delete().eq('id', id));
};