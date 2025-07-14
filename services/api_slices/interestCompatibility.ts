import { supabase } from '../../supabase.ts';
import { InterestCompatibilityReport } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

export const getInterestCompatibilityReports = async (): Promise<InterestCompatibilityReport[]> => {
    return mapObjectToCamelCase(handleResponse(await supabase.from('interest_compatibility_reports').select('*')));
};

export const addInterestCompatibilityReport = async (report: Omit<InterestCompatibilityReport, 'id' | 'createdAt'>): Promise<InterestCompatibilityReport> => {
    const { data, error } = await supabase
        .from('interest_compatibility_reports')
        .insert(mapObjectToSnakeCase(report))
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const deleteInterestCompatibilityReport = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('interest_compatibility_reports').delete().eq('id', id));
};
