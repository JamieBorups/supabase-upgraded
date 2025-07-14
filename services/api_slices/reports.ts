
import { supabase } from '../../supabase.ts';
import { Report, Highlight } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

export const getReports = async (): Promise<Report[]> => mapObjectToCamelCase(handleResponse(await supabase.from('reports').select('*')));
export const addOrUpdateReport = async (report: Report): Promise<Report> => mapObjectToCamelCase(handleResponse(await supabase.from('reports').upsert(mapObjectToSnakeCase(report)).select().single()));

export const getHighlights = async (): Promise<Highlight[]> => mapObjectToCamelCase(handleResponse(await supabase.from('highlights').select('*')));
export const addHighlight = async (highlight: Highlight): Promise<Highlight> => {
    const { id, ...rest } = highlight;
    return mapObjectToCamelCase(handleResponse(await supabase.from('highlights').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const updateHighlight = async (id: string, highlight: Highlight): Promise<Highlight> => mapObjectToCamelCase(handleResponse(await supabase.from('highlights').update(mapObjectToSnakeCase(highlight)).eq('id', id).select().single()));
export const deleteHighlight = async (id: string): Promise<void> => handleResponse(await supabase.from('highlights').delete().eq('id', id));
