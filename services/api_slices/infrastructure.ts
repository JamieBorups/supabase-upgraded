
import { supabase } from '../../supabase.ts';
import { Infrastructure } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils.ts';

export const getInfrastructure = async (): Promise<Infrastructure[]> => {
    return mapObjectToCamelCase(handleResponse(await supabase.from('infrastructure').select('*')));
};

export const addInfrastructure = async (item: Omit<Infrastructure, 'id' | 'createdAt' | 'updatedAt'>): Promise<Infrastructure> => {
    const { data, error } = await supabase
        .from('infrastructure')
        .insert(mapObjectToSnakeCase(item))
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const updateInfrastructure = async (id: string, item: Partial<Infrastructure>): Promise<Infrastructure> => {
    const { data, error } = await supabase
        .from('infrastructure')
        .update(mapObjectToSnakeCase(item))
        .eq('id', id)
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const deleteInfrastructure = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('infrastructure').delete().eq('id', id));
};
