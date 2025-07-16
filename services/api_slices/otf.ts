
import { supabase } from '../../supabase.ts';
import { OtfApplication } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

const mapApplicationFromDb = (dbApp: any): OtfApplication => {
    const { 
        otf_board_members, 
        otf_senior_staff, 
        otf_collaborators, 
        otf_project_plan, 
        otf_budget_items, 
        otf_quotes,
        otf_larger_project_funding,
        ...rest
    } = dbApp;
    const camelApp = mapObjectToCamelCase(rest);
    return {
        ...camelApp,
        boardMembers: mapObjectToCamelCase(otf_board_members || []),
        seniorStaff: mapObjectToCamelCase(otf_senior_staff || []),
        collaborators: mapObjectToCamelCase(otf_collaborators || []),
        projectPlan: mapObjectToCamelCase(otf_project_plan || []).sort((a: any, b: any) => a.order - b.order),
        budgetItems: mapObjectToCamelCase(otf_budget_items || []),
        quotes: mapObjectToCamelCase(otf_quotes || []),
        largerProjectFundingSources: mapObjectToCamelCase(otf_larger_project_funding || [])
    } as OtfApplication;
}

export const getOtfApplications = async (): Promise<OtfApplication[]> => {
    const { data, error } = await supabase
        .from('otf_applications')
        .select(`
            *,
            otf_board_members(*),
            otf_senior_staff(*),
            otf_collaborators(*),
            otf_project_plan(*),
            otf_budget_items(*),
            otf_quotes(*),
            otf_larger_project_funding(*)
        `)
        .order('updated_at', { ascending: false });
    handleResponse({ data, error });
    return (data || []).map(mapApplicationFromDb);
};

const saveOtfApplication = async (application: Partial<OtfApplication>): Promise<OtfApplication> => {
    const {
        id, createdAt,
        boardMembers = [], seniorStaff = [], collaborators = [], projectPlan = [], budgetItems = [], quotes = [], largerProjectFundingSources = [],
        ...appData
    } = application;

    const finalAppData = { ...appData, updatedAt: new Date().toISOString() };
    
    const { data: mainData, error: mainError } = await supabase
        .from('otf_applications')
        .upsert(mapObjectToSnakeCase({ id, ...finalAppData }))
        .select()
        .single();
    handleResponse({ data: mainData, error: mainError });

    const appId = mainData.id;

    // --- SUB-TABLE HANDLING ---
    const processSubTable = async (tableName: string, data: any[]) => {
        if (data && data.length > 0) {
            const itemsToInsert = data.map(item => {
                const { id, application_id, ...rest } = item; 
                return mapObjectToSnakeCase({ ...rest, application_id: appId });
            });
            const { error } = await supabase.from(tableName).insert(itemsToInsert);
            if (error) throw new Error(`Failed to save items to ${tableName}: ${error.message}`);
        }
    };
    
    // Clear existing related data first
    const tableNames = ['otf_board_members', 'otf_senior_staff', 'otf_collaborators', 'otf_project_plan', 'otf_budget_items', 'otf_quotes', 'otf_larger_project_funding'];
    await Promise.all(tableNames.map(table => supabase.from(table).delete().eq('application_id', appId)));
    
    // Insert new related data
    await Promise.all([
        processSubTable('otf_board_members', boardMembers),
        processSubTable('otf_senior_staff', seniorStaff),
        processSubTable('otf_collaborators', collaborators),
        processSubTable('otf_project_plan', projectPlan.map((p, i) => ({...p, order: i + 1}))),
        processSubTable('otf_budget_items', budgetItems),
        processSubTable('otf_quotes', quotes),
        processSubTable('otf_larger_project_funding', largerProjectFundingSources)
    ]);

    // Refetch the full application to ensure client state is consistent with DB
    const { data: finalData, error: finalError } = await supabase
        .from('otf_applications')
        .select(`*, otf_board_members(*), otf_senior_staff(*), otf_collaborators(*), otf_project_plan(*), otf_budget_items(*), otf_quotes(*), otf_larger_project_funding(*)`)
        .eq('id', appId)
        .single();
    handleResponse({ data: finalData, error: finalError });
    
    return mapApplicationFromDb(finalData);
};


export const addOtfApplication = async (application: Omit<OtfApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<OtfApplication> => {
    return saveOtfApplication(application);
};

export const updateOtfApplication = async (id: string, application: OtfApplication): Promise<OtfApplication> => {
    return saveOtfApplication({ ...application, id });
};

export const deleteOtfApplication = async (id: string): Promise<void> => {
    return handleResponse(await supabase.from('otf_applications').delete().eq('id', id));
};
