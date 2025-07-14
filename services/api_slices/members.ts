
import { supabase } from '../../supabase.ts';
import { Member, User } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

// Users
export const getUsers = async (): Promise<User[]> => mapObjectToCamelCase(handleResponse(await supabase.from('users').select('*')));
export const addUser = async (user: User): Promise<User> => {
    const { id, ...rest } = user;
    return mapObjectToCamelCase(handleResponse(await supabase.from('users').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const updateUser = async (id: string, user: Partial<User>): Promise<User> => mapObjectToCamelCase(handleResponse(await supabase.from('users').update(mapObjectToSnakeCase(user)).eq('id', id).select().single()));
export const deleteUser = async (id: string): Promise<void> => handleResponse(await supabase.from('users').delete().eq('id', id));

// Members
export const getMembers = async (): Promise<Member[]> => mapObjectToCamelCase(handleResponse(await supabase.from('members').select('*')));
export const addMember = async (member: Member): Promise<Member> => {
    const { id, ...rest } = member;
    return mapObjectToCamelCase(handleResponse(await supabase.from('members').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const updateMember = async (id: string, member: Member): Promise<Member> => mapObjectToCamelCase(handleResponse(await supabase.from('members').update(mapObjectToSnakeCase(member)).eq('id', id).select().single()));
export const deleteMember = async (id: string): Promise<void> => handleResponse(await supabase.from('members').delete().eq('id', id));
