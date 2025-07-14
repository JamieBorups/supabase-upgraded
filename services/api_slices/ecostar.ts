import { supabase } from '../../supabase.ts';
import { EcoStarReport } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

export const getEcoStarReports = async (): Promise<EcoStarReport[]> => {
    return mapObjectToCamelCase(handleResponse(await supabase.from('ecostar_reports').select('*')));
};

export const addEcoStarReport = async (report: Omit<EcoStarReport, 'id' | 'createdAt'>): Promise<EcoStarReport> => {
    const { data, error } = await supabase
        .from('ecostar_reports')
        .insert(mapObjectToSnakeCase(report))
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const deleteEcoStarReport = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('ecostar_reports').delete().eq('id', id));
};
