

import { AppState } from '../../../types';
import { TableDefinition } from './schemaDefinition.ts';
import { dbSchema } from './schemaDefinition.ts';
import { mapObjectToSnakeCase } from '../../../services/api_slices/utils';

// --- SQL GENERATION ---
const generateCreateTable = (table: TableDefinition): string => {
    const columns = table.columns.map(col => {
        let colStr = `    "${col.name}" ${col.type}`;
        if (col.constraints) colStr += ` ${col.constraints}`;
        return colStr;
    }).join(',\n');

    const foreignKeys = table.columns.filter(c => c.foreignKey).map(col => {
        const fk = col.foreignKey!;
        let fkStr = `    foreign key ("${col.name}") references public."${fk.table}"("${fk.column}")`;
        if (fk.onDelete) fkStr += ` on delete ${fk.onDelete}`;
        return fkStr;
    }).join(',\n');

    let tableStr = `-- Table: ${table.tableName}\ncreate table if not exists public."${table.tableName}" (\n${columns}`;
    if (foreignKeys) {
        tableStr += `,\n${foreignKeys}`;
    }
    tableStr += '\n);\n';

    return tableStr;
};

const generateAlterTable = (table: TableDefinition): string => {
    return `alter table public."${table.tableName}" enable row level security;`;
}

const generateRlsPolicy = (policy: any, tableName: string): string => {
    let policyStr = `create policy "${policy.name}" on public."${tableName}" for ${policy.command} using (${policy.using})`;
     if (policy.check) {
        policyStr += ` with check (${policy.check});`;
    } else {
        policyStr += ';';
    }
    return policyStr;
};

const generateDropRlsPolicy = (policy: any, tableName: string): string => {
    return `drop policy if exists "${policy.name}" on public."${tableName}";`;
};

// --- DATA DUMP GENERATION ---

const formatSqlValue = (value: any): string => {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }
    if (typeof value === 'number') {
        return String(value);
    }
    if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'object') {
        return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    }
    return 'NULL';
};

// Hardcoded dependency order to guarantee correctness.
const CREATION_ORDER = [
    'app_settings', 'inventory_categories', 'ticket_types', 'members', 'users',
    'venues', 'projects', 'contacts', 'events', 'item_lists', 'sale_sessions',
    'inventory_items', 'project_collaborators', 'contact_projects',
    'budget_items', 'event_members', 'event_tickets', 'tasks',
    'sale_listings', 'activities', 'direct_expenses', 'sales_transactions',
    'sales_transaction_items', 'reports', 'highlights', 'news_releases', 'interactions',
    'proposal_snapshots', 'ecostar_reports', 'interest_compatibility_reports',
    'sdg_alignment_reports', 'recreation_framework_reports', 'research_plans', 'research_plan_communities'
];

export const generateSchemaCreationSql = (): string => {
    const allTablesMap = new Map(dbSchema.flatMap(m => m.tables).map(t => [t.tableName, t]));
    
    const tablesInCreationOrder = CREATION_ORDER.map(name => allTablesMap.get(name)).filter((t): t is TableDefinition => !!t);
    const tablesForDropping = [...tablesInCreationOrder].reverse();

    let sql = `
-- =============================================
-- ========== ARTS INCUBATOR DB SCHEMA =========
-- =============================================
-- Generated on: ${new Date().toISOString()}
-- Version: 1.1.0
-- =============================================

-- Drop existing tables in reverse order of creation to respect dependencies
`;
    tablesForDropping.forEach(table => {
        sql += `DROP TABLE IF EXISTS public."${table.tableName}" CASCADE;\n`;
    });

    sql += "\n\n-- Create tables\n";
    tablesInCreationOrder.forEach(table => {
        sql += `${generateCreateTable(table)}\n`;
    });
    sql += "\n\n-- Enable RLS and create policies\n";
    tablesInCreationOrder.forEach(table => {
        sql += `\n-- RLS for ${table.tableName}\n`;
        if (table.rls && table.rls.enable) {
            table.rls.policies.forEach(policy => {
                sql += `${generateDropRlsPolicy(policy, table.tableName)}\n`;
            });
            sql += `${generateAlterTable(table)}\n`;
            table.rls.policies.forEach(policy => {
                sql += `${generateRlsPolicy(policy, table.tableName)}\n`;
            });
        }
    });

    return sql;
};

