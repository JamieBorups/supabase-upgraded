import type { ModuleDefinition } from './types.schema.ts';

export const eventsSchema: ModuleDefinition = {
    module: "Events & Venues",
    tables: [
         {
            tableName: 'venues',
            description: 'Represents a single venue where events can take place.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'name', type: 'text' }, { name: 'is_virtual', type: 'boolean' }, { name: 'status', type: 'text' },
                { name: 'address_street', type: 'text' }, { name: 'address_city', type: 'text' }, { name: 'address_province', type: 'text' },
                { name: 'address_postal_code', type: 'text' }, { name: 'address_country', type: 'text' },
                { name: 'capacity', type: 'integer' }, { name: 'url', type: 'text' }, { name: 'contact_name', type: 'text' },
                { name: 'contact_title', type: 'text' }, { name: 'contact_email', type: 'text' }, { name: 'contact_phone', type: 'text' },
                { name: 'notes', type: 'text' }, { name: 'default_cost_type', type: 'text' }, { name: 'default_cost', type: 'numeric' },
                { name: 'default_cost_period', type: 'text' }, { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'updated_at', type: 'timestamp with time zone default now()' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'events',
            description: 'Represents a single event, such as a performance or workshop.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'venue_id', type: 'uuid', foreignKey: { table: 'venues', column: 'id', onDelete: 'SET NULL' } },
                { name: 'title', type: 'text' }, { name: 'description', type: 'text' }, { name: 'status', type: 'text' },
                { name: 'category', type: 'text' }, { name: 'tags', type: 'jsonb' }, { name: 'is_all_day', type: 'boolean' },
                { name: 'start_date', type: 'date' }, { name: 'end_date', type: 'date' }, { name: 'start_time', type: 'time' },
                { name: 'end_time', type: 'time' }, { name: 'notes', type: 'text' }, { name: 'actual_attendance', type: 'integer' },
                { name: 'venue_cost_override', type: 'jsonb' }, { name: 'is_template', type: 'boolean' },
                { name: 'parent_event_id', type: 'uuid', foreignKey: { table: 'events', column: 'id', onDelete: 'CASCADE' } },
                { name: 'is_override', type: 'boolean' }, { name: 'recurrence_rule', type: 'jsonb' },
                { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'updated_at', type: 'timestamp with time zone default now()' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'event_members',
            description: 'Join table linking members to events with roles.',
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
            description: 'Reusable types of tickets (e.g., General Admission).',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'name', type: 'text' }, { name: 'description', type: 'text' }, { name: 'default_price', type: 'numeric' },
                { name: 'is_free', type: 'boolean' }, { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'updated_at', type: 'timestamp with time zone default now()' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'event_tickets',
            description: 'Links a Ticket Type to an Event, defining its price and capacity.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'event_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'events', column: 'id', onDelete: 'CASCADE' } },
                { name: 'ticket_type_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'ticket_types', column: 'id', onDelete: 'CASCADE' } },
                { name: 'price', type: 'numeric' }, { name: 'capacity', type: 'integer' }, { name: 'sold_count', type: 'integer' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
