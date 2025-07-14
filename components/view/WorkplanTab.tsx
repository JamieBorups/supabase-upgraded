
import React, { useState, useMemo } from 'react';
import { FormData, Task, Event, Venue, TaskStatus } from '../../types';
import { useAppContext } from '../../context/AppContext';

const getStatusBadge = (status: TaskStatus | string) => {
    const baseClasses = "px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusMap: Record<string, string> = {
        'Done': "bg-green-100 text-green-800",
        'In Progress': "bg-blue-100 text-blue-800",
        'To Do': "bg-yellow-100 text-yellow-800",
        'Backlog': "bg-slate-100 text-slate-800",
    };
    return `${baseClasses} ${statusMap[status] || statusMap['Backlog']}`;
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div className="bg-white border border-slate-200 rounded-md p-3 flex justify-between items-center shadow-sm">
        <div>
            <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
            <p className="text-xs text-slate-500">Due: {task.dueDate || 'N/A'}</p>
        </div>
        <span className={getStatusBadge(task.status)}>{task.status}</span>
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
    const { tasks: globalTasks } = state;

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
                <h3 className="text-xl font-bold text-slate-800">Project Workplan</h3>
            </div>

            {projectTasks.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-lg">
                    <i className="fa-solid fa-calendar-alt text-6xl text-slate-300"></i>
                    <h3 className="mt-4 text-lg font-medium text-slate-800">No tasks for this project yet.</h3>
                </div>
            ) : (
                <div className="space-y-6">
                    {milestoneGroups.map(({ milestone, tasks: childTasks }) => (
                         <details key={milestone.id} className="bg-slate-100 border border-slate-200 rounded-lg open:shadow-lg" open>
                            <summary className="p-4 font-bold text-lg text-slate-800 cursor-pointer flex justify-between items-center hover:bg-slate-200/70 transition-colors">
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-flag-checkered text-teal-600"></i>
                                    {milestone.title}
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className={getStatusBadge(milestone.status)}>{milestone.status}</span>
                                     <i className="fa-solid fa-chevron-down transform transition-transform details-arrow"></i>
                                </div>
                            </summary>
                            <div className="p-4 border-t border-slate-200 bg-white">
                                <p className="text-sm text-slate-600 mb-4">{milestone.description || 'No description for this milestone.'}</p>
                                {childTasks.length > 0 ? (
                                    <div className="space-y-2">
                                        {childTasks.map(task => (
                                           <TaskCard key={task.id} task={task} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-slate-500">No tasks are assigned to this milestone.</p>
                                )}
                            </div>
                        </details>
                    ))}
                    
                    {unparentedTasks.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-slate-700 border-t pt-4">Top-Level Tasks (Not in a Milestone)</h3>
                            <div className="space-y-2 mt-2">
                               {unparentedTasks.map(task => (
                                   <TaskCard key={task.id} task={task} />
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
