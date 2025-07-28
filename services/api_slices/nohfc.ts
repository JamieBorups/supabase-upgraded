
import { supabase } from '../../supabase.ts';
import { NohfcApplication } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils.ts';

const mapApplicationFromDb = (dbApp: any): NohfcApplication => {
    const { nohfc_budget_items, ...rest } = dbApp;
    
    // The generic mapper converts question_1a -> question1a, which is wrong.
    // We apply the generic mapper first, then surgically correct the specific keys.
    const mappedApp = mapObjectToCamelCase(rest);

    // This loop corrects the property names that are mangled by the generic camelCase converter.
    // It finds keys like `question_1a` in the original database response, finds the incorrectly
    // converted key (e.g., `question1a`), and replaces it with the correct one.
    for (const originalKey in rest) {
        if (originalKey.startsWith('question_')) {
            const incorrectCamelKey = originalKey.replace(/_([a-z0-9])/g, (g) => g[1].toUpperCase());
            if (mappedApp.hasOwnProperty(incorrectCamelKey)) {
                mappedApp[originalKey] = mappedApp[incorrectCamelKey];
                delete mappedApp[incorrectCamelKey];
            } else {
                 mappedApp[originalKey] = rest[originalKey];
            }
        }
    }
    
    return {
        ...mappedApp,
        budgetItems: mapObjectToCamelCase(nohfc_budget_items || []),
    } as NohfcApplication;
};

export const getNohfcApplications = async (): Promise<NohfcApplication[]> => {
    const { data, error } = await supabase
        .from('nohfc_applications')
        .select(`*, nohfc_budget_items(*)`)
        .order('updated_at', { ascending: false });
    handleResponse({ data, error });
    return (data || []).map(mapApplicationFromDb);
};

export const addNohfcApplication = async (application: Omit<NohfcApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<NohfcApplication> => {
    const { budgetItems = [], ...appData } = application;
    
    const { data: mainData, error: mainError } = await supabase
        .from('nohfc_applications')
        .insert(mapObjectToSnakeCase(appData))
        .select()
        .single();
    handleResponse({ data: mainData, error: mainError });

    const appId = mainData.id;

    if (budgetItems.length > 0) {
        const itemsToInsert = budgetItems.map(item => {
            const { id, application_id, ...rest } = item; 
            return mapObjectToSnakeCase({ ...rest, application_id: appId });
        });
        const { error } = await supabase.from('nohfc_budget_items').insert(itemsToInsert);
        if (error) throw new Error(`Failed to save budget items: ${error.message}`);
    }

    const { data: finalData, error: finalError } = await supabase
        .from('nohfc_applications')
        .select(`*, nohfc_budget_items(*)`)
        .eq('id', appId)
        .single();
    handleResponse({ data: finalData, error: finalError });
    
    return mapApplicationFromDb(finalData);
};

export const updateNohfcApplication = async (id: string, application: NohfcApplication): Promise<NohfcApplication> => {
    const { budgetItems = [], ...appData } = application;
    const finalAppData = { ...appData, updatedAt: new Date().toISOString() };
    
    const { data: mainData, error: mainError } = await supabase
        .from('nohfc_applications')
        .update(mapObjectToSnakeCase(finalAppData))
        .eq('id', id)
        .select()
        .single();
    handleResponse({ data: mainData, error: mainError });
    
    const appId = mainData.id;

    await supabase.from('nohfc_budget_items').delete().eq('application_id', appId);
    if (budgetItems.length > 0) {
        const itemsToInsert = budgetItems.map(item => {
            const { id, application_id, ...rest } = item;
            return mapObjectToSnakeCase({ ...rest, application_id: appId });
        });
        const { error } = await supabase.from('nohfc_budget_items').insert(itemsToInsert);
        if (error) throw new Error(`Failed to save budget items: ${error.message}`);
    }

    const { data: finalData, error: finalError } = await supabase
        .from('nohfc_applications')
        .select(`*, nohfc_budget_items(*)`)
        .eq('id', appId)
        .single();
    handleResponse({ data: finalData, error: finalError });
    
    return mapApplicationFromDb(finalData);
};


export const deleteNohfcApplication = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('nohfc_applications').delete().eq('id', id));
};
