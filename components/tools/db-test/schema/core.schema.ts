import type { ModuleDefinition } from './types.schema.ts';

export const coreSchema: ModuleDefinition = {
    module: "Core & Settings",
    tables: [
        {
            tableName: 'app_settings',
            description: 'Stores global application settings as a single JSONB object.',
            columns: [
                { name: 'id', type: 'integer', constraints: 'primary key' },
                { name: 'settings_data', type: 'jsonb', constraints: 'not null default \'{}\'::jsonb' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-only access', command: 'SELECT', using: 'true' }] }
        },
        {
            tableName: 'users',
            description: 'Stores user login credentials and roles.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'username', type: 'text', constraints: 'not null unique' },
                { name: 'password_hash', type: 'text', constraints: 'not null' },
                { name: 'role', type: 'text', constraints: 'not null default \'user\'' },
                { name: 'member_id', type: 'uuid', foreignKey: { table: 'members', column: 'id', onDelete: 'SET NULL' } }
            ],
            rls: { enable: true, policies: [{ name: 'Admins can manage users', command: 'ALL', using: '(select auth.jwt() ->> \'role\') = \'admin\'', check: '(select auth.jwt() ->> \'role\') = \'admin\'' }, { name: 'Users can view their own data', command: 'SELECT', using: 'auth.uid() = id' }] }
        }
    ]
};