const generateInsertStatementsForTables = (tableNames: string[], allTables: TableDefinition[], state: AppState): string => {
    let sql = ``;

    const stateToTableMap: { [key: string]: keyof AppState } = {
        'app_settings': 'settings', 'members': 'members', 'users': 'users', 'projects': 'projects',
        'tasks': 'tasks', 'activities': 'activities', 'direct_expenses': 'directExpenses', 'reports': 'reports',
        'highlights': 'highlights', 'news_releases': 'newsReleases', 'contacts': 'contacts', 'interactions': 'interactions',
        'venues': 'venues', 'events': 'events', 'ticket_types': 'ticketTypes', 'event_tickets': 'eventTickets',
        'proposal_snapshots': 'proposals', 'inventory_categories': 'inventoryCategories', 'inventory_items': 'inventoryItems',
        'sale_sessions': 'saleSessions', 'sale_listings': 'saleListings', 'item_lists': 'itemLists',
        'sales_transactions': 'salesTransactions', 'ecostar_reports': 'ecostarReports',
        'interest_compatibility_reports': 'interestCompatibilityReports', 'sdg_alignment_reports': 'sdgAlignmentReports',
        'recreation_framework_reports': 'recreationFrameworkReports', 'research_plans': 'researchPlans'
    };

    const extraProcessingMap: { [key: string]: (state: AppState) => any[] } = {
        'project_collaborators': (state) => state.projects.flatMap(p => p.collaboratorDetails.map(c => ({ project_id: p.id, member_id: c.memberId, role: c.role }))),
        'budget_items': (state) => state.projects.flatMap(p => {
            if (!p.budget) return [];
            const revenues = Object.entries(p.budget.revenues).flatMap(([category, items]) => Array.isArray(items) ? items.map(item => ({ ...item, project_id: p.id, type: 'revenue', category })) : []);
            const expenses = Object.entries(p.budget.expenses).flatMap(([category, items]) => items.map(item => ({ ...item, project_id: p.id, type: 'expense', category })));
            return [...revenues, ...expenses];
        }),
        'contact_projects': (state) => state.contacts.flatMap(c => c.associatedProjectIds.map(pid => ({ contact_id: c.id, project_id: pid }))),
        'event_members': (state) => state.events.flatMap(e => (e.assignedMembers || []).map(am => ({ event_id: e.id, member_id: am.memberId, role: am.role }))),
        'sales_transaction_items': (state) => state.salesTransactions.flatMap(tx => tx.items.map(item => ({ ...item, transaction_id: tx.id }))),
        'research_plan_communities': (state) => state.researchPlans.flatMap(plan => (plan.communities || []).map(community => ({ research_plan_id: plan.id, ...community }))),
    };
    
    const tablesToProcess = tableNames.map(name => allTables.find(t => t.tableName === name)).filter((t): t is TableDefinition => !!t);

    for (const table of tablesToProcess) {
        sql += `\n-- Data for table: ${table.tableName}\n`;
        
        const data = extraProcessingMap[table.tableName]
            ? extraProcessingMap[table.tableName](state)
            : stateToTableMap[table.tableName]
            ? (state[stateToTableMap[table.tableName]] as any[])
            : [];
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
            sql += `-- No data found for ${table.tableName}\n\n`;
            continue;
        }

        let rows = Array.isArray(data) ? [...data] : [data];

        // Data integrity checks and sorting
        if (table.tableName === 'users') {
            const memberIds = new Set(state.members.map(m => m.id));
            const originalCount = rows.length;
            rows = rows.filter(user => {
                const isValid = !user.memberId || memberIds.has(user.memberId);
                if (!isValid) { console.warn(`[SQL DUMP] Filtering out user '${user.username}' (ID: ${user.id}) due to missing member_id: ${user.memberId}`); }
                return isValid;
            });
            if (rows.length < originalCount) { sql += `-- WARNING: ${originalCount - rows.length} user(s) were filtered out due to inconsistent member_id links.\n`; }
        }

        if (table.tableName === 'tasks') { rows.sort((a, b) => { if (a.parentTaskId === null && b.parentTaskId !== null) return -1; if (a.parentTaskId !== null && b.parentTaskId === null) return 1; return 0; }); }
        if (table.tableName === 'events') { rows.sort((a, b) => { if (a.parentEventId === null && b.parentEventId !== null) return -1; if (a.parentEventId !== null && b.parentEventId === null) return 1; return 0; }); }

        for (const row of rows) {
            if (row === null || typeof row !== 'object') continue;

            const snakeRow = mapObjectToSnakeCase(row);
            
            const columns = table.columns
                .map(c => c.name)
                .filter(c => snakeRow[c] !== undefined);

            if (columns.length === 0) continue;

            const values = columns.map(colName => formatSqlValue(snakeRow[colName]));
            
            sql += `INSERT INTO public."${table.tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sql += '\n';
    }
    return sql;
};

export const generateDataDumpSqlParts = (state: AppState): { dataPart1: string, dataPart2: string, dataPart3: string, dataPart4: string } => {
    const allTables = dbSchema.flatMap(module => module.tables);

    const dataOrderPart1 = [
        'app_settings', 'inventory_categories', 'ticket_types', 'members', 'users',
    ];
    const dataPart1 = generateInsertStatementsForTables(dataOrderPart1, allTables, state);

    const dataOrderPart2 = [
        'venues', 'projects', 'contacts', 'events', 'item_lists', 'sale_sessions', 'inventory_items',
    ];
    const dataPart2 = generateInsertStatementsForTables(dataOrderPart2, allTables, state);

    const dataOrderPart3 = [
        'project_collaborators', 'contact_projects', 'budget_items', 'event_members', 
        'event_tickets', 'tasks', 'sale_listings',
    ];
    const dataPart3 = generateInsertStatementsForTables(dataOrderPart3, allTables, state);

    const dataOrderPart4 = [
        'activities', 'direct_expenses', 'sales_transactions', 'sales_transaction_items',
        'reports', 'highlights', 'news_releases', 'interactions', 'proposal_snapshots',
        'ecostar_reports', 'interest_compatibility_reports', 'sdg_alignment_reports', 
        'recreation_framework_reports', 'research_plans', 'research_plan_communities'
    ];
    const dataPart4 = generateInsertStatementsForTables(dataOrderPart4, allTables, state);
    
    return { dataPart1, dataPart2, dataPart3, dataPart4 };
};