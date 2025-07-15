

import { supabase } from '../../supabase.ts';
import { ResearchPlan } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

export const getResearchPlans = async (): Promise<ResearchPlan[]> => {
    return mapObjectToCamelCase(handleResponse(await supabase.from('research_plans').select('*')));
};

export const addResearchPlan = async (plan: Omit<ResearchPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResearchPlan> => {
    const { data, error } = await supabase
        .from('research_plans')
        .insert(mapObjectToSnakeCase(plan))
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const updateResearchPlan = async (id: string, plan: Partial<ResearchPlan>): Promise<ResearchPlan> => {
    const { data, error } = await supabase
        .from('research_plans')
        .update(mapObjectToSnakeCase(plan))
        .eq('id', id)
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const deleteResearchPlan = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('research_plans').delete().eq('id', id));
};
