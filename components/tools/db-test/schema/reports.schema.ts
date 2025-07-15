import { ModuleDefinition } from './types.ts';

export const reportsSchema: ModuleDefinition = {
    module: "Reports & Archives",
    tables: [
        {
            tableName: 'reports',
            description: 'Stores the narrative content for a project\'s final report.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null unique', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'project_results', type: 'text' }, { name: 'grant_spending_description', type: 'text' }, { name: 'workplan_adjustments', type: 'text' },
                { name: 'involved_people', type: 'jsonb' }, { name: 'involved_activities', type: 'jsonb' },
                { name: 'impact_statements', type: 'jsonb' }, { name: 'feedback', type: 'text' }, { name: 'additional_feedback', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'highlights',
            description: 'A simple link to an external resource (e.g., press, video) for a project.',
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
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' },
                { name: 'updated_at', type: 'timestamp with time zone' },
                { name: 'notes', type: 'text' }, { name: 'project_data', type: 'jsonb' }, { name: 'tasks', type: 'jsonb' }, { name: 'calculated_metrics', type: 'jsonb' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'ecostar_reports',
            description: 'Stores generated ECO-STAR reports for projects.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }, { name: 'notes', type: 'text' },
                { name: 'environment_report', type: 'jsonb' }, { name: 'customer_report', type: 'jsonb' }, { name: 'opportunity_report', type: 'jsonb' },
                { name: 'solution_report', type: 'jsonb' }, { name: 'team_report', type: 'jsonb' }, { name: 'advantage_report', type: 'jsonb' },
                { name: 'results_report', type: 'jsonb' }, { name: 'full_report_text', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'interest_compatibility_reports',
            description: 'Stores generated Interest Compatibility reports for projects.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }, { name: 'notes', type: 'text' },
                { name: 'executive_summary', type: 'text' }, { name: 'stakeholder_analysis', type: 'jsonb' }, { name: 'high_compatibility_areas', type: 'jsonb' },
                { name: 'potential_conflicts', type: 'jsonb' }, { name: 'actionable_recommendations', type: 'jsonb' }, { name: 'full_report_text', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'sdg_alignment_reports',
            description: 'Stores generated SDG Alignment reports for projects.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }, { name: 'notes', type: 'text' },
                { name: 'executive_summary', type: 'text' }, { name: 'detailed_analysis', type: 'jsonb' }, { name: 'strategic_recommendations', type: 'jsonb' }, { name: 'full_report_text', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'recreation_framework_reports',
            description: 'Stores generated Framework for Recreation reports for projects.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'project_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'projects', column: 'id', onDelete: 'CASCADE' } },
                { name: 'created_at', type: 'timestamp with time zone', constraints: 'default now() not null' }, { name: 'notes', type: 'text' },
                { name: 'executive_summary', type: 'text' }, { name: 'active_living', type: 'text' }, { name: 'inclusion_and_access', type: 'text' },
                { name: 'connecting_people_with_nature', type: 'text' }, { name: 'supportive_environments', type: 'text' },
                { name: 'recreation_capacity', type: 'text' }, { name: 'closing_section', type: 'text' }, { name: 'full_report_text', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
