

import { supabase } from '../../supabase.ts';
import { ProgramGuideline } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

export const getProgramGuidelines = async (): Promise<ProgramGuideline[]> => {
    return mapObjectToCamelCase(handleResponse(await supabase.from('program_guidelines').select('*')));
};

export const addProgramGuideline = async (guideline: Omit<ProgramGuideline, 'id' | 'createdAt'>): Promise<ProgramGuideline> => {
    const { data, error } = await supabase
        .from('program_guidelines')
        .insert(mapObjectToSnakeCase(guideline))
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const updateProgramGuideline = async (id: string, guideline: Partial<ProgramGuideline>): Promise<ProgramGuideline> => {
    const { data, error } = await supabase
        .from('program_guidelines')
        .update(mapObjectToSnakeCase(guideline))
        .eq('id', id)
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};
