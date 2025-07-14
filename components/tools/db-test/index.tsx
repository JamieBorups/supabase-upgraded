
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext.tsx';
import { AccordionItem } from '../schema-report/SchemaReport.components.tsx';
import { generateSchemaCreationSql, generateDataDumpSqlParts } from './sqlGenerator.ts';

const DbTestPage: React.FC = () => {
    const { state } = useAppContext();
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['schema_creation']));
    const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});

    const toggleSection = (key: string) => {
        setOpenSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
        setCopySuccess({}); // Reset all copy statuses when toggling sections
    };

    const { schemaSql, dataPart1, dataPart2, dataPart3, dataPart4 } = useMemo(() => {
        if (!state.loading) {
            const schema = generateSchemaCreationSql();
            const dataParts = generateDataDumpSqlParts(state);
            return { schemaSql: schema, ...dataParts };
        }
        return { schemaSql: '-- Loading...', dataPart1: '-- Loading...', dataPart2: '-- Loading...', dataPart3: '-- Loading...', dataPart4: '-- Loading...' };
    }, [state]);

    const handleCopy = (sql: string, partKey: string) => {
        navigator.clipboard.writeText(sql).then(() => {
            setCopySuccess({ [partKey]: true });
            setTimeout(() => setCopySuccess(prev => ({ ...prev, [partKey]: false })), 2000);
        }, () => {
            alert('Failed to copy SQL to clipboard.');
        });
    };
    
    const replicationParts = [
        { 
            key: 'data_part1', 
            title: 'Part 1: Foundational Data', 
            description: 'Run this first. This script inserts foundational data like settings, members, and users.',
            sql: dataPart1
        },
        { 
            key: 'data_part2', 
            title: 'Part 2: Core Structural Data', 
            description: 'Run this second. This script inserts core structural data like projects, events, and inventory.',
            sql: dataPart2
        },
        { 
            key: 'data_part3', 
            title: 'Part 3: Relational & Task Data', 
            description: 'Run this third. This script links foundational data (collaborators, budget items) and inserts all tasks.',
            sql: dataPart3
        },
        { 
            key: 'data_part4', 
            title: 'Part 4: Transactional & Log Data', 
            description: 'Run this last. This script inserts all remaining dependent data like activities and financial transactions.',
            sql: dataPart4
        }
    ];

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-slate-900">Database Replication</h1>
            <p className="text-slate-500 mt-1 mb-6">Use these tools to create a new database or back up an existing one. Follow the steps in order.</p>

            <div className="space-y-6">
                <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-lg">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Step 1: Create Database Schema</h2>
                    <p className="text-sm text-slate-600 mb-4">Run this script in your Supabase SQL editor on a new, empty database. It will drop any old tables and create the entire required schema.</p>
                    <AccordionItem
                        key="schema_creation"
                        title="Show Schema Creation SQL"
                        description="Contains all DROP TABLE and CREATE TABLE statements."
                        isOpen={openSections.has('schema_creation')}
                        onToggle={() => toggleSection('schema_creation')}
                    >
                        <div className="relative">
                            <button
                                onClick={() => handleCopy(schemaSql, 'schema')}
                                className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 z-10"
                            >
                                {copySuccess['schema'] ? 'Copied!' : 'Copy SQL'}
                            </button>
                            <pre className="bg-slate-900 text-white p-4 rounded-md overflow-x-auto text-xs max-h-[60vh]">
                                <code>{schemaSql}</code>
                            </pre>
                        </div>
                    </AccordionItem>
                </div>

                <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-lg">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Step 2: Import Data</h2>
                    <p className="text-sm text-slate-600 mb-4">After the schema is created, run these four data dump scripts in order. They have been broken into smaller parts to avoid size limits in the SQL editor.</p>
                    <div className="space-y-4">
                        {replicationParts.map(part => (
                            <AccordionItem
                                key={part.key}
                                title={part.title}
                                description={part.description}
                                isOpen={openSections.has(part.key)}
                                onToggle={() => toggleSection(part.key)}
                            >
                                <div className="relative">
                                    <button
                                        onClick={() => handleCopy(part.sql, part.key)}
                                        className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 z-10"
                                    >
                                        {copySuccess[part.key] ? 'Copied!' : 'Copy SQL'}
                                    </button>
                                    <pre className="bg-slate-900 text-white p-4 rounded-md overflow-x-auto text-xs max-h-[60vh]">
                                        <code>{part.sql}</code>
                                    </pre>
                                </div>
                            </AccordionItem>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DbTestPage;
