import type { ModuleDefinition } from './types.schema.ts';

export const salesSchema: ModuleDefinition = {
    module: "Sales & Marketplace",
    tables: [
         {
            tableName: 'inventory_categories',
            description: 'Categories for organizing inventory items.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'name', type: 'text', constraints: 'not null unique' },
                { name: 'created_at', type: 'timestamp with time zone default now()' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'inventory_items',
            description: 'A single item for sale or use.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'category_id', type: 'uuid', foreignKey: { table: 'inventory_categories', column: 'id', onDelete: 'SET NULL' } },
                { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'updated_at', type: 'timestamp with time zone default now()' },
                { name: 'name', type: 'text' }, { name: 'description', type: 'text' }, { name: 'sku', type: 'text' },
                { name: 'cost_price', type: 'numeric' }, { name: 'sale_price', type: 'numeric' }, { name: 'current_stock', type: 'integer' },
                { name: 'track_stock', type: 'boolean' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
         {
            tableName: 'sale_sessions',
            description: 'A container for a specific sales period or context.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'name', type: 'text' }, { name: 'expected_revenue', type: 'numeric' },
                { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'updated_at', type: 'timestamp with time zone default now()' },
                { name: 'organizer_type', type: 'text' }, { name: 'association_type', type: 'text' },
                { name: 'project_id', type: 'uuid', foreignKey: { table: 'projects', column: 'id', onDelete: 'SET NULL' } },
                { name: 'event_id', type: 'uuid', foreignKey: { table: 'events', column: 'id', onDelete: 'SET NULL' } },
                { name: 'partner_name', type: 'text' },
                { name: 'partner_contact_id', type: 'uuid', foreignKey: { table: 'contacts', column: 'id', onDelete: 'SET NULL' } }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'sale_listings',
            description: 'Join table linking inventory items to a sale session.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'sale_session_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'sale_sessions', column: 'id', onDelete: 'CASCADE' } },
                { name: 'inventory_item_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'inventory_items', column: 'id', onDelete: 'CASCADE' } },
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'sales_transactions',
            description: 'The header for a single sales transaction (a receipt).',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'sale_session_id', type: 'uuid', foreignKey: { table: 'sale_sessions', column: 'id', onDelete: 'SET NULL' } },
                { name: 'created_at', type: 'timestamp with time zone default now()' },
                { name: 'notes', type: 'text' }, { name: 'subtotal', type: 'numeric' }, { name: 'taxes', type: 'numeric' },
                { name: 'total', type: 'numeric' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'sales_transaction_items',
            description: 'A line item within a sales transaction.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'transaction_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'sales_transactions', column: 'id', onDelete: 'CASCADE' } },
                { name: 'inventory_item_id', type: 'uuid', foreignKey: { table: 'inventory_items', column: 'id', onDelete: 'SET NULL' } },
                { name: 'quantity', type: 'integer' }, { name: 'price_per_item', type: 'numeric' },
                { name: 'item_total', type: 'numeric' }, { name: 'is_voucher_redemption', type: 'boolean' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'item_lists',
            description: 'A printable menu or price list for an event, composed of inventory items.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'name', type: 'text' },
                { name: 'event_id', type: 'uuid', foreignKey: { table: 'events', column: 'id', onDelete: 'SET NULL' } },
                { name: 'item_order', type: 'jsonb' },
                { name: 'created_at', type: 'timestamp with time zone default now()' },
                { name: 'updated_at', type: 'timestamp with time zone default now()' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
