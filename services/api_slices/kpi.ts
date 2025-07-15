
import { supabase } from '../../supabase.ts';
import { Kpi, ProjectKpi, KpiReport } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

// --- KPI Library ---
export const getKpiLibrary = async (): Promise<Kpi[]> => mapObjectToCamelCase(handleResponse(await supabase.from('kpi_library').select('*')));
export const addKpiToLibrary = async (kpi: Omit<Kpi, 'id'|'created_at'>): Promise<Kpi> => mapObjectToCamelCase(handleResponse(await supabase.from('kpi_library').insert(mapObjectToSnakeCase(kpi)).select().single()));
export const addKpisToLibrary = async (kpis: Omit<Kpi, 'id'|'created_at'>[]): Promise<Kpi[]> => mapObjectToCamelCase(handleResponse(await supabase.from('kpi_library').insert(kpis.map(mapObjectToSnakeCase)).select()));
export const updateKpiInLibrary = async (id: string, kpi: Partial<Kpi>): Promise<Kpi> => mapObjectToCamelCase(handleResponse(await supabase.from('kpi_library').update(mapObjectToSnakeCase(kpi)).eq('id', id).select().single()));
export const deleteKpiFromLibrary = async (id: string): Promise<void> => handleResponse(await supabase.from('kpi_library').delete().eq('id', id));

// --- Project KPIs ---
export const getProjectKpis = async (): Promise<ProjectKpi[]> => mapObjectToCamelCase(handleResponse(await supabase.from('project_kpis').select('*')));
export const addProjectKpis = async (projectKpis: Omit<ProjectKpi, 'id'|'created_at'>[]): Promise<ProjectKpi[]> => mapObjectToCamelCase(handleResponse(await supabase.from('project_kpis').insert(projectKpis.map(mapObjectToSnakeCase)).select()));
export const updateProjectKpi = async (id: string, kpi: Partial<ProjectKpi>): Promise<ProjectKpi> => mapObjectToCamelCase(handleResponse(await supabase.from('project_kpis').update(mapObjectToSnakeCase(kpi)).eq('id', id).select().single()));
export const deleteProjectKpi = async (id: string): Promise<void> => handleResponse(await supabase.from('project_kpis').delete().eq('id', id));

// --- KPI Reports ---
export const getKpiReports = async (): Promise<KpiReport[]> => mapObjectToCamelCase(handleResponse(await supabase.from('kpi_reports').select('*')));
export const addKpiReport = async (report: Omit<KpiReport, 'id'|'created_at'>): Promise<KpiReport> => mapObjectToCamelCase(handleResponse(await supabase.from('kpi_reports').insert(mapObjectToSnakeCase(report)).select().single()));
export const deleteKpiReport = async (id: string): Promise<void> => handleResponse(await supabase.from('kpi_reports').delete().eq('id', id));
