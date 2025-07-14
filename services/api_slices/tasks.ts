
import { supabase } from '../../supabase.ts';
import { Task, Activity, DirectExpense } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

export const getTasks = async (): Promise<Task[]> => mapObjectToCamelCase(handleResponse(await supabase.from('tasks').select('*')));
export const addTask = async (task: Task): Promise<Task> => {
    const { id, ...rest } = task;
    return mapObjectToCamelCase(handleResponse(await supabase.from('tasks').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const addTasks = async (tasks: Task[]): Promise<Task[]> => {
    const tasksToInsert = tasks.map(t => {
        const { id, ...rest } = t;
        return mapObjectToSnakeCase(rest);
    });
    return mapObjectToCamelCase(handleResponse(await supabase.from('tasks').insert(tasksToInsert).select()));
};
export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => mapObjectToCamelCase(handleResponse(await supabase.from('tasks').update(mapObjectToSnakeCase(task)).eq('id', id).select().single()));
export const deleteTask = async (id: string): Promise<void> => handleResponse(await supabase.from('tasks').delete().eq('id', id));

export const getActivities = async (): Promise<Activity[]> => mapObjectToCamelCase(handleResponse(await supabase.from('activities').select('*')));
export const addActivities = async (activities: Activity[]): Promise<Activity[]> => {
    const activitiesToInsert = activities.map(a => {
        const { id, ...rest } = a;
        return mapObjectToSnakeCase(rest);
    });
    return mapObjectToCamelCase(handleResponse(await supabase.from('activities').insert(activitiesToInsert).select()));
};
export const updateActivity = async (id: string, activity: Partial<Activity>): Promise<Activity> => mapObjectToCamelCase(handleResponse(await supabase.from('activities').update(mapObjectToSnakeCase(activity)).eq('id', id).select().single()));
export const approveActivity = async (id: string): Promise<Activity> => mapObjectToCamelCase(handleResponse(await supabase.from('activities').update({ status: 'Approved' }).eq('id', id).select().single()));
export const deleteActivity = async (id: string): Promise<void> => handleResponse(await supabase.from('activities').delete().eq('id', id));

export const getDirectExpenses = async (): Promise<DirectExpense[]> => mapObjectToCamelCase(handleResponse(await supabase.from('direct_expenses').select('*')));
export const addDirectExpense = async (expense: DirectExpense): Promise<DirectExpense> => {
    const { id, ...rest } = expense;
    return mapObjectToCamelCase(handleResponse(await supabase.from('direct_expenses').insert(mapObjectToSnakeCase(rest)).select().single()));
};
