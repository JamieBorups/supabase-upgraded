
import { supabase } from '../../supabase.ts';
import { JobDescription } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

export const getJobDescriptions = async (): Promise<JobDescription[]> => {
    return mapObjectToCamelCase(handleResponse(await supabase.from('job_descriptions').select('*')));
};

export const addJobDescription = async (jd: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobDescription> => {
    const { data, error } = await supabase
        .from('job_descriptions')
        .insert(mapObjectToSnakeCase(jd))
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const updateJobDescription = async (id: string, jd: Partial<JobDescription>): Promise<JobDescription> => {
    const { id: ignoredId, createdAt, ...updateData } = jd;
    const { data, error } = await supabase
        .from('job_descriptions')
        .update(mapObjectToSnakeCase({ ...updateData, updatedAt: new Date().toISOString() }))
        .eq('id', id)
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const deleteJobDescription = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('job_descriptions').delete().eq('id', id));
};
