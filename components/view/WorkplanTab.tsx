import React, { useState, useMemo } from 'react';
import { FormData, Task, Event, Venue, TaskStatus } from '../../types';
import { useAppContext } from '../../context/AppContext';

const getStatusBadge = (status: TaskStatus | string, theme: any) => {
    const baseClasses = "px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusMap: Record<string, { bg: string; text: string }> = {
        'Done': { bg: theme.statusSuccessBg, text: theme.statusSuccessText },
        'In Progress': { bg: theme.statusInfoBg, text: theme.statusInfoText },
        'To Do': { bg: theme.statusWarningBg, text: theme.statusWarningText },
        'Backlog': { bg: theme.surfaceMuted, text: theme.textDefault },
    };
    const style = statusMap[status] || statusMap['Backlog'];
    return <span className={baseClasses} style={{ backgroundColor: style.bg, color: style.text }}>{status}</span>;
};

const TaskCard: React.FC<{ task: Task; theme: any }> = ({ task, theme }) => (
    <div className="border p-3 flex justify-between items-center shadow-sm" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-subtle)', borderRadius: '0.375rem' }}>
        <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)'}}>{task.title}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)'}}>Due: {task.dueDate || 'N/A'}</p>
        </div>
        {getStatusBadge(task.status, theme)}
    </div>
);

interface WorkplanTabProps {
    project: FormData;
    isSnapshot?: boolean;
    tasks?: Task[];
    events: Event[];
    venues: Venue[];
}

const WorkplanTab: React.FC<WorkplanTabProps> = ({ project, isSnapshot = false, tasks: tasksFromProps, events, venues }) => {
    const { state } = useAppContext();
    const { tasks: globalTasks, settings: { theme } } = state;

    const projectTasks = useMemo(() => tasksFromProps ?? globalTasks.filter(t => t.projectId === project.id), [globalTasks, tasksFromProps, project.id]);
    
    const { milestoneGroups, unparentedTasks } = useMemo(() => {
        const milestones = projectTasks
            .filter(t => t.taskType === 'Milestone')
            .sort((a,b) => (a.orderBy || 0) - (b.orderBy || 0));
            
        const tasksByParent = projectTasks.reduce((acc, task) => {
            if(task.taskType !== 'Milestone') {
                const parentId = task.parentTaskId || 'unparented';
                if (!acc[parentId]) acc[parentId] = [];
                acc[parentId].push(task);
            }
            return acc;
        }, {} as Record<string, Task[]>);

        // Sort tasks within each group
        Object.keys(tasksByParent).forEach(parentId => {
            tasksByParent[parentId].sort((a,b) => (a.orderBy || 0) - (b.orderBy || 0));
        });

        const groups = milestones.map(milestone => ({
            milestone,
            tasks: tasksByParent[milestone.id] || []
        }));
        
        const unparented = tasksByParent['unparented'] || [];

        return { milestoneGroups: groups, unparentedTasks: unparented };
    }, [projectTasks]);

    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-heading)'}}>Project Workplan</h3>
            </div>

            {projectTasks.length === 0 ? (
                <div className="text-center py-16 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)'}}>
                    <i className="fa-solid fa-calendar-alt text-6xl" style={{ color: 'var(--color-border-default)'}}></i>
                    <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--color-text-heading)'}}>No tasks for this project yet.</h3>
                </div>
            ) : (
                <div className="space-y-6">
                    {milestoneGroups.map(({ milestone, tasks: childTasks }) => (
                         <details key={milestone.id} className="border rounded-lg open:shadow-lg" open style={{ backgroundColor: 'var(--color-surface-muted)', borderColor: 'var(--color-border-subtle)'}}>
                            <summary className="p-4 font-bold text-lg cursor-pointer flex justify-between items-center list-none" style={{ color: 'var(--color-text-heading)'}}>
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-flag-checkered" style={{ color: 'var(--color-primary)'}}></i>
                                    {milestone.title}
                                </div>
                                <div className="flex items-center gap-4">
                                     {getStatusBadge(milestone.status, theme)}
                                     <i className="fa-solid fa-chevron-down transform transition-transform details-arrow"></i>
                                </div>
                            </summary>
                            <div className="p-4 border-t" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-subtle)'}}>
                                <p className="text-sm mb-4" style={{ color: 'var(--color-text-default)'}}>{milestone.description || 'No description for this milestone.'}</p>
                                {childTasks.length > 0 ? (
                                    <div className="space-y-2">
                                        {childTasks.map(task => (
                                           <TaskCard key={task.id} task={task} theme={theme} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm italic" style={{ color: 'var(--color-text-muted)'}}>No tasks are assigned to this milestone.</p>
                                )}
                            </div>
                        </details>
                    ))}
                    
                    {unparentedTasks.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold border-t pt-4" style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-border-subtle)'}}>Top-Level Tasks (Not in a Milestone)</h3>
                            <div className="space-y-2 mt-2">
                               {unparentedTasks.map(task => (
                                   <TaskCard key={task.id} task={task} theme={theme} />
                               ))}
                           </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default WorkplanTab;