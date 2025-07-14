import { supabase } from '../../supabase.ts';
import { AppSettings } from '../../types.ts';
import { initialSettings } from '../../constants.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

// Settings
export const getSettings = async (): Promise<AppSettings> => {
    const { data, error } = await supabase.from('app_settings').select('settings_data').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') handleResponse({ data, error });
    return data ? mapObjectToCamelCase(data.settings_data) : initialSettings;
};

export const updateSettings = async (settings: AppSettings): Promise<AppSettings> => {
    const { data, error } = await supabase.from('app_settings').upsert({ id: 1, settings_data: mapObjectToSnakeCase(settings) }).select().single();
    return mapObjectToCamelCase(handleResponse({ data, error }).settings_data);
};
