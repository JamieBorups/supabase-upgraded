
import { supabase } from '../../supabase.ts';
import { RecreationFrameworkReport } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

export const getRecreationFrameworkReports = async (): Promise<RecreationFrameworkReport[]> => {
    return mapObjectToCamelCase(handleResponse(await supabase.from('recreation_framework_reports').select('*')));
};

export const addRecreationFrameworkReport = async (report: Omit<RecreationFrameworkReport, 'id' | 'createdAt'>): Promise<RecreationFrameworkReport> => {
    const { data, error } = await supabase
        .from('recreation_framework_reports')
        .insert(mapObjectToSnakeCase(report))
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};

export const updateRecreationFrameworkReport = async (report: Partial<RecreationFrameworkReport>): Promise<RecreationFrameworkReport> => {
    if (!report.id) throw new Error("An ID is required to update a report.");
    const { data, error } = await supabase
        .from('recreation_framework_reports')
        .update(mapObjectToSnakeCase(report))
        .eq('id', report.id)
        .select()
        .single();
    return mapObjectToCamelCase(handleResponse({ data, error }));
};


export const deleteRecreationFrameworkReport = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('recreation_framework_reports').delete().eq('id', id));
};
