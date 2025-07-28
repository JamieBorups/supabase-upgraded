import { supabase } from '../../supabase.ts';
import { Risk } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils.ts';

export const getRisks = async (): Promise<Risk[]> => {
    return mapObjectToCamelCase(handleResponse(await supabase.from('risks').select('*')));
};

export const addRisk = async (risk: Omit<Risk, 'id' | 'createdAt'>): Promise<Risk> => {
    const { data, error } = await supabase
        .from('risks')
        .insert(mapObjectToSnakeCase(risk))
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const updateRisk = async (id: string, risk: Partial<Risk>): Promise<Risk> => {
    const { data, error } = await supabase
        .from('risks')
        .update(mapObjectToSnakeCase(risk))
        .eq('id', id)
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const deleteRisk = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('risks').delete().eq('id', id));
};
