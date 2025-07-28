
import type { ModuleDefinition } from './types.schema.ts';

export const infrastructureSchema: ModuleDefinition = {
    module: "Infrastructure",
    tables: [
        {
            tableName: 'infrastructure',
            description: 'Stores information about physical facilities and assets.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'not null default now()' },
                { name: 'updated_at', type: 'timestamp with time zone', constraints: 'not null default now()' },
                { name: 'name', type: 'text' },
                { name: 'facility_type', type: 'text' },
                { name: 'location', type: 'text' },
                { name: 'image_url', type: 'text' },
                { name: 'year_built', type: 'integer' },
                { name: 'description', type: 'text' },
                { name: 'current_status', type: 'text' },
                { name: 'last_inspection_date', type: 'date' },
                { name: 'condition_report_url', type: 'text' },
                { name: 'infrastructural_issues', type: 'text' },
                { name: 'deferred_maintenance_costs', type: 'numeric' },
                { name: 'lifecycle_status', type: 'text' },
                { name: 'maintenance_schedule', type: 'text' },
                { name: 'asset_value', type: 'numeric' },
                { name: 'internal_notes', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access for infrastructure', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
