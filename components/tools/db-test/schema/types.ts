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
