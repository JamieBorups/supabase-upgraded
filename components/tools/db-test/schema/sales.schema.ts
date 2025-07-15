import { ModuleDefinition } from './types.ts';

export const salesSchema: ModuleDefinition = {
    module: "Sales & Inventory",
    tables: [
        {
            tableName: 'inventory_categories',
            description: 'A category for organizing inventory items.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'name', type: 'text', constraints: 'not null' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'inventory_items',
            description: 'Represents a single item for sale or use.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'category_id', type: 'uuid', foreignKey: { table: 'inventory_categories', column: 'id', onDelete: 'SET NULL' } },
                { name: 'name', type: 'text', constraints: 'not null' }, { name: 'description', type: 'text' }, { name: 'sku', type: 'text' },
                { name: 'cost_price', type: 'numeric', constraints: 'not null default 0' }, { name: 'sale_price', type: 'numeric', constraints: 'not null default 0' },
                { name: 'current_stock', type: 'integer', constraints: 'not null default 0' }, { name: 'track_stock', type: 'boolean', constraints: 'not null default true' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }, { name: 'updated_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'sale_sessions',
            description: 'A container for a specific sales period or context.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'name', type: 'text', constraints: 'not null' },
                { name: 'expected_revenue', type: 'numeric', constraints: 'not null default 0' },
                { name: 'organizer_type', type: 'text' }, { name: 'association_type', type: 'text' },
                { name: 'project_id', type: 'uuid', foreignKey: { table: 'projects', column: 'id', onDelete: 'SET NULL' } },
                { name: 'event_id', type: 'uuid', foreignKey: { table: 'events', column: 'id', onDelete: 'SET NULL' } },
                { name: 'partner_name', type: 'text' }, { name: 'partner_contact_id', type: 'uuid', foreignKey: { table: 'contacts', column: 'id', onDelete: 'SET NULL' } },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }, { name: 'updated_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'sale_listings',
            description: 'Links an inventory item to a sale session, making it available for sale.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'sale_session_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'sale_sessions', column: 'id', onDelete: 'CASCADE' } },
                { name: 'inventory_item_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'inventory_items', column: 'id', onDelete: 'CASCADE' } }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'item_lists',
            description: 'A printable menu or price list for an event, composed of inventory items.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'name', type: 'text', constraints: 'not null' },
                { name: 'event_id', type: 'uuid', foreignKey: { table: 'events', column: 'id', onDelete: 'SET NULL' } },
                { name: 'item_order', type: 'jsonb', constraints: 'not null default \'[]\'::jsonb' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }, { name: 'updated_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'sales_transactions',
            description: 'The header for a single sales transaction (a receipt).',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'sale_session_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'sale_sessions', column: 'id', onDelete: 'RESTRICT' } },
                { name: 'notes', type: 'text' }, { name: 'subtotal', type: 'numeric', constraints: 'not null default 0' },
                { name: 'taxes', type: 'numeric', constraints: 'not null default 0' }, { name: 'total', type: 'numeric', constraints: 'not null default 0' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'sales_transaction_items',
            description: 'A line item within a sales transaction.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'transaction_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'sales_transactions', column: 'id', onDelete: 'CASCADE' } },
                { name: 'inventory_item_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'inventory_items', column: 'id', onDelete: 'RESTRICT' } },
                { name: 'quantity', type: 'integer', constraints: 'not null' }, { name: 'price_per_item', type: 'numeric', constraints: 'not null' },
                { name: 'item_total', type: 'numeric', constraints: 'not null' }, { name: 'is_voucher_redemption', type: 'boolean', constraints: 'not null default false' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
