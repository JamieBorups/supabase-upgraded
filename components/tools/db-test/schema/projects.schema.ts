

import type { ModuleDefinition } from './types.schema.ts';

export const projectsSchema: ModuleDefinition = {
    module: "Projects & Members",
    tables: [
        {
            tableName: 'members',
            description: 'Represents a single member of the collective.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'member_id', type: 'text' }, { name: 'first_name', type: 'text' }, { name: 'last_name', type: 'text' }, { name: 'email', type: 'text', constraints: 'unique' },
                { name: 'province', type: 'text' }, { name: 'city', type: 'text' }, { name: 'postal_code', type: 'text' },
                { name: 'image_url', type: 'text' }, { name: 'short_bio', type: 'text' }, { name: 'artist_bio', type: 'text' }, { name: 'availability', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'projects',
            description: 'Central data object for an artistic project.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_title', type: 'text' }, { name: 'status', type: 'text' }, { name: 'artistic_disciplines', type: 'jsonb' },
                { name: 'craft_genres', type: 'jsonb' }, { name: 'dance_genres', type: 'jsonb' }, { name: 'literary_genres', type: 'jsonb' },
                { name: 'media_genres', type: 'jsonb' }, { name: 'music_genres', type: 'jsonb' }, { name: 'theatre_genres', type: 'jsonb' },
                { name: 'visual_arts_genres', type: 'jsonb' }, { name: 'other_artistic_discipline_specify', type: 'text' },
                { name: 'project_start_date', type: 'date' }, { name: 'project_end_date', type: 'date' }, { name: 'activity_type', type: 'text' },
                { name: 'background', type: 'text' }, { name: 'project_description', type: 'text' }, { name: 'audience', type: 'text' },
                { name: 'payment_and_conditions', type: 'text' }, { name: 'schedule', type: 'text' }, { name: 'cultural_integrity', type: 'text' },
                { name: 'community_impact', type: 'text' }, { name: 'organizational_rationale', type: 'text' }, { name: 'artistic_development', type: 'text' },
                { name: 'additional_info', type: 'text' }, { name: 'who_will_work', type: 'text' }, { name: 'how_selection_determined', type: 'text' },
                { name: 'image_url', type: 'text' },
                { name: 'risk_intro_text', type: 'text' },
                { name: 'estimated_sales', type: 'numeric' }, { name: 'estimated_sales_date', type: 'date' },
                { name: 'actual_sales', type: 'numeric' }, { name: 'actual_sales_date', type: 'date' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'project_collaborators',
            description: 'Join table linking members to projects with a specific role.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'member_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'members', column: 'id', onDelete: 'CASCADE' } },
                { name: 'role', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'related_projects',
            description: 'A library of related projects (internal or external) for citation in research plans.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'not null default now()' },
                { name: 'updated_at', type: 'timestamp with time zone', constraints: 'not null default now()' },
                { name: 'title', type: 'text' },
                { name: 'organizations', type: 'text' },
                { name: 'report_url', type: 'text' },
                { name: 'description', type: 'text' },
                { name: 'notes', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'related_project_associations',
            description: 'Join table linking related projects to internal projects.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'related_project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'related_projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};