
import { supabase } from '../../supabase.ts';
import { NewsRelease, Contact, Interaction } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse, mapContactToDb, mapContactFromDb } from './utils';

export const getNewsReleases = async (): Promise<NewsRelease[]> => mapObjectToCamelCase(handleResponse(await supabase.from('news_releases').select('*')));
export const addNewsRelease = async (release: NewsRelease): Promise<NewsRelease> => {
    const { id, ...rest } = release;
    return mapObjectToCamelCase(handleResponse(await supabase.from('news_releases').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const updateNewsRelease = async (id: string, release: NewsRelease): Promise<NewsRelease> => mapObjectToCamelCase(handleResponse(await supabase.from('news_releases').update(mapObjectToSnakeCase(release)).eq('id', id).select().single()));
export const deleteNewsRelease = async (id: string): Promise<void> => handleResponse(await supabase.from('news_releases').delete().eq('id', id));

export const getContacts = async (): Promise<Contact[]> => {
    const { data: contactsData, error } = await supabase.from('contacts').select('*, contact_projects(project_id)');
    handleResponse({ data: contactsData, error });
    return (contactsData || []).map(c => {
        const { contact_projects, ...rest } = c;
        const contact = mapContactFromDb(rest);
        contact.associatedProjectIds = contact_projects.map((cp: any) => cp.project_id);
        return contact;
    });
};
export const addContact = async (contact: Contact): Promise<Contact> => {
    const { id, ...restOfContact } = contact;
    const { data, error } = await supabase.from('contacts').insert(mapContactToDb(restOfContact)).select().single();
    handleResponse({data, error});
    if (contact.associatedProjectIds.length > 0) {
        await supabase.from('contact_projects').insert(contact.associatedProjectIds.map(pid => ({ contact_id: data.id, project_id: pid })));
    }
    return { ...mapContactFromDb(data), associatedProjectIds: contact.associatedProjectIds };
};
export const updateContact = async (id: string, contact: Contact): Promise<Contact> => {
    const { data, error } = await supabase.from('contacts').update(mapContactToDb(contact)).eq('id', id).select().single();
    handleResponse({data, error});
    await supabase.from('contact_projects').delete().eq('contact_id', id);
    if (contact.associatedProjectIds.length > 0) {
        await supabase.from('contact_projects').insert(contact.associatedProjectIds.map(pid => ({ contact_id: id, project_id: pid })));
    }
    return { ...mapContactFromDb(data), associatedProjectIds: contact.associatedProjectIds };
};
export const deleteContact = async (id: string): Promise<void> => handleResponse(await supabase.from('contacts').delete().eq('id', id));

export const getInteractions = async (): Promise<Interaction[]> => mapObjectToCamelCase(handleResponse(await supabase.from('interactions').select('*')));
export const addInteraction = async (interaction: Interaction): Promise<Interaction> => {
    const { id, ...rest } = interaction;
    return mapObjectToCamelCase(handleResponse(await supabase.from('interactions').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const deleteInteraction = async (id: string): Promise<void> => handleResponse(await supabase.from('interactions').delete().eq('id', id));
