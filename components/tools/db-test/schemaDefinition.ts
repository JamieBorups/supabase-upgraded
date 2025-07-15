import { ModuleDefinition } from './schema/types.ts';
import { coreSchema } from './schema/core.schema.ts';
import { projectsSchema } from './schema/projects.schema.ts';
import { tasksSchema } from './schema/tasks.schema.ts';
import { crmSchema } from './schema/crm.schema.ts';
import { eventsSchema } from './schema/events.schema.ts';
import { salesSchema } from './schema/sales.schema.ts';
import { reportsSchema } from './schema/reports.schema.ts';
import { kpiSchema } from './schema/kpi.schema.ts';

// --- DB SCHEMA DEFINITION ---
// This object defines the entire relational database schema for the application.
export const dbSchema: ModuleDefinition[] = [
    coreSchema,
    projectsSchema,
    tasksSchema,
    crmSchema,
    eventsSchema,
    salesSchema,
    reportsSchema,
    kpiSchema,
];

// Re-export types for easy access from other parts of the tool
export * from './schema/types.ts';
