
// --- DB SCHEMA TYPES ---
export interface RlsPolicy {
    name: string;
    command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
    using: string;
    check?: string;
}

export interface ForeignKey {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

export interface ColumnDefinition {
    name: string;
    type: string;
    constraints?: string;
    foreignKey?: ForeignKey;
}

export interface TableDefinition {
    tableName: string;
    description: string;
    columns: ColumnDefinition[];
    rls: {
        enable: boolean;
        policies: RlsPolicy[];
    };
}

export interface ModuleDefinition {
    module: string;
    tables: TableDefinition[];
}


// --- DB SCHEMA DEFINITION ---
// This object defines the entire relational database schema for the application.
export const dbSchema: ModuleDefinition[] = [
    {
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
    },
    {
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
            }
        ]
    },
    {
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
                    { name: 'description', type: 'text' }, { name: 'start_date', type: 'date' }, { name: 'end_date', type: 'date' },
                    { name: 'start_time', type: 'time' }, { name: 'end_time', type: 'time' }, { name: 'hours', type: 'numeric' },
                    { name: 'status', type: 'text' }, { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'updated_at', type: 'timestamp with time zone default now()' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            },
            {
                tableName: 'direct_expenses',
                description: 'A direct, non-time-based expense.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'budget_item_id', type: 'uuid', foreignKey: { table: 'budget_items', column: 'id', onDelete: 'SET NULL' } },
                    { name: 'description', type: 'text' }, { name: 'amount', type: 'numeric' }, { name: 'date', type: 'date' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            }
        ]
    },
    {
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
    },
    {
        module: "CRM & Media",
        tables: [
            {
                tableName: 'contacts',
                description: 'Represents an external contact.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'first_name', type: 'text' }, { name: 'last_name', type: 'text' }, { name: 'email', type: 'text' },
                    { name: 'phone', type: 'text' }, { name: 'title', type: 'text' }, { name: 'organization', type: 'text' },
                    { name: 'contact_type', type: 'text' }, { name: 'address_street', type: 'text' }, { name: 'address_city', type: 'text' },
                    { name: 'address_province', type: 'text' }, { name: 'address_postal_code', type: 'text' },
                    { name: 'tags', type: 'jsonb' }, { name: 'notes', type: 'text' }, { name: 'created_at', type: 'timestamp with time zone default now()' },
                    { name: 'updated_at', type: 'timestamp with time zone default now()' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            },
            {
                tableName: 'contact_projects',
                description: 'Join table linking contacts to projects.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'contact_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'contacts', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            },
            {
                tableName: 'interactions',
                description: 'A single interaction log with a contact.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'contact_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'contacts', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'date', type: 'date' }, { name: 'type', type: 'text' }, { name: 'notes', type: 'text' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            },
            {
                tableName: 'news_releases',
                description: 'Stores content for a news release or communication.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'project_id', type: 'uuid', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'type', type: 'text' },
                    { name: 'contact_member_id', type: 'uuid', foreignKey: { table: 'members', column: 'id', onDelete: 'SET NULL' } },
                    { name: 'headline', type: 'text' }, { name: 'subhead', type: 'text' }, { name: 'publish_date', type: 'date' },
                    { name: 'published_url', type: 'text' }, { name: 'location', type: 'text' }, { name: 'introduction', type: 'text' },
                    { name: 'body', type: 'text' }, { name: 'quotes', type: 'text' }, { name: 'boilerplate', type: 'text' },
                    { name: 'contact_info', type: 'text' }, { name: 'status', type: 'text' },
                    { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'updated_at', type: 'timestamp with time zone default now()' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            }
        ]
    },
    {
        module: "Reports & Archives",
        tables: [
            {
                tableName: 'reports',
                description: 'Narrative content for a project\'s final report.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'project_id', type: 'uuid', constraints: 'not null unique', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'project_results', type: 'text' }, { name: 'grant_spending_description', type: 'text' },
                    { name: 'workplan_adjustments', type: 'text' }, { name: 'involved_people', type: 'jsonb' },
                    { name: 'involved_activities', type: 'jsonb' }, { name: 'impact_statements', type: 'jsonb' },
                    { name: 'feedback', type: 'text' }, { name: 'additional_feedback', type: 'text' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            },
            {
                tableName: 'highlights',
                description: 'A link to an external resource (e.g., press, video).',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'title', type: 'text' }, { name: 'url', type: 'text' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            },
            {
                tableName: 'proposal_snapshots',
                description: 'A point-in-time, read-only copy of a project\'s data.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'updated_at', type: 'timestamp with time zone' },
                    { name: 'notes', type: 'text' }, { name: 'project_data', type: 'jsonb' }, { name: 'tasks', type: 'jsonb' },
                    { name: 'calculated_metrics', type: 'jsonb' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            },
            {
                tableName: 'ecostar_reports',
                description: 'Stores generated ECO-STAR reports.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'notes', type: 'text' },
                    { name: 'environment_report', type: 'jsonb' }, { name: 'customer_report', type: 'jsonb' },
                    { name: 'opportunity_report', type: 'jsonb' }, { name: 'solution_report', type: 'jsonb' },
                    { name: 'team_report', type: 'jsonb' }, { name: 'advantage_report', type: 'jsonb' },
                    { name: 'results_report', type: 'jsonb' }, { name: 'full_report_text', type: 'text' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            },
            {
                tableName: 'interest_compatibility_reports',
                description: 'Stores generated Interest Compatibility reports.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'notes', type: 'text' },
                    { name: 'executive_summary', type: 'text' }, { name: 'stakeholder_analysis', type: 'jsonb' },
                    { name: 'high_compatibility_areas', type: 'jsonb' }, { name: 'potential_conflicts', type: 'jsonb' },
                    { name: 'actionable_recommendations', type: 'jsonb' }, { name: 'full_report_text', type: 'text' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            },
            {
                tableName: 'sdg_alignment_reports',
                description: 'Stores generated SDG Alignment reports.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'notes', type: 'text' },
                    { name: 'executive_summary', type: 'text' }, { name: 'detailed_analysis', type: 'jsonb' },
                    { name: 'strategic_recommendations', type: 'jsonb' }, { name: 'full_report_text', type: 'text' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            },
             {
                tableName: 'recreation_framework_reports',
                description: 'Stores generated Framework for Recreation reports.',
                columns: [
                    { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                    { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                    { name: 'created_at', type: 'timestamp with time zone default now()' }, { name: 'notes', type: 'text' },
                    { name: 'executive_summary', type: 'text' }, { name: 'active_living', type: 'text' },
                    { name: 'inclusion_and_access', type: 'text' }, { name: 'connecting_people_with_nature', type: 'text' },
                    { name: 'supportive_environments', type: 'text' }, { name: 'recreation_capacity', type: 'text' },
                    { name: 'closing_section', type: 'text' }, { name: 'full_report_text', type: 'text' }
                ],
                rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
            }
        ]
    },
    {
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
    }
];