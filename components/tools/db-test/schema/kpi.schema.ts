import { ModuleDefinition } from './types.ts';

export const kpiSchema: ModuleDefinition = {
    module: "KPIs",
    tables: [
        {
            tableName: 'kpi_library',
            description: 'A master library of all available Key Performance Indicators.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'kpi_id', type: 'text', constraints: 'not null unique' },
                { name: 'title', type: 'text', constraints: 'not null' },
                { name: 'description', type: 'text' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'project_kpis',
            description: 'Links KPIs from the library to specific projects.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'kpi_library_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'kpi_library', column: 'id', onDelete: 'CASCADE' } },
                { name: 'relevance_notes', type: 'text' },
                { name: 'target_value', type: 'text' },
                { name: 'current_value', type: 'text' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'kpi_reports',
            description: 'Stores generated KPI reports for projects.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'notes', type: 'text' },
                { name: 'full_report_text', type: 'text' },
                { name: 'kpi_data', type: 'jsonb' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
