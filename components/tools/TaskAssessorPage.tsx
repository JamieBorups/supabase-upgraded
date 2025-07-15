
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Page, Task, TaskStatus } from '../../types';
import { Select } from '../ui/Select';

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


const TaskAssessorPage: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
    const { state, dispatch } = useAppContext();
    const { projects, tasks } = state;
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    const projectOptions = useMemo(() => [
        { value: '', label: 'Select a project to assess...' },
        ...projects.map(p => ({ value: p.id, label: p.projectTitle }))
    ], [projects]);

    const selectedProject = useMemo(() => {
        if (!selectedProjectId) return null;
        return projects.find(p => p.id === selectedProjectId);
    }, [selectedProjectId, projects]);

    const { milestoneGroups, unparentedTasks, hasTasks } = useMemo(() => {
        if (!selectedProjectId) {
            return { milestoneGroups: [], unparentedTasks: [], hasTasks: false };
        }
        
        const tasksForProject = tasks.filter(task => task.projectId === selectedProjectId);
        if (tasksForProject.length === 0) {
            return { milestoneGroups: [], unparentedTasks: [], hasTasks: false };
        }
        
        const milestones = tasksForProject
            .filter(t => t.taskType === 'Milestone')
            .sort((a, b) => (a.orderBy || 0) - (b.orderBy || 0));

        const tasksByParent = tasksForProject.reduce((acc, task) => {
            if (task.taskType !== 'Milestone') {
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

        const milestoneGroupsData = milestones.map(milestone => ({
            milestone,
            tasks: tasksByParent[milestone.id] || []
        }));
        
        const unparentedTasksData = tasksByParent['unparented'] || [];

        return { 
            milestoneGroups: milestoneGroupsData,
            unparentedTasks: unparentedTasksData,
            hasTasks: tasksForProject.length > 0
        };
    }, [selectedProjectId, tasks]);

    const handleStartWorkshop = () => {
        if (!selectedProjectId) return;
        
        dispatch({
            type: 'SET_ACTIVE_WORKSHOP_ITEM',
            payload: {
                type: 'task',
                itemId: `new_${selectedProjectId}` 
            }
        });
        onNavigate('aiWorkshop');
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-slate-900">AI Task Generator</h1>
            <p className="text-slate-500 mt-1 mb-6">Use the AI Workshop to generate or refine a comprehensive, phased workplan for your project.</p>
            
            <div className="max-w-4xl mx-auto mt-6">
                <div className="max-w-md mb-6">
                    <Select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} options={projectOptions} />
                </div>

                {selectedProject ? (
                    <div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">{selectedProject.projectTitle}</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {selectedProject.projectStartDate ? new Date(selectedProject.projectStartDate).toLocaleDateString() : 'No start date'} - {selectedProject.projectEndDate ? new Date(selectedProject.projectEndDate).toLocaleDateString() : 'No end date'}
                            </p>
                        </div>
                        
                        {hasTasks ? (
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
                                            <h4 className="font-semibold text-slate-700 mb-2">Tasks for this milestone:</h4>
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
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-slate-300 rounded-lg mt-6">
                                <p className="text-slate-500">No tasks exist for this project yet.</p>
                            </div>
                        )}
                        
                        <div className="mt-8 text-center border-t pt-6">
                             <button
                                onClick={handleStartWorkshop}
                                className="px-6 py-3 text-base font-semibold text-white bg-teal-600 border border-transparent rounded-md shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all hover:scale-105"
                            >
                                <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                                {hasTasks ? 'Review & Refine Workplan' : 'Generate Workplan'}
                            </button>
                            <p className="text-xs text-slate-500 mt-2">
                                {hasTasks 
                                    ? 'This will open the AI Workshop where you can get suggestions for additional tasks to complete the workplan.' 
                                    : 'This will open the AI Workshop to generate an initial workplan for this project.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-lg">
                        <i className="fa-solid fa-arrow-up text-5xl text-slate-400"></i>
                        <h3 className="mt-4 text-xl font-medium text-slate-700">Select a project to begin.</h3>
                        <p className="text-slate-500 mt-2">Choose a project from the dropdown above to start the assessment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskAssessorPage;
