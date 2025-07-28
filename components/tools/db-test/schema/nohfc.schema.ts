
import type { ModuleDefinition } from './types.schema.ts';

export const nohfcSchema: ModuleDefinition = {
    module: "NOHFC Module",
    tables: [
        {
            tableName: 'nohfc_applications',
            description: 'Stores a complete NOHFC Community Enhancement grant application draft.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'created_at', type: 'timestamp with time zone default now()' },
                { name: 'updated_at', type: 'timestamp with time zone default now()' },
                { name: 'project_id', type: 'uuid', foreignKey: { table: 'projects', column: 'id', onDelete: 'SET NULL' } },
                { name: 'infrastructure_id', type: 'uuid', foreignKey: { table: 'infrastructure', column: 'id', onDelete: 'SET NULL' } },
                { name: 'title', type: 'text' },
                { name: 'question_1a', type: 'text' },
                { name: 'question_1b', type: 'text' },
                { name: 'question_1c', type: 'text' },
                { name: 'question_1d', type: 'text' },
                { name: 'question_1e', type: 'text' },
                { name: 'question_1f', type: 'text' },
                { name: 'question_2a', type: 'text' },
                { name: 'question_2b', type: 'text' },
                { name: 'question_3a', type: 'text' },
                { name: 'question_3b', type: 'text' },
                { name: 'question_4a', type: 'text' },
                { name: 'question_4b', type: 'text' },
                { name: 'question_5a', type: 'text' },
                { name: 'question_5b', type: 'text' },
                { name: 'question_6a', type: 'text' },
                { name: 'question_6b', type: 'text' },
                { name: 'question_7a', type: 'text' },
                { name: 'question_7b', type: 'text' },
                { name: 'question_8a', type: 'text' },
                { name: 'question_8b', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access for NOHFC applications', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'nohfc_budget_items',
            description: 'Stores a budget item for an NOHFC application.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'application_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'nohfc_applications', column: 'id', onDelete: 'CASCADE' } },
                { name: 'category', type: 'text' },
                { name: 'item_description', type: 'text' },
                { name: 'cost_breakdown', type: 'text' },
                { name: 'requested_amount', type: 'numeric' },
                { name: 'justification', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access for NOHFC budget items', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};