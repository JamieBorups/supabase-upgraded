import type { ModuleDefinition } from './types.schema.ts';

export const otfSchema: ModuleDefinition = {
    module: "OTF Module",
    tables: [
        {
            tableName: 'program_guidelines',
            description: 'Stores structured guidelines for specific funding programs like OTF.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'created_at', type: 'timestamp with time zone default now()' },
                { name: 'name', type: 'text', constraints: 'not null unique' },
                { name: 'description', type: 'text' },
                { name: 'guideline_data', type: 'jsonb' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'otf_applications',
            description: 'Stores a complete OTF grant application draft.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'created_at', type: 'timestamp with time zone default now()' },
                { name: 'updated_at', type: 'timestamp with time zone default now()' },
                { name: 'project_id', type: 'uuid', foreignKey: { table: 'projects', column: 'id', onDelete: 'SET NULL' } },
                { name: 'title', type: 'text' },
                { name: 'basic_idea', type: 'text' }, { name: 'mission_statement', type: 'text' }, { name: 'activities_description', type: 'text' },
                { name: 'sector', type: 'text' }, { name: 'people_served_annually', type: 'integer' }, { name: 'offers_bilingual_services', type: 'boolean' },
                { name: 'bilingual_mandate_type', type: 'text' }, { name: 'serves_francophone_population', type: 'boolean' },
                { name: 'french_services_people_percentage', type: 'integer' }, { name: 'french_programs_percentage', type: 'integer' },
                { name: 'paid_staff_count', type: 'integer' }, { name: 'volunteer_count', type: 'integer' },
                { name: 'language_population_served', type: 'jsonb' }, { name: 'gender_population_served', type: 'jsonb' },
                { name: 'lived_experience_population_served', type: 'jsonb' }, { name: 'identity_population_served', type: 'jsonb' },
                { name: 'leadership_reflects_community', type: 'text' }, { name: 'financial_statement_url', type: 'text' },
                { name: 'has_surplus_or_deficit', type: 'boolean' }, { name: 'surplus_deficit_info_url', type: 'text' },
                { name: 'has_min_three_board_members', type: 'boolean' }, { name: 'by_laws_url', type: 'text' },
                { name: 'confirm_financial_management', type: 'boolean' }, { name: 'confirm_info_correct', type: 'boolean' }, { name: 'confirm_financials_updated', type: 'boolean' },
                { name: 'otf_supports_used', type: 'jsonb' }, { name: 'proj_age_group', type: 'text' }, { name: 'proj_language', type: 'text' },
                { name: 'proj_gender', type: 'text' }, { name: 'proj_lived_experience', type: 'text' }, { name: 'proj_identity', type: 'text' },
                { name: 'proj_community_size', type: 'text' }, { name: 'proj_description', type: 'text' }, { name: 'proj_otf_catchment', type: 'text' },
                { name: 'proj_census_division', type: 'text' }, { name: 'proj_start_date', type: 'date' }, { name: 'proj_requested_term', type: 'integer' },
                { name: 'proj_funding_priority', type: 'text' }, { name: 'proj_objective', type: 'text' },
                { name: 'proj_impact_explanation', type: 'text' },
                { name: 'is_collaborative_application', type: 'boolean' }, { name: 'collaborative_agreement_url', type: 'text' },
                { name: 'plan_to_purchase_equipment', type: 'boolean' }, { name: 'equipment_photos', type: 'jsonb' },
                { name: 'proj_why_and_who_benefits', type: 'text' }, { name: 'proj_barriers_explanation', type: 'text' },
                { name: 'proj_anticipated_beneficiaries', type: 'integer' }, { name: 'proj_programs_impacted', type: 'integer' },
                { name: 'proj_staff_volunteers_trained', type: 'integer' }, { name: 'proj_plans_reports_created', type: 'integer' },
                { name: 'proj_pilot_participants', type: 'integer' }, { name: 'is_larger_project', type: 'boolean' },
                { name: 'larger_project_total_cost', type: 'numeric' }, { name: 'larger_project_secured_funding', type: 'numeric' },
                { name: 'larger_project_unsecured_funding_plan', type: 'text' }, { name: 'proj_final_description', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'otf_board_members',
            description: 'Stores board members for an OTF application.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'application_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'otf_applications', column: 'id', onDelete: 'CASCADE' } },
                { name: 'first_name', type: 'text' }, { name: 'last_name', type: 'text' }, { name: 'term_start_date', type: 'date' },
                { name: 'term_end_date', type: 'date' }, { name: 'position', type: 'text' }, { name: 'is_arms_length', type: 'boolean' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'otf_senior_staff',
            description: 'Stores senior staff for an OTF application.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'application_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'otf_applications', column: 'id', onDelete: 'CASCADE' } },
                { name: 'first_name', type: 'text' }, { name: 'last_name', type: 'text' }, { name: 'position', type: 'text' },
                { name: 'is_arms_length', type: 'boolean' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'otf_collaborators',
            description: 'Stores collaborators for an OTF application.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'application_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'otf_applications', column: 'id', onDelete: 'CASCADE' } },
                { name: 'organization_name', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'otf_project_plan',
            description: 'Stores a project plan item for an OTF application.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'application_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'otf_applications', column: 'id', onDelete: 'CASCADE' } },
                { name: 'order', type: 'integer', constraints: 'not null default 0' },
                { name: 'deliverable', type: 'text' },
                { name: 'key_task', type: 'text' },
                { name: 'timing', type: 'text' },
                { name: 'justification', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'otf_budget_items',
            description: 'Stores a budget item for an OTF application.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'application_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'otf_applications', column: 'id', onDelete: 'CASCADE' } },
                { name: 'category', type: 'text' }, { name: 'item_description', type: 'text' },
                { name: 'cost_breakdown', type: 'text' }, { name: 'requested_amount', type: 'numeric' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'otf_quotes',
            description: 'Stores quotes for an OTF application.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'application_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'otf_applications', column: 'id', onDelete: 'CASCADE' } },
                { name: 'file_url', type: 'text' }, { name: 'description', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        },
        {
            tableName: 'otf_larger_project_funding',
            description: 'Stores funding sources for larger projects in an OTF application.',
            columns: [
                { name: 'id', type: 'uuid', constraints: 'primary key default gen_random_uuid()' },
                { name: 'application_id', type: 'uuid', constraints: 'not null', foreignKey: { table: 'otf_applications', column: 'id', onDelete: 'CASCADE' } },
                { name: 'source', type: 'text' }, { name: 'usage_of_funds', type: 'text' }
            ],
            rls: { enable: true, policies: [{ name: 'Public read-write access', command: 'ALL', using: 'true', check: 'true' }] }
        }
    ]
};
