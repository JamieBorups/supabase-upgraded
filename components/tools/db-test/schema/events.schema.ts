import { ModuleDefinition } from './types.ts';

export const eventsSchema: ModuleDefinition = {
    module: "Events & Venues",
    tables: [
        {
            tableName: 'venues',
            description: 'Represents a single venue where events can take place.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'name', type: 'text', constraints: 'not null' },
                { name: 'is_virtual', type: 'boolean', constraints: 'default false not null' },
                { name: 'status', type: 'text' },
                { name: 'address_street', type: 'text' }, { name: 'address_city', type: 'text' }, { name: 'address_province', type: 'text' },
                { name: 'address_postal_code', type: 'text' }, { name: 'address_country', type: 'text' },
                { name: 'capacity', type: 'integer' }, { name: 'url', type: 'text' },
                { name: 'contact_name', type: 'text' }, { name: 'contact_title', type: 'text' }, { name: 'contact_email', type: 'text' }, { name: 'contact_phone', type: 'text' },
                { name: 'notes', type: 'text' }, { name: 'default_cost_type', type: 'text' }, { name: 'default_cost', type: 'numeric' }, { name: 'default_cost_period', type: 'text' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }, { name: 'updated_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'events',
            description: 'Represents a single event, such as a performance or workshop.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', foreignKey: { table: 'projects', column: 'id', onDelete: 'SET NULL' } },
                { name: 'venue_id', type: 'uuid', foreignKey: { table: 'venues', column: 'id', onDelete: 'SET NULL' } },
                { name: 'title', type: 'text', constraints: 'not null' }, { name: 'description', type: 'text' },
                { name: 'status', type: 'text', constraints: 'not null' }, { name: 'category', type: 'text' },
                { name: 'tags', type: 'jsonb', constraints: 'not null default \'[]\'::jsonb' }, { name: 'is_all_day', type: 'boolean', constraints: 'not null default false' },
                { name: 'start_date', type: 'date', constraints: 'not null' }, { name: 'end_date', type: 'date', constraints: 'not null' },
                { name: 'start_time', type: 'time' }, { name: 'end_time', type: 'time' },
                { name: 'notes', type: 'text' }, { name: 'actual_attendance', type: 'integer' },
                { name: 'venue_cost_override', type: 'jsonb' }, { name: 'is_template', type: 'boolean', constraints: 'not null default false' },
                { name: 'parent_event_id', type: 'uuid', foreignKey: { table: 'events', column: 'id', onDelete: 'CASCADE' } },
                { name: 'is_override', type: 'boolean', constraints: 'not null default false' },
                { name: 'recurrence_rule', type: 'jsonb' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }, { name: 'updated_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'event_members',
            description: 'Join table linking members to events with a specific role.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'event_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'events', column: 'id', onDelete: 'CASCADE' } },
                { name: 'member_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'members', column: 'id', onDelete: 'CASCADE' } },
                { name: 'role', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'ticket_types',
            description: 'Represents a reusable type of ticket (e.g., General Admission, Student).',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'name', type: 'text', constraints: 'not null' }, { name: 'description', type: 'text' },
                { name: 'default_price', type: 'numeric', constraints: 'not null default 0' }, { name: 'is_free', type: 'boolean', constraints: 'not null default false' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }, { name: 'updated_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'event_tickets',
            description: 'Links a Ticket Type to an Event, defining its price and capacity for that specific event.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'event_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'events', column: 'id', onDelete: 'CASCADE' } },
                { name: 'ticket_type_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'ticket_types', column: 'id', onDelete: 'CASCADE' } },
                { name: 'price', type: 'numeric', constraints: 'not null default 0' }, { name: 'capacity', type: 'integer', constraints: 'not null default 0' }, { name: 'sold_count', type: 'integer', constraints: 'not null default 0' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
