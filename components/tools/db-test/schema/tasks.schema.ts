import { ModuleDefinition } from './types.ts';

export const tasksSchema: ModuleDefinition = {
    module: "Budget, Tasks & Activities",
    tables: [
        {
            tableName: 'budget_items',
            description: 'Stores individual line items for a project\'s budget.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'type', type: 'text', constraints: 'not null' }, { name: 'category', type: 'text', constraints: 'not null' },
                { name: 'source', type: 'text' }, { name: 'description', type: 'text' }, { name: 'amount', type: 'numeric' },
                { name: 'actual_amount', type: 'numeric' }, { name: 'status', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'tasks',
            description: 'A single task or milestone within a project.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'task_code', type: 'text', constraints: 'unique' }, { name: 'title', type: 'text' }, { name: 'description', type: 'text' },
                { name: 'assigned_member_id', type: 'uuid', foreignKey: { table: 'members', column: 'id', onDelete: 'SET NULL' } },
                { name: 'status', type: 'text' }, { name: 'start_date', type: 'date' }, { name: 'due_date', type: 'date' },
                { name: 'task_type', type: 'text' },
                { name: 'parent_task_id', type: 'uuid', foreignKey: { table: 'tasks', column: 'id', onDelete: 'SET NULL' } },
                { name: 'is_complete', type: 'boolean' }, { name: 'estimated_hours', type: 'numeric' },
                { name: 'actual_hours', type: 'numeric' },
                { name: 'budget_item_id', type: 'uuid', foreignKey: { table: 'budget_items', column: 'id', onDelete: 'SET NULL' } },
                { name: 'work_type', type: 'text' }, { name: 'hourly_rate', type: 'numeric' }, { name: 'updated_at', type: 'timestamp with time zone' },
                { name: 'order_by', type: 'integer', constraints: 'not null default 0' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'activities',
            description: 'A time log entry against a task.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'task_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'tasks', column: 'id', onDelete: 'CASCADE' } },
                { name: 'member_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'members', column: 'id', onDelete: 'CASCADE' } },
                { name: 'description', type: 'text' },
                { name: 'start_date', type: 'date', constraints: 'not null' },
                { name: 'end_date', type: 'date', constraints: 'not null' },
                { name: 'start_time', type: 'time' },
                { name: 'end_time', type: 'time' },
                { name: 'hours', type: 'numeric', constraints: 'not null' },
                { name: 'status', type: 'text', constraints: 'not null' },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' },
                { name: 'updated_at', type: 'timestamp with time zone', constraints: 'default now() not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'direct_expenses',
            description: 'A direct, non-time-based expense linked to a project budget line.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'budget_item_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'budget_items', column: 'id', onDelete: 'CASCADE' } },
                { name: 'description', type: 'text' },
                { name: 'amount', type: 'numeric', constraints: 'not null' },
                { name: 'date', type: 'date', constraints: 'not null' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
