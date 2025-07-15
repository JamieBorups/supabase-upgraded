import { ModuleDefinition } from './types.ts';

export const crmSchema: ModuleDefinition = {
    module: "CRM",
    tables: [
        {
            tableName: 'contacts',
            description: 'Stores external contact information (CRM).',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'first_name', type: 'text' },
                { name: 'last_name', type: 'text' },
                { name: 'email', type: 'text' },
                { name: 'phone', type: 'text' },
                { name: 'title', type: 'text' },
                { name: 'organization', type: 'text' },
                { name: 'contact_type', type: 'text' },
                { name: 'address_street', type: 'text' },
                { name: 'address_city', type: 'text' },
                { name: 'address_province', type: 'text' },
                { name: 'address_postal_code', type: 'text' },
                { name: 'tags', type: 'jsonb', constraints: 'not null default \'[]\'::jsonb' },
                { name: 'notes', type: 'text' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' },
                { name: 'updated_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'contact_projects',
            description: 'Join table linking contacts to projects.',
            columns: [
                { name: 'contact_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'contacts', column: 'id', onDelete: 'CASCADE' } },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'interactions',
            description: 'Logs interactions with contacts.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'contact_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'contacts', column: 'id', onDelete: 'CASCADE' } },
                { name: 'date', type: 'date', constraints: 'not null' },
                { name: 'type', type: 'text', constraints: 'not null' },
                { name: 'notes', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'news_releases',
            description: 'Stores content for news releases and other communications.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'type', type: 'text' },
                { name: 'contact_member_id', type: 'uuid', foreignKey: { table: 'members', column: 'id', onDelete: 'SET NULL' } },
                { name: 'headline', type: 'text' },
                { name: 'subhead', type: 'text' },
                { name: 'publish_date', type: 'date' },
                { name: 'published_url', type: 'text' },
                { name: 'location', type: 'text' },
                { name: 'introduction', type: 'text' },
                { name: 'body', type: 'text' },
                { name: 'quotes', type: 'text' },
                { name: 'boilerplate', type: 'text' },
                { name: 'contact_info', type: 'text' },
                { name: 'status', type: 'text' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' },
                { name: 'updated_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
