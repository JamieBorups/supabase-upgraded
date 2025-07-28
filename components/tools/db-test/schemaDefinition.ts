
import type { ModuleDefinition } from './schema/types.schema';
export * from './schema/types.schema';

import { coreSchema } from './schema/core.schema.ts';
import { projectsSchema } from './schema/projects.schema.ts';
import { budgetSchema } from './schema/budget.schema.ts';
import { eventsSchema } from './schema/events.schema.ts';
import { crmSchema } from './schema/crm.schema.ts';
import { reportsSchema } from './schema/reports.schema.ts';
import { salesSchema } from './schema/sales.schema.ts';
import { otfSchema } from './schema/otf.schema.ts';
import { nohfcSchema } from './schema/nohfc.schema.ts';
import { risksSchema } from './schema/risks.schema.ts';
import { infrastructureSchema } from './schema/infrastructure.schema.ts';

// This object defines the entire relational database schema for the application.
export const dbSchema: ModuleDefinition[] = [
    coreSchema,
    projectsSchema,
    budgetSchema,
    eventsSchema,
    crmSchema,
    reportsSchema,
    salesSchema,
    otfSchema,
    nohfcSchema,
    risksSchema,
    infrastructureSchema,
];
