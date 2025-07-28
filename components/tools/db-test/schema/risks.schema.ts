import type { ModuleDefinition } from './types.schema.ts';

export const risksSchema: ModuleDefinition = {
    module: "Risks",
    tables: [
        {
            tableName: 'risks',
            description: 'Stores risk and mitigation information for projects.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'not null default now()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'heading', type: 'text' },
                { name: 'risk_description', type: 'text' },
                { name: 'mitigation_plan', type: 'text' },
                { name: 'risk_level', type: 'text' },
                { name: 'additional_notes', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access for risks', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
